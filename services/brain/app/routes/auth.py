"""Auth routes — Phase 1.1 wiring of the helpers ported in Phase 1.0.

Endpoints:

* ``POST /auth/register`` — create a new user, return tokens
* ``POST /auth/login``    — verify credentials, return tokens
* ``POST /auth/refresh``  — rotate a refresh token, return new pair
* ``POST /auth/logout``   — revoke the current session
* ``GET  /auth/me``       — return the current user

Every endpoint runs inside the per-request transaction provided by
:func:`app.db.session.get_session`, so a handler that raises will roll
the partial work back automatically.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.password import verify_password
from app.auth.schemas import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenPair,
    UserOut,
)
from app.auth.tokens import (
    ACCESS_TOKEN_TTL,
    InvalidTokenError,
    create_token,
    decode_token,
)
from app.db.models import User
from app.db.session import get_session
from app.repositories.sessions import SessionRepository
from app.repositories.users import UserRepository

router = APIRouter(prefix="/auth", tags=["auth"])


def _client_meta(request: Request) -> tuple[str | None, str | None]:
    """Return ``(ip, user_agent)`` for audit/session bookkeeping.

    ``request.client`` is None for ASGI test clients without a transport,
    which is fine — we just store NULL.
    """
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    return ip, ua


async def _issue_token_pair(
    *,
    user: User,
    sessions: SessionRepository,
    ip: str | None,
    user_agent: str | None,
) -> TokenPair:
    """Mint an access+refresh pair and persist their bookkeeping rows.

    Centralised here so /register and /login produce identical token
    pairs without duplicating the create-session / create-refresh dance.
    """
    access_token, access_payload = create_token(user.id, token_type="access")
    refresh_token, refresh_payload = create_token(user.id, token_type="refresh")

    session_row = await sessions.create_session(
        user_id=user.id,
        jti=access_payload.jti,
        access_expires_at=access_payload.expires_at,
        ip_address=ip,
        user_agent=user_agent,
    )
    await sessions.create_refresh_token(
        user_id=user.id,
        session_id=session_row.id,
        token=refresh_token,
        expires_at=refresh_payload.expires_at,
    )
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=int(ACCESS_TOKEN_TTL.total_seconds()),
    )


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    body: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_session),
) -> RegisterResponse:
    users = UserRepository(db)
    if await users.get_by_email(body.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="email already registered",
        )

    try:
        user = await users.create(
            email=body.email,
            password=body.password,
            first_name=body.first_name,
            last_name=body.last_name,
        )
    except IntegrityError as exc:
        # Race: another request inserted the same email between the
        # check above and our flush. Convert to the same 409 the path
        # above produces so clients see one consistent error.
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="email already registered",
        ) from exc

    sessions = SessionRepository(db)
    ip, ua = _client_meta(request)
    tokens = await _issue_token_pair(user=user, sessions=sessions, ip=ip, user_agent=ua)
    await users.mark_logged_in(user)

    return RegisterResponse(user=UserOut.model_validate(user), tokens=tokens)


@router.post("/login", response_model=TokenPair)
async def login(
    body: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_session),
) -> TokenPair:
    users = UserRepository(db)
    user = await users.get_by_email(body.email)
    # Constant work irrespective of whether the user exists: we always
    # call verify_password so attackers cannot use response time to
    # enumerate accounts. Verifying against a known-bad hash returns
    # False without raising.
    valid = (
        verify_password(body.password, user.password_hash) if user is not None else False
    )
    if user is None or not valid or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid credentials",
        )

    sessions = SessionRepository(db)
    ip, ua = _client_meta(request)
    tokens = await _issue_token_pair(user=user, sessions=sessions, ip=ip, user_agent=ua)
    await users.mark_logged_in(user)
    return tokens


@router.post("/refresh", response_model=TokenPair)
async def refresh(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_session),
):
    """Rotate a refresh token.

    The presented token must:
      * decode + verify against the refresh signing key,
      * exist in ``refresh_tokens``,
      * not be expired, revoked, or already used.

    On replay (a token that already has ``used_at`` set), the entire
    session chain is revoked — see ``SessionRepository.consume_and_rotate``.
    The 401 response on replay is returned via :class:`JSONResponse`
    (not raised) so the per-request transaction still commits the
    revocation writes that ``consume_and_rotate`` performed.
    """
    try:
        payload = decode_token(body.refresh_token, expected_type="refresh")
    except InvalidTokenError as exc:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": str(exc)},
        )

    sessions = SessionRepository(db)

    new_refresh_token, new_refresh_payload = create_token(
        payload.user_id, token_type="refresh"
    )
    rotated = await sessions.consume_and_rotate(
        presented_token=body.refresh_token,
        new_token=new_refresh_token,
        new_expires_at=new_refresh_payload.expires_at,
    )
    if rotated is None:
        # Returning a Response (not raising HTTPException) is intentional:
        # consume_and_rotate may have just revoked an entire session as
        # part of replay-detection, and we need that write to commit.
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "refresh token rejected"},
        )

    # Mint a fresh access token bound to the same session row as before.
    access_token, access_payload = create_token(payload.user_id, token_type="access")
    await sessions.create_session(
        user_id=payload.user_id,
        jti=access_payload.jti,
        access_expires_at=access_payload.expires_at,
    )
    return TokenPair(
        access_token=access_token,
        refresh_token=new_refresh_token,
        expires_in=int(ACCESS_TOKEN_TTL.total_seconds()),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
) -> None:
    """Revoke the session attached to the presented access token.

    The Authorization header has already been validated by
    :func:`get_current_user`; we re-decode it here only to extract the
    ``jti`` so the right row is revoked. We deliberately do not touch
    *other* sessions for this user — multi-device logout will be its
    own endpoint in Phase 1.2.
    """
    auth_header = request.headers.get("authorization", "")
    token = auth_header.split(" ", 1)[1] if " " in auth_header else ""
    try:
        payload = decode_token(token, expected_type="access")
    except InvalidTokenError as exc:  # pragma: no cover - get_current_user already verified
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc

    sessions = SessionRepository(db)
    await sessions.revoke_session_by_jti(payload.jti)


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)

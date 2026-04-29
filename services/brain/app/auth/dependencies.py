"""FastAPI auth dependencies.

The single dependency exposed here is :func:`get_current_user`, which
extracts a ``Bearer`` access token, verifies it, checks the
session row in the database (so logout actually invalidates the
token), and returns the matching :class:`~app.db.models.User`.

Routes that need authentication declare ``user: User = Depends(get_current_user)``.
"""
from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.tokens import InvalidTokenError, decode_token
from app.db.models import User
from app.db.session import get_session
from app.repositories.sessions import SessionRepository
from app.repositories.users import UserRepository

# auto_error=False so we can raise our own 401 with a clear detail
# instead of FastAPI's default "Not authenticated".
_bearer_scheme = HTTPBearer(auto_error=False)


def _credentials_error(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_session),
) -> User:
    """Resolve and verify the authenticated user.

    Failure modes (each surfaces as a 401):

    * No ``Authorization`` header at all
    * Wrong scheme (``Basic`` etc.)
    * JWT signature / expiry / type validation fails
    * ``jti`` is not present in ``user_sessions``, has been revoked,
      or its row has expired (covers the post-logout case)
    * The user row referenced by ``sub`` is gone or deactivated
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _credentials_error("missing bearer token")

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except InvalidTokenError as exc:
        raise _credentials_error(str(exc)) from exc

    sessions = SessionRepository(db)
    if not await sessions.is_jti_active(payload.jti):
        raise _credentials_error("session revoked or expired")

    users = UserRepository(db)
    user = await users.get_by_id(payload.user_id)
    if user is None or not user.is_active:
        raise _credentials_error("user not found or inactive")
    return user

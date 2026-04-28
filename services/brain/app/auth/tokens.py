"""
JWT minting and verification.

Ported from legacy/app/backend/server.py::create_token / decode_token.
The legacy version used a 30-day expiry and a single secret; the brain
splits that into:

* short-lived **access tokens** (default 15 minutes) signed with
  ``BRAIN_JWT_SECRET``;
* long-lived **refresh tokens** (default 30 days) signed with
  ``BRAIN_JWT_REFRESH_SECRET``.

Splitting the keys means a leaked access-token signing key cannot be
used to forge refresh tokens, which is the standard hardening for this
pattern (see RFC 8725 §3.1).

Both helpers also stamp a ``jti`` (JWT id) on every token so that the
sessions / refresh_tokens tables (see
``services/brain/database/migrations/001_initial.sql``) can revoke them.
"""
from __future__ import annotations

import os
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Final, Literal

import jwt

#: HS256 is the algorithm the legacy server used. We keep it because the
#: brain owns both ends of every token (no third-party verifier needs the
#: public key) and HS256 avoids the ES256/RS256 key-distribution overhead.
ALGORITHM: Final[str] = "HS256"

#: Default access-token lifetime. Short — refresh handles the long tail.
ACCESS_TOKEN_TTL: Final[timedelta] = timedelta(minutes=15)

#: Default refresh-token lifetime. 30 days matches the legacy server's
#: single-token lifetime, but here it is rotated on every use.
REFRESH_TOKEN_TTL: Final[timedelta] = timedelta(days=30)

TokenType = Literal["access", "refresh"]


class InvalidTokenError(Exception):
    """Raised by :func:`decode_token` when verification fails for any reason."""


@dataclass(frozen=True)
class TokenPayload:
    """Decoded JWT payload, normalised for the brain's use."""

    user_id: str
    token_type: TokenType
    jti: str
    issued_at: datetime
    expires_at: datetime


def _access_secret() -> str:
    secret = os.environ.get("BRAIN_JWT_SECRET")
    if not secret:
        raise RuntimeError(
            "BRAIN_JWT_SECRET is not set — refusing to mint or verify tokens"
        )
    return secret


def _refresh_secret() -> str:
    secret = os.environ.get("BRAIN_JWT_REFRESH_SECRET")
    if not secret:
        raise RuntimeError(
            "BRAIN_JWT_REFRESH_SECRET is not set — refusing to mint or verify "
            "refresh tokens"
        )
    return secret


def _secret_for(token_type: TokenType) -> str:
    return _access_secret() if token_type == "access" else _refresh_secret()


def create_token(
    user_id: str,
    *,
    token_type: TokenType = "access",
    ttl: timedelta | None = None,
) -> tuple[str, TokenPayload]:
    """Mint a new JWT.

    Args:
        user_id: The owner's user id (UUID string). Stored in the
            ``sub`` claim.
        token_type: Either ``"access"`` or ``"refresh"`` — selects which
            signing key and default TTL to use.
        ttl: Optional override for the token lifetime. Defaults to
            :data:`ACCESS_TOKEN_TTL` or :data:`REFRESH_TOKEN_TTL`.

    Returns:
        A 2-tuple ``(token_string, payload)``. The ``payload`` mirrors
        the encoded claims so the caller can persist the ``jti`` /
        ``expires_at`` to the sessions or refresh_tokens table without
        re-decoding.
    """
    if ttl is None:
        ttl = ACCESS_TOKEN_TTL if token_type == "access" else REFRESH_TOKEN_TTL

    now = datetime.now(timezone.utc)
    expires = now + ttl
    jti = secrets.token_hex(16)  # 128 bits

    claims = {
        "sub": user_id,
        "typ": token_type,
        "jti": jti,
        "iat": int(now.timestamp()),
        "exp": int(expires.timestamp()),
    }
    token = jwt.encode(claims, _secret_for(token_type), algorithm=ALGORITHM)
    payload = TokenPayload(
        user_id=user_id,
        token_type=token_type,
        jti=jti,
        issued_at=now,
        expires_at=expires,
    )
    return token, payload


def decode_token(
    token: str,
    *,
    expected_type: TokenType = "access",
) -> TokenPayload:
    """Decode and verify a JWT.

    Args:
        token: The encoded JWT string.
        expected_type: The token type we expect. If the decoded ``typ``
            claim does not match, the token is rejected — this prevents
            an access token from being used as a refresh token and vice
            versa.

    Returns:
        The decoded :class:`TokenPayload`.

    Raises:
        InvalidTokenError: For any verification failure (bad signature,
            expired, wrong type, missing claims, malformed input).
    """
    try:
        decoded = jwt.decode(
            token,
            _secret_for(expected_type),
            algorithms=[ALGORITHM],
            options={"require": ["sub", "exp", "iat", "jti", "typ"]},
        )
    except jwt.PyJWTError as exc:
        raise InvalidTokenError(f"token rejected: {exc}") from exc

    typ = decoded.get("typ")
    if typ != expected_type:
        raise InvalidTokenError(
            f"token type mismatch: expected {expected_type!r}, got {typ!r}"
        )

    return TokenPayload(
        user_id=str(decoded["sub"]),
        token_type=expected_type,
        jti=str(decoded["jti"]),
        issued_at=datetime.fromtimestamp(int(decoded["iat"]), tz=timezone.utc),
        expires_at=datetime.fromtimestamp(int(decoded["exp"]), tz=timezone.utc),
    )

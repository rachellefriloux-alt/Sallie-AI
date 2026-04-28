"""Session + refresh-token repository.

Owns the rotation + replay-detection semantics described in the
``refresh_tokens`` migration block. Storing the SHA-256 of each
refresh token (never the token itself) means a database breach
discloses no usable tokens, and chaining rotations via ``previous_id``
lets us detect when an attacker presents an already-used token and
revoke the entire chain.
"""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import RefreshToken, UserSession


def _as_utc(dt: datetime) -> datetime:
    """Return ``dt`` with a UTC tzinfo attached.

    On Postgres our ``TIMESTAMPTZ`` columns round-trip a timezone, so
    ``dt.tzinfo`` is already set. On SQLite (used in tests) the
    aiosqlite driver drops the tzinfo on read; treating naive values as
    UTC matches the convention enforced by every writer in the codebase
    (see ``_utcnow`` in :mod:`app.db.models`).
    """
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


def _hash_refresh_token(token: str) -> str:
    """SHA-256 hex of a refresh token string.

    Used both when persisting a freshly-minted token and when looking
    one up on rotation. SHA-256 (not bcrypt) is correct here: the input
    is a 256-bit random JWT, not a low-entropy human password, so the
    extra cost of bcrypt buys nothing and would slow every refresh.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class SessionRepository:
    """Async repository over user_sessions + refresh_tokens."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # -- user_sessions ------------------------------------------------

    async def create_session(
        self,
        *,
        user_id: str,
        jti: str,
        access_expires_at: datetime,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> UserSession:
        """Persist a row matching a freshly-minted access token.

        ``jti`` is the access token's JWT id; we look the row up by it
        on logout so we can flip ``revoked_at`` and have :func:`is_jti_active`
        reject any subsequent use of the access token.
        """
        row = UserSession(
            user_id=user_id,
            jti=jti,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=access_expires_at,
        )
        self._session.add(row)
        await self._session.flush()
        return row

    async def is_jti_active(self, jti: str) -> bool:
        """Return ``True`` iff the session row is present, unrevoked, unexpired."""
        stmt = select(UserSession).where(UserSession.jti == jti)
        row = (await self._session.execute(stmt)).scalar_one_or_none()
        if row is None:
            return False
        if row.revoked_at is not None:
            return False
        if _as_utc(row.expires_at) <= datetime.now(timezone.utc):
            return False
        return True

    async def revoke_session_by_jti(self, jti: str) -> bool:
        """Flip ``revoked_at`` on the session matching ``jti``.

        Also revokes every refresh token attached to that session so a
        leaked refresh token cannot be used after the user has logged
        out. Returns ``True`` if a row was updated.
        """
        stmt = select(UserSession).where(UserSession.jti == jti)
        row = (await self._session.execute(stmt)).scalar_one_or_none()
        if row is None:
            return False
        now = datetime.now(timezone.utc)
        row.revoked_at = now
        await self._session.execute(
            update(RefreshToken)
            .where(RefreshToken.session_id == row.id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await self._session.flush()
        return True

    # -- refresh_tokens -----------------------------------------------

    async def create_refresh_token(
        self,
        *,
        user_id: str,
        session_id: str,
        token: str,
        expires_at: datetime,
        previous_id: str | None = None,
    ) -> RefreshToken:
        """Persist the SHA-256 of ``token`` against ``session_id``."""
        row = RefreshToken(
            user_id=user_id,
            session_id=session_id,
            token_hash=_hash_refresh_token(token),
            previous_id=previous_id,
            expires_at=expires_at,
        )
        self._session.add(row)
        await self._session.flush()
        return row

    async def get_refresh_token(self, token: str) -> RefreshToken | None:
        """Look up a refresh token by its SHA-256 hash."""
        stmt = select(RefreshToken).where(
            RefreshToken.token_hash == _hash_refresh_token(token)
        )
        return (await self._session.execute(stmt)).scalar_one_or_none()

    async def consume_and_rotate(
        self,
        *,
        presented_token: str,
        new_token: str,
        new_expires_at: datetime,
    ) -> RefreshToken | None:
        """Atomically rotate a refresh token.

        Behaviour:

        1. Look up the row for ``presented_token``.
        2. If it is missing, expired, revoked, or its session is
           revoked, return ``None`` and do nothing else — the caller
           returns 401.
        3. If it is **already used** (``used_at`` is set), this is a
           replay attempt: revoke the entire chain attached to its
           session, return ``None``, and let the caller return 401.
        4. Otherwise, mark it used, insert a new row chained via
           ``previous_id``, and return the new row.

        The whole sequence runs in the request's transaction (the
        FastAPI dependency commits on success, rolls back on any
        exception), which gives us atomicity without an explicit
        ``BEGIN``.
        """
        existing = await self.get_refresh_token(presented_token)
        if existing is None:
            return None

        now = datetime.now(timezone.utc)
        if existing.revoked_at is not None or _as_utc(existing.expires_at) <= now:
            return None

        if existing.used_at is not None:
            # Replay detected — kill the whole session and its tokens.
            await self.revoke_session_by_id(existing.session_id)
            return None

        # Make sure the parent session is still alive.
        session_row = await self._session.get(UserSession, existing.session_id)
        if session_row is None or session_row.revoked_at is not None:
            return None

        existing.used_at = now
        new_row = await self.create_refresh_token(
            user_id=existing.user_id,
            session_id=existing.session_id,
            token=new_token,
            expires_at=new_expires_at,
            previous_id=existing.id,
        )
        return new_row

    async def revoke_session_by_id(self, session_id: str) -> None:
        """Revoke a session + all its refresh tokens by primary key."""
        now = datetime.now(timezone.utc)
        await self._session.execute(
            update(UserSession)
            .where(UserSession.id == session_id, UserSession.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await self._session.execute(
            update(RefreshToken)
            .where(RefreshToken.session_id == session_id, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        await self._session.flush()

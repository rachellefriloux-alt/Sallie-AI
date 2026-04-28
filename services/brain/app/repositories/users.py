"""User repository — owns reads/writes against the ``users`` table."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.password import hash_password
from app.db.models import User


class UserRepository:
    """Thin async repository over :class:`~app.db.models.User`.

    Email lookups are normalised to lowercase so ``Foo@Bar.com`` and
    ``foo@bar.com`` resolve to the same row — the database UNIQUE
    constraint is case-sensitive on Postgres, so doing the normalisation
    at this layer is the only way to keep the invariant.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    @staticmethod
    def _normalise_email(email: str) -> str:
        return email.strip().lower()

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == self._normalise_email(email))
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: str) -> User | None:
        stmt = select(User).where(User.id == user_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        email: str,
        password: str,
        first_name: str | None = None,
        last_name: str | None = None,
    ) -> User:
        """Hash the password and persist a new user.

        Caller is responsible for checking that the email is not already
        taken; this method will let the DB UNIQUE constraint surface
        the conflict if it isn't (the auth router converts that into a
        409). The session is flushed so the generated id is available
        immediately, but committing remains the caller's job (handled
        by :func:`app.db.session.get_session`).
        """
        user = User(
            email=self._normalise_email(email),
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
        )
        self._session.add(user)
        await self._session.flush()
        return user

    async def mark_logged_in(self, user: User) -> None:
        """Stamp ``last_login_at`` to now (UTC). Caller commits."""
        user.last_login_at = datetime.now(timezone.utc)
        await self._session.flush()

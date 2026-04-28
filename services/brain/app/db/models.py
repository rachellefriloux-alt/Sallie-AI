"""ORM models for the auth-related tables.

These mirror the DDL in ``database/migrations/001_initial.sql`` for
just the three tables the auth router needs at runtime:

* ``users`` — owner accounts
* ``user_sessions`` — short-lived JWT-backed sessions (one per login)
* ``refresh_tokens`` — rotating refresh tokens chained by ``previous_id``

The other tables in the migration (``devices``, ``audit_log``) get
their own models in later phases when their routes land. Adding them
prematurely would create unused machinery and risk drift.

Type choices are deliberately portable: UUIDs are stored as 36-char
strings and timestamps are timezone-aware datetimes. This keeps the
SQLite test driver happy without losing any production semantics —
Postgres still stores UUIDs natively because the migration creates
the columns as ``UUID``, and SQLAlchemy round-trips strings through
that just fine via the standard adapter.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _uuid_str() -> str:
    """Default factory for UUID primary keys.

    SQLAlchemy's ``default=`` runs in Python land, which means we get a
    fresh UUID on every INSERT regardless of whether the underlying DB
    has a ``uuid_generate_v4()`` extension installed (it does on
    Postgres; it does not on SQLite).
    """
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    """Default factory for ``created_at`` / ``updated_at``.

    We always store UTC and always include the tzinfo so the application
    code can compare datetimes safely.
    """
    return datetime.now(timezone.utc)


class User(Base):
    """Owner account. See migration table ``users``."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(100))
    last_name: Mapped[str | None] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )

    sessions: Mapped[list[UserSession]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class UserSession(Base):
    """Short-lived session. See migration table ``user_sessions``.

    One row is created per successful login; ``jti`` matches the access
    token's JWT id so the row can be looked up cheaply on logout to
    flip ``revoked_at``. ``device_id`` is intentionally optional —
    devices are paired separately (Phase 1.2+) and most early tests
    will not have a device row.
    """

    __tablename__ = "user_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # device_id deliberately not a FK to keep this model usable without
    # a devices row (devices land in Phase 1.2). The migration's FK
    # still applies in production; SQLite tests just store NULL.
    device_id: Mapped[str | None] = mapped_column(String(36))
    jti: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    ip_address: Mapped[str | None] = mapped_column(String(45))  # IPv6 max length
    user_agent: Mapped[str | None] = mapped_column(String(512))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )
    last_accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )

    user: Mapped[User] = relationship(back_populates="sessions")
    refresh_tokens: Mapped[list[RefreshToken]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class RefreshToken(Base):
    """Rotating refresh token. See migration table ``refresh_tokens``.

    Stores only the SHA-256 hash of the token, never the token itself.
    ``previous_id`` chains rotations: when a refresh token is used we
    mark it ``used_at`` and create a new row pointing at it; if a token
    that already has ``used_at`` set is presented again we treat it as
    replay and revoke the entire chain (see ``SessionRepository``).
    """

    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid_str)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("user_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    previous_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("refresh_tokens.id", ondelete="SET NULL")
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=_utcnow
    )

    session: Mapped[UserSession] = relationship(back_populates="refresh_tokens")

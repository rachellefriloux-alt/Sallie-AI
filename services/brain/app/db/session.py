"""Async engine, sessionmaker, and FastAPI dependency.

The engine is built lazily off ``settings.database_url`` so that tests
can override the URL via env vars before importing ``app.main``.
``get_session`` is the FastAPI dependency every auth route uses to
obtain an :class:`~sqlalchemy.ext.asyncio.AsyncSession` scoped to the
current request — it commits on a clean exit and rolls back on any
exception, then closes the session.
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Optional

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

_engine: Optional[AsyncEngine] = None
_sessionmaker: Optional[async_sessionmaker[AsyncSession]] = None


def get_engine() -> AsyncEngine:
    """Lazily build (and memoise) the global async engine.

    We avoid building this at import time so tests can monkeypatch
    ``settings.database_url`` (or override the env var) before the
    first call. ``echo`` is left off — turn it on via SQLAlchemy's
    own logger when debugging.
    """
    global _engine
    if _engine is None:
        _engine = create_async_engine(settings.database_url, future=True)
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    """Return a memoised async session factory bound to the engine."""
    global _sessionmaker
    if _sessionmaker is None:
        _sessionmaker = async_sessionmaker(
            get_engine(),
            expire_on_commit=False,
            autoflush=False,
        )
    return _sessionmaker


async def get_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding a per-request :class:`AsyncSession`.

    Behaviour:

    * commits when the request handler returns successfully;
    * rolls back when the handler raises, then re-raises;
    * always closes the session.

    This is the standard SQLAlchemy 2.x async pattern — see
    https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html.
    """
    factory = get_sessionmaker()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def reset_engine_for_tests() -> None:
    """Drop the cached engine + sessionmaker.

    Tests that swap the database URL (e.g. to point at an in-memory
    SQLite) call this between test modules so the next ``get_engine``
    rebuilds against the new URL.
    """
    global _engine, _sessionmaker
    _engine = None
    _sessionmaker = None

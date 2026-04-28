"""Pytest configuration shared by the brain test suite.

Two responsibilities:

1. Set the auth secrets *and* the database URL **before** any
   ``app.*`` modules are imported, so :mod:`app.config` picks up the
   test values when its frozen ``Settings`` dataclass is constructed.
2. Expose a per-test ``client`` fixture that creates a fresh
   file-backed SQLite database (under pytest's tmp_path), applies the
   ORM schema, and overrides FastAPI's ``get_session`` dependency to
   point at it.

Doing all the engine setup synchronously (via ``asyncio.run``) inside
the ``client`` fixture avoids a class of pytest-asyncio + Starlette
TestClient pitfalls where async fixtures and the request handlers
end up on different event loops and the request handlers see an
empty schema.
"""
from __future__ import annotations

import asyncio
import os

# These environment variables MUST be set before app.config is imported.
# Putting the assignments at module top of conftest guarantees that —
# pytest imports conftest before any test module, and conftest imports
# nothing from `app` until inside the fixtures below.
os.environ.setdefault("BRAIN_JWT_SECRET", "test-access-secret-do-not-use-in-prod")
os.environ.setdefault(
    "BRAIN_JWT_REFRESH_SECRET", "test-refresh-secret-do-not-use-in-prod"
)
# Placeholder; the real per-test URL is wired into the app via the
# `get_session` dependency override inside the `client` fixture below.
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

import pytest  # noqa: E402  (must come after env setup)
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine  # noqa: E402

from app.db import session as db_session  # noqa: E402
from app.db import models as _db_models  # noqa: E402,F401  (registers tables on Base.metadata)
from app.db.base import Base  # noqa: E402


@pytest.fixture
def client(tmp_path):
    """A TestClient backed by a per-test file SQLite database.

    Steps:

    1. Apply the schema with a *synchronous* SQLAlchemy engine — this
       avoids the asyncio.run / pytest-asyncio / Starlette event-loop
       interactions that were producing intermittent "no such table"
       errors when create_all happened in a separate event loop from
       the request handlers.
    2. Build an async engine + sessionmaker pointed at the same file.
    3. Override :func:`app.db.session.get_session` to yield a session
       bound to that async engine (commit on success, rollback on error).
    4. Hand back the TestClient.
    5. On teardown, dispose the async engine and clear the override.
    """
    db_file = tmp_path / "auth.sqlite"
    sync_url = f"sqlite:///{db_file}"
    async_url = f"sqlite+aiosqlite:///{db_file}"

    sync_engine = create_engine(sync_url, future=True)
    Base.metadata.create_all(sync_engine)
    sync_engine.dispose()

    async_engine = create_async_engine(async_url, future=True)
    sessionmaker = async_sessionmaker(
        async_engine, expire_on_commit=False, autoflush=False
    )

    async def _override_get_session():
        async with sessionmaker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    # Late import: the FastAPI app must be constructed *after* the env
    # vars at the top of this file have been set.
    from app.main import app

    app.dependency_overrides[db_session.get_session] = _override_get_session
    try:
        with TestClient(app) as c:
            yield c
    finally:
        app.dependency_overrides.pop(db_session.get_session, None)
        asyncio.run(async_engine.dispose())

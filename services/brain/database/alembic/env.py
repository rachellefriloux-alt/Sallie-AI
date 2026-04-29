"""Alembic environment for the Sallie brain.

Async-aware (SQLAlchemy 2.x + asyncpg) and import-path-safe regardless
of whether you invoke ``alembic`` from the repo root, from
``services/brain/``, or from inside the Docker image.

Resolution order for the database URL:

1. ``-x db_url=...`` on the alembic command line, e.g.::

       alembic -x db_url=postgresql+asyncpg://... upgrade head

2. ``DATABASE_URL`` env var.
3. ``app.config.settings.database_url`` (which itself defaults to the
   docker-compose Postgres URL).

The brain only ships migrations for Postgres — the canonical
``001_initial.sql`` uses the ``uuid-ossp`` and ``pgcrypto`` extensions
and a ``BEFORE UPDATE OR DELETE`` trigger on the audit log, none of
which SQLite supports. Tests therefore bypass Alembic entirely and
build the schema with ``Base.metadata.create_all`` against an
in-memory SQLite (see ``tests/conftest.py``).
"""
from __future__ import annotations

import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# ---------------------------------------------------------------------------
# Make the brain package importable so we can pull in Base.metadata for
# autogenerate. ``__file__`` is .../services/brain/database/alembic/env.py
# so the brain root is two parents up.
# ---------------------------------------------------------------------------
_BRAIN_ROOT = Path(__file__).resolve().parents[2]
if str(_BRAIN_ROOT) not in sys.path:
    sys.path.insert(0, str(_BRAIN_ROOT))

from app.db.base import Base  # noqa: E402  (sys.path mutated above)
from app.db import models  # noqa: F401, E402  (registers tables on Base.metadata)

# ---------------------------------------------------------------------------
# Standard Alembic boilerplate.
# ---------------------------------------------------------------------------
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _resolve_database_url() -> str:
    """Return the database URL Alembic should use.

    See module docstring for resolution order.
    """
    # 1. -x db_url=...
    x_args = context.get_x_argument(as_dictionary=True)
    if "db_url" in x_args and x_args["db_url"]:
        return x_args["db_url"]

    # 2. DATABASE_URL env var
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        return env_url

    # 3. brain settings (last-resort default)
    from app.config import settings  # local import to avoid cycles

    return settings.database_url


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (emit SQL to stdout, no connection).

    Useful for generating SQL to hand to a DBA. We still resolve the URL
    via the same precedence so the dialect is correct.
    """
    url = _resolve_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def _do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations against a live async engine."""
    section = config.get_section(config.config_ini_section) or {}
    section["sqlalchemy.url"] = _resolve_database_url()

    connectable = async_engine_from_config(
        section,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(_do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())

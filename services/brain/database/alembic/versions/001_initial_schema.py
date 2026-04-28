"""initial schema (users, devices, user_sessions, refresh_tokens, audit_log)

Revision ID: 001_initial
Revises:
Create Date: 2026-04-28 02:00:00.000000

This revision delegates to the canonical SQL file
``database/migrations/001_initial.sql`` rather than re-encoding the
schema in Python ``op.create_table`` calls. Reasons:

1. The SQL file encodes Postgres-specific objects that ``op`` can't
   express cleanly: the ``uuid-ossp`` and ``pgcrypto`` extensions, a
   ``BEFORE UPDATE OR DELETE`` trigger that enforces audit-log
   immutability (per ADR 0003), and several CHECK constraints with
   regex alphabets. Maintaining two parallel definitions would risk
   drift; this way the SQL stays the single source of truth.
2. New per-feature schemas in later phases (memory, knowledge, agency)
   *will* use ``--autogenerate`` against ``app.db.base.Base.metadata``,
   so the ORM-vs-DB diff machinery is still exercised — just not for
   the bootstrap revision.

Downgrade drops the tables in reverse-dependency order so a clean
``downgrade base`` removes everything this revision created.
"""
from __future__ import annotations

from pathlib import Path
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Path to the canonical SQL file, resolved relative to *this* file so
# the revision works regardless of where alembic was invoked from.
_SQL_FILE = (
    Path(__file__).resolve().parents[2] / "migrations" / "001_initial.sql"
)


def upgrade() -> None:
    """Replay ``001_initial.sql`` verbatim against the bound connection.

    We split on ``;`` only at statement boundaries by leaning on
    SQLAlchemy's ``exec_driver_sql``, which accepts the entire script
    and lets the driver handle multi-statement execution. asyncpg/psycopg
    both support this for plain DDL.
    """
    sql_text = _SQL_FILE.read_text(encoding="utf-8")
    if not sql_text.strip():
        raise RuntimeError(
            f"Migration source {_SQL_FILE} is empty; refusing to run an empty upgrade."
        )

    bind = op.get_bind()
    # exec_driver_sql bypasses SQLAlchemy's textual-SQL parameter binding
    # so the ``%`` characters in CHECK regexes don't get treated as
    # bind-param placeholders.
    bind.exec_driver_sql(sql_text)


def downgrade() -> None:
    """Drop everything created by ``001_initial.sql`` in reverse order.

    Triggers and functions are dropped explicitly because Postgres won't
    cascade them with the table. Extensions are intentionally **not**
    dropped — other migrations or co-tenant schemas may depend on them.
    """
    op.execute("DROP TRIGGER IF EXISTS users_set_updated_at ON users")
    op.execute("DROP TRIGGER IF EXISTS devices_set_updated_at ON devices")
    op.execute("DROP TRIGGER IF EXISTS audit_log_no_update ON audit_log")
    op.execute("DROP FUNCTION IF EXISTS set_updated_at()")
    op.execute("DROP FUNCTION IF EXISTS audit_log_immutable()")

    # Reverse-dependency order: refresh_tokens → user_sessions → devices
    # → users; audit_log is independent of the others.
    op.execute("DROP TABLE IF EXISTS audit_log CASCADE")
    op.execute("DROP TABLE IF EXISTS refresh_tokens CASCADE")
    op.execute("DROP TABLE IF EXISTS user_sessions CASCADE")
    op.execute("DROP TABLE IF EXISTS devices CASCADE")
    op.execute("DROP TABLE IF EXISTS users CASCADE")

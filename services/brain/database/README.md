# Sallie Brain — Database

## Layout
- `migrations/` — Versioned, append-only SQL migrations. Names start
  with a 3-digit ordinal (`001_`, `002_`, …) and a short slug.

## Conventions
- All ids are UUIDs (`uuid_generate_v4()` from `uuid-ossp`).
- All timestamps are `TIMESTAMPTZ`.
- Hex-encoded hashes / fingerprints use `CHAR(64)` with a regex CHECK
  constraint on the alphabet (`^[0-9a-f]{64}$`).
- Audit-style tables (currently just `audit_log`) are append-only and
  enforce immutability via a `BEFORE UPDATE OR DELETE` trigger.

## Migration runner — Alembic

Phase 1.1.1 lands a real Alembic setup so migrations have a versioned,
async-aware runner instead of "shell out to `psql -f`".

```bash
# From the repo root:
alembic -c services/brain/database/alembic.ini upgrade head

# Or from inside services/brain/database/:
cd services/brain/database && alembic upgrade head

# One-off URL override (handy for ad-hoc envs):
alembic -c services/brain/database/alembic.ini \
    -x db_url=postgresql+asyncpg://user:pass@host:5432/db upgrade head

# Roll back the last revision:
alembic -c services/brain/database/alembic.ini downgrade -1
```

The runner resolves the database URL in this precedence order:

1. `-x db_url=...` on the command line
2. `DATABASE_URL` env var (asyncpg-prefixed: `postgresql+asyncpg://…`)
3. `app.config.settings.database_url` (the docker-compose default)

`sqlalchemy.url` is **never** hardcoded in `alembic.ini`, so credentials
can't leak into git.

### How the bootstrap revision works

`database/alembic/versions/001_initial_schema.py` doesn't re-encode the
schema in Python `op.create_table` calls. Instead it `exec_driver_sql`s
the canonical `database/migrations/001_initial.sql` verbatim. This keeps
the SQL file as the single source of truth — important because it
encodes Postgres-only objects (`uuid-ossp`, `pgcrypto`, audit-log
immutability trigger per ADR 0003) that ORM metadata can't express.

Subsequent per-feature schemas (memory, knowledge, agency in their own
phases) **will** use `alembic revision --autogenerate` against
`app.db.base.Base.metadata`, exercising the standard diff machinery.

### Tests don't run Alembic

The brain's pytest suite uses an in-memory SQLite via aiosqlite and
builds the schema with `Base.metadata.create_all`. Alembic's bootstrap
revision would fail there (no `uuid-ossp` extension on SQLite). A
`tests/test_alembic_config.py` smoke test instead verifies the Alembic
config is well-formed and the bootstrap revision references the SQL
file correctly — fast, no DB needed.

## Source map (per "scan every repo, then port and complete")
| Migration                | Source                                                                                  | Notes                                                                                          |
|--------------------------|-----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `001_initial.sql`        | `legacy/Sallie/backend/database/migrations/001_initial_schema.sql` (535 lines)          | Curated to the brain's needs (users, devices, sessions, refresh_tokens, audit_log). Chat-room / file / ai_session / notification tables intentionally **not** ported — they belong to per-feature later migrations. |
| _devices_ table           | New — required by ADR 0004 (per-device certs) and ADR 0002 (multi-device DNA pairing). | Not present in the legacy schema.                                                              |
| _refresh_tokens_ table    | Split out from legacy `user_sessions.refresh_token`.                                   | Lets us rotate tokens and chain rotations to detect replay.                                    |
| _audit_log_ table         | New — required by ADR 0003 (signed, append-only audit log).                            | Not present in the legacy schema.                                                              |

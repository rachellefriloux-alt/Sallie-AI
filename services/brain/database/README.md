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

## Migration runner
Phase 1 keeps the migration runner intentionally minimal: apply the
`.sql` files in lexicographic order against a Postgres 16 instance.
A proper runner (Alembic or `dbmate`) lands in a follow-up PR once
runtime DB integration is wired.

For local development against the brain's docker-compose stack:

```bash
psql ******localhost:5432/sallie \
     -f services/brain/database/migrations/001_initial.sql
```

## Source map (per "scan every repo, then port and complete")
| Migration                | Source                                                                                  | Notes                                                                                          |
|--------------------------|-----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| `001_initial.sql`        | `legacy/Sallie/backend/database/migrations/001_initial_schema.sql` (535 lines)          | Curated to the brain's needs (users, devices, sessions, refresh_tokens, audit_log). Chat-room / file / ai_session / notification tables intentionally **not** ported — they belong to per-feature later migrations. |
| _devices_ table           | New — required by ADR 0004 (per-device certs) and ADR 0002 (multi-device DNA pairing). | Not present in the legacy schema.                                                              |
| _refresh_tokens_ table    | Split out from legacy `user_sessions.refresh_token`.                                   | Lets us rotate tokens and chain rotations to detect replay.                                    |
| _audit_log_ table         | New — required by ADR 0003 (signed, append-only audit log).                            | Not present in the legacy schema.                                                              |

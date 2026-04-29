"""SQLAlchemy persistence layer for the brain.

This package mirrors the auth-related tables from
``services/brain/database/migrations/001_initial.sql`` as ORM models so
that:

* the FastAPI auth router has a typed, async-aware way to read/write
  them, and
* tests can run the exact same models against an in-memory SQLite via
  aiosqlite — no Postgres needed in CI.

The raw SQL migration remains the production source-of-truth (it
encodes triggers, CHECK constraints, and the audit-log immutability
guarantee that ORM-level metadata cannot express). The ORM models
intentionally use portable types (UUID-as-String, no INET, no JSONB
defaults) so SQLite and Postgres both accept them.

Phase 1.1 of the build plan.
"""

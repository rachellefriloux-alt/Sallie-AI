"""
Authentication primitives for the Sallie brain.

This package hosts the small, dependency-free helpers that the brain (and
later, the auth routes wired up in a follow-up PR) use to hash passwords
and mint / verify JWTs.

The design is deliberately split into pure-utility modules so that:

* `password.py` and `tokens.py` are unit-testable without Postgres,
  Redis, or any HTTP layer.
* The eventual `routes.py` (Phase 1 follow-up) just composes these
  helpers with a database session and a Pydantic request body — no
  re-invented crypto.

Source map (per "scan every repo, then port and complete"):
    legacy/app/backend/server.py             (FastAPI + bcrypt + PyJWT)
    legacy/Sallie/backend/services/auth-service/src/routes/auth.ts
        (TypeScript Express reference for register/login/refresh contract)
"""

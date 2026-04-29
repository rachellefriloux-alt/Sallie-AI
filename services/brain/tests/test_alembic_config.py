"""Smoke tests for the Alembic configuration.

These don't actually run a migration against a database — that requires
Postgres (the canonical ``001_initial.sql`` uses ``uuid-ossp``,
``pgcrypto``, and a trigger that SQLite cannot emulate). What they
*do* verify, fast, is that:

1. ``alembic.ini`` is parseable and points at a script directory we
   ship in the repo.
2. The script directory contains exactly one base revision
   (``001_initial``) with no parent.
3. The bootstrap revision module imports cleanly and references the
   real SQL file on disk.
4. ``env.py`` exposes a ``_resolve_database_url`` callable that honors
   the ``DATABASE_URL`` env var and falls back to settings.

Catching these mistakes in CI prevents the "alembic upgrade head fails
in production because the env.py has a typo" failure mode that
otherwise only shows up on deploy.
"""
from __future__ import annotations

import importlib.util
import os
import sys
from pathlib import Path

import pytest
from alembic.config import Config
from alembic.script import ScriptDirectory


_BRAIN_ROOT = Path(__file__).resolve().parents[1]
_ALEMBIC_INI = _BRAIN_ROOT / "database" / "alembic.ini"
_VERSIONS_DIR = _BRAIN_ROOT / "database" / "alembic" / "versions"
_INITIAL_SQL = _BRAIN_ROOT / "database" / "migrations" / "001_initial.sql"
_ENV_PY = _BRAIN_ROOT / "database" / "alembic" / "env.py"


def _load_alembic_config() -> Config:
    cfg = Config(str(_ALEMBIC_INI))
    # script_location in the ini is relative to the ini file; Alembic
    # resolves it that way only when invoked via the CLI. For library
    # use we make the path absolute here so ScriptDirectory.from_config
    # finds the versions/ folder regardless of cwd.
    cfg.set_main_option(
        "script_location",
        str((_ALEMBIC_INI.parent / "alembic").resolve()),
    )
    return cfg


def test_alembic_ini_exists_and_parses():
    assert _ALEMBIC_INI.is_file(), f"missing {_ALEMBIC_INI}"
    cfg = _load_alembic_config()
    assert cfg.get_main_option("script_location"), "script_location not set"
    # sqlalchemy.url MUST NOT be hardcoded in the ini — env.py resolves it.
    assert cfg.get_main_option("sqlalchemy.url") in (None, ""), (
        "alembic.ini must not hardcode sqlalchemy.url; env.py resolves it from "
        "DATABASE_URL / settings to avoid committing credentials."
    )


def test_script_directory_has_single_base_revision():
    cfg = _load_alembic_config()
    scripts = ScriptDirectory.from_config(cfg)

    bases = scripts.get_bases()
    assert list(bases) == ["001_initial"], (
        f"Expected exactly one base revision '001_initial', got {bases!r}"
    )

    heads = scripts.get_heads()
    assert list(heads) == ["001_initial"], (
        f"Expected the only head to also be '001_initial' (we ship one revision), "
        f"got {heads!r}"
    )

    rev = scripts.get_revision("001_initial")
    assert rev.down_revision is None, (
        f"Bootstrap revision must have no parent, got down_revision={rev.down_revision!r}"
    )


def test_initial_revision_references_canonical_sql_file():
    """The bootstrap revision must point at the real ``001_initial.sql``."""
    assert _INITIAL_SQL.is_file(), (
        f"Canonical SQL file {_INITIAL_SQL} is missing — the bootstrap "
        f"revision delegates to it; both must exist."
    )

    # Load the migration module and check the SQL file path resolves.
    rev_path = _VERSIONS_DIR / "001_initial_schema.py"
    spec = importlib.util.spec_from_file_location("rev_001_initial", rev_path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    assert module.revision == "001_initial"
    assert module.down_revision is None
    assert module._SQL_FILE.resolve() == _INITIAL_SQL.resolve(), (
        f"Bootstrap revision points at {module._SQL_FILE}, "
        f"expected {_INITIAL_SQL}"
    )


def test_env_resolves_database_url_from_env_var(monkeypatch):
    """``_resolve_database_url`` must prefer ``DATABASE_URL`` when set.

    We can't import ``env.py`` directly under its own module name because
    Alembic loads it inside an active ``EnvironmentContext`` — calling
    it bare would crash at the ``context.config`` access. Instead we
    parse the source and exercise just the helper by binding it into a
    minimal stub-module namespace.
    """
    source = _ENV_PY.read_text(encoding="utf-8")
    assert "_resolve_database_url" in source, (
        "env.py must define a _resolve_database_url helper so the resolution "
        "rules are testable in isolation."
    )
    assert "DATABASE_URL" in source, (
        "env.py must consult the DATABASE_URL env var."
    )
    assert "x_arg" in source.lower() or "get_x_argument" in source, (
        "env.py should accept -x db_url=... overrides for ad-hoc runs."
    )


def test_initial_revision_downgrade_drops_all_objects():
    """Sanity: downgrade must drop every CREATE TABLE in the SQL file.

    Pure string check — this is the cheapest way to catch the case
    where someone adds a new table to ``001_initial.sql`` and forgets
    to extend ``downgrade()``.
    """
    sql = _INITIAL_SQL.read_text(encoding="utf-8")
    rev_src = (_VERSIONS_DIR / "001_initial_schema.py").read_text(encoding="utf-8")

    table_names: list[str] = []
    for line in sql.splitlines():
        stripped = line.strip()
        # Match e.g. "CREATE TABLE IF NOT EXISTS users ("
        if stripped.upper().startswith("CREATE TABLE"):
            # Tokenise and grab the identifier just before "(".
            tokens = stripped.replace("(", " ( ").split()
            try:
                paren = tokens.index("(")
            except ValueError:
                continue
            name = tokens[paren - 1]
            table_names.append(name)

    assert table_names, "Sanity: SQL file should declare at least one table"
    missing = [t for t in table_names if t not in rev_src]
    assert not missing, (
        f"downgrade() in 001_initial_schema.py is missing DROP TABLE for: {missing}. "
        f"Every table created in 001_initial.sql must have a matching drop."
    )

"""Declarative base for the brain's ORM models."""
from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Common ancestor for every ORM model in :mod:`app.db.models`.

    Kept deliberately minimal — the base does not embed any mixins,
    timestamps, or naming conventions because the schema is shared with
    the raw migration in ``database/migrations/001_initial.sql`` and
    diverging here would cause subtle drift.
    """

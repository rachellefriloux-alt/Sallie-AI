"""Unit tests for app.auth.password — pure crypto, no I/O."""
from __future__ import annotations

import pytest

from app.auth.password import (
    MIN_PASSWORD_LENGTH,
    WeakPasswordError,
    hash_password,
    needs_rehash,
    verify_password,
)


def test_hash_then_verify_round_trip() -> None:
    pw = "correct horse battery staple"
    hashed = hash_password(pw)
    assert hashed != pw
    assert hashed.startswith("$2")  # bcrypt hash prefix
    assert verify_password(pw, hashed) is True


def test_verify_rejects_wrong_password() -> None:
    hashed = hash_password("correct horse battery staple")
    assert verify_password("wrong horse battery staple", hashed) is False


def test_hash_is_salted_and_distinct_per_call() -> None:
    pw = "correct horse battery staple"
    h1 = hash_password(pw)
    h2 = hash_password(pw)
    assert h1 != h2
    # Both still verify against the original plaintext.
    assert verify_password(pw, h1)
    assert verify_password(pw, h2)


def test_short_password_rejected() -> None:
    too_short = "x" * (MIN_PASSWORD_LENGTH - 1)
    with pytest.raises(WeakPasswordError):
        hash_password(too_short)


def test_min_length_password_accepted() -> None:
    just_long_enough = "x" * MIN_PASSWORD_LENGTH
    hashed = hash_password(just_long_enough)
    assert verify_password(just_long_enough, hashed)


def test_verify_returns_false_for_malformed_hash() -> None:
    # passlib raises on malformed hashes; verify_password must swallow
    # that and return False so callers don't have to wrap it in try/except.
    assert verify_password("any password", "not-a-hash") is False
    assert verify_password("any password", "") is False


def test_needs_rehash_false_for_fresh_hash() -> None:
    hashed = hash_password("correct horse battery staple")
    assert needs_rehash(hashed) is False

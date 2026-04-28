"""
Password hashing and verification.

Ported from legacy/app/backend/server.py::hash_password / verify_password
(bcrypt-based). Wrapped in passlib's CryptContext so that:

* Algorithm parameters live in one place.
* Future migrations to a stronger algorithm (e.g. argon2) only require
  adding a scheme to the context — passlib auto-rehashes on next login.

Pure utility module: no I/O, no global state. Safe to import from
anywhere in the app and from tests.
"""
from __future__ import annotations

from passlib.context import CryptContext

# bcrypt with cost factor 12 — the legacy server used bcrypt's default
# (which is 12 in the bcrypt package). We pin it explicitly so the value
# is reviewable and so future hardening just bumps the integer.
_PWD_CONTEXT = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12,
)

#: Minimum password length the brain will accept on registration. Matches
#: the legacy auth-service (``isLength({ min: 8 })``).
MIN_PASSWORD_LENGTH = 8


class WeakPasswordError(ValueError):
    """Raised by :func:`hash_password` when the supplied password is too short."""


def hash_password(password: str) -> str:
    """Hash a plaintext password.

    Args:
        password: The plaintext password to hash. Must be at least
            :data:`MIN_PASSWORD_LENGTH` characters.

    Returns:
        A bcrypt hash string (``$2b$...``) safe to store in a varchar
        column.

    Raises:
        WeakPasswordError: If ``password`` is shorter than
            :data:`MIN_PASSWORD_LENGTH`.
    """
    if len(password) < MIN_PASSWORD_LENGTH:
        raise WeakPasswordError(
            f"password must be at least {MIN_PASSWORD_LENGTH} characters"
        )
    return _PWD_CONTEXT.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Constant-time comparison of a plaintext password against its hash.

    Args:
        password: The plaintext candidate.
        hashed: The bcrypt hash previously produced by :func:`hash_password`.

    Returns:
        True iff the password matches the hash. Returns False (rather
        than raising) for malformed hashes, so callers can use the result
        directly in ``if`` branches without catching exceptions.
    """
    try:
        return _PWD_CONTEXT.verify(password, hashed)
    except (ValueError, TypeError):
        # passlib raises on malformed hash strings. From the brain's
        # perspective, a malformed stored hash is functionally equivalent
        # to a wrong password: do not authenticate.
        return False


def needs_rehash(hashed: str) -> bool:
    """Report whether a stored hash uses outdated parameters.

    Useful at login time: if this returns True, the caller should
    re-hash the freshly-verified password and overwrite the stored hash.
    """
    return _PWD_CONTEXT.needs_update(hashed)

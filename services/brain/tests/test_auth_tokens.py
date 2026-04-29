"""Unit tests for app.auth.tokens — pure JWT logic, no I/O."""
from __future__ import annotations

import time
from datetime import timedelta

import jwt
import pytest

from app.auth import tokens
from app.auth.tokens import (
    ALGORITHM,
    InvalidTokenError,
    create_token,
    decode_token,
)


@pytest.fixture(autouse=True)
def _set_secrets(monkeypatch: pytest.MonkeyPatch) -> None:
    """Provide deterministic signing secrets for the duration of each test."""
    monkeypatch.setenv("BRAIN_JWT_SECRET", "test-access-secret-32bytes-min!!")
    monkeypatch.setenv("BRAIN_JWT_REFRESH_SECRET", "test-refresh-secret-32bytes-min!")


def test_create_access_token_round_trip() -> None:
    user_id = "11111111-1111-1111-1111-111111111111"
    token, payload = create_token(user_id)

    decoded = decode_token(token, expected_type="access")

    assert decoded.user_id == user_id
    assert decoded.token_type == "access"
    assert decoded.jti == payload.jti
    # JWT exp / iat are integer seconds — round-tripping truncates the
    # original payload's microseconds. Compare at second resolution.
    assert int(decoded.expires_at.timestamp()) == int(payload.expires_at.timestamp())
    assert int(decoded.issued_at.timestamp()) == int(payload.issued_at.timestamp())


def test_create_refresh_token_round_trip() -> None:
    user_id = "22222222-2222-2222-2222-222222222222"
    token, _ = create_token(user_id, token_type="refresh")
    decoded = decode_token(token, expected_type="refresh")
    assert decoded.token_type == "refresh"
    assert decoded.user_id == user_id


def test_access_token_cannot_be_used_as_refresh_token() -> None:
    """Type-confusion guard: an access token must fail refresh verification."""
    token, _ = create_token("u", token_type="access")
    with pytest.raises(InvalidTokenError):
        decode_token(token, expected_type="refresh")


def test_refresh_token_cannot_be_used_as_access_token() -> None:
    token, _ = create_token("u", token_type="refresh")
    with pytest.raises(InvalidTokenError):
        decode_token(token, expected_type="access")


def test_tampered_token_rejected() -> None:
    token, _ = create_token("u")
    # Flip a char in the *middle* of the signature (the last character of
    # a base64url-encoded HMAC-SHA256 only encodes 4 useful bits — the
    # remaining 2 bits are padding, so flipping the last char alone can
    # decode to the same bytes and round-trip cleanly. Flipping mid-sig
    # changes a full byte of the HMAC and is always rejected.)
    sig_start = token.rfind(".") + 1
    mid = sig_start + (len(token) - sig_start) // 2
    flipped_char = "A" if token[mid] != "A" else "B"
    tampered = token[:mid] + flipped_char + token[mid + 1:]
    with pytest.raises(InvalidTokenError):
        decode_token(tampered)


def test_expired_token_rejected() -> None:
    token, _ = create_token("u", ttl=timedelta(seconds=-1))
    with pytest.raises(InvalidTokenError):
        decode_token(token)


def test_jti_is_unique_per_call() -> None:
    _, p1 = create_token("u")
    _, p2 = create_token("u")
    assert p1.jti != p2.jti


def test_jti_is_128_bits_of_hex() -> None:
    _, payload = create_token("u")
    assert len(payload.jti) == 32
    assert all(c in "0123456789abcdef" for c in payload.jti)


def test_token_signed_with_other_keys_secret_is_rejected() -> None:
    """Signing-key separation: refresh secret must not verify access tokens."""
    # Manually mint an "access" token but sign it with the refresh secret.
    forged = jwt.encode(
        {
            "sub": "u",
            "typ": "access",
            "jti": "deadbeef" * 4,
            "iat": int(time.time()),
            "exp": int(time.time()) + 60,
        },
        "test-refresh-secret-32bytes-min!",
        algorithm=ALGORITHM,
    )
    with pytest.raises(InvalidTokenError):
        decode_token(forged, expected_type="access")


def test_missing_secret_refuses_to_mint(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("BRAIN_JWT_SECRET", raising=False)
    with pytest.raises(RuntimeError):
        create_token("u")


def test_missing_refresh_secret_refuses_to_mint(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("BRAIN_JWT_REFRESH_SECRET", raising=False)
    with pytest.raises(RuntimeError):
        create_token("u", token_type="refresh")


def test_payload_dataclass_is_hashable_and_frozen() -> None:
    """TokenPayload is frozen so it can be used in sets / as dict keys."""
    _, payload = create_token("u")
    with pytest.raises(Exception):
        # frozen dataclass — assignment should fail
        payload.user_id = "other"  # type: ignore[misc]
    assert tokens.TokenPayload is type(payload)

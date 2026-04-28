"""End-to-end tests for the /auth router.

These exercise the full SQLAlchemy + repository + route stack against
an in-memory SQLite engine wired up by ``conftest.py``. The goal is to
prove that:

* the happy-path register → login → me → logout flow works,
* refresh tokens rotate (the previous one stops working, the new one
  works exactly once),
* replay of an already-used refresh token revokes the entire session,
* expired access tokens, missing tokens, and revoked sessions all
  produce 401s with no information leak.
"""
from __future__ import annotations


VALID_PASSWORD = "correct horse battery staple"


def _register(client, email="owner@sallie.example.com", password=VALID_PASSWORD):
    return client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "first_name": "Owner",
            "last_name": "Tester",
        },
    )


def test_register_returns_user_and_tokens(client):
    r = _register(client)
    assert r.status_code == 201
    body = r.json()
    assert body["user"]["email"] == "owner@sallie.example.com"
    assert body["user"]["first_name"] == "Owner"
    assert body["user"]["is_active"] is True
    assert body["tokens"]["access_token"]
    assert body["tokens"]["refresh_token"]
    assert body["tokens"]["token_type"] == "bearer"
    # ACCESS_TOKEN_TTL is 15 minutes.
    assert body["tokens"]["expires_in"] == 15 * 60


def test_register_normalises_email_case(client):
    r = _register(client, email="Mixed@case.example.com")
    assert r.status_code == 201
    assert r.json()["user"]["email"] == "mixed@case.example.com"

    # Re-registering under the same address with different casing must 409.
    r2 = _register(client, email="MIXED@case.example.com")
    assert r2.status_code == 409


def test_register_rejects_weak_password(client):
    r = client.post(
        "/auth/register",
        json={"email": "weak@sallie.example.com", "password": "short"},
    )
    # Pydantic min_length=8 → 422 (validation error before the route runs).
    assert r.status_code == 422


def test_login_with_correct_password(client):
    _register(client)
    r = client.post(
        "/auth/login",
        json={"email": "owner@sallie.example.com", "password": VALID_PASSWORD},
    )
    assert r.status_code == 200
    assert r.json()["access_token"]


def test_login_with_wrong_password_is_401(client):
    _register(client)
    r = client.post(
        "/auth/login",
        json={"email": "owner@sallie.example.com", "password": "wrong-but-long-enough"},
    )
    assert r.status_code == 401


def test_login_for_unknown_user_is_401(client):
    r = client.post(
        "/auth/login",
        json={"email": "ghost@sallie.example.com", "password": VALID_PASSWORD},
    )
    assert r.status_code == 401


def test_me_returns_current_user(client):
    tokens = _register(client).json()["tokens"]
    r = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert r.status_code == 200
    assert r.json()["email"] == "owner@sallie.example.com"


def test_me_without_token_is_401(client):
    r = client.get("/auth/me")
    assert r.status_code == 401


def test_me_with_garbage_token_is_401(client):
    r = client.get("/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert r.status_code == 401


def test_refresh_rotates_token(client):
    tokens = _register(client).json()["tokens"]

    r = client.post(
        "/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert r.status_code == 200
    new_tokens = r.json()
    assert new_tokens["refresh_token"] != tokens["refresh_token"]
    assert new_tokens["access_token"] != tokens["access_token"]


def test_used_refresh_token_cannot_be_replayed(client):
    """Replay = the entire session chain is revoked."""
    tokens = _register(client).json()["tokens"]
    original_refresh = tokens["refresh_token"]

    # First rotation succeeds.
    r1 = client.post("/auth/refresh", json={"refresh_token": original_refresh})
    assert r1.status_code == 200
    second_refresh = r1.json()["refresh_token"]

    # Replaying the *original* refresh must fail …
    r2 = client.post("/auth/refresh", json={"refresh_token": original_refresh})
    assert r2.status_code == 401

    # … and as a side-effect the rotated child is revoked too, because
    # replay-detection kills the whole chain.
    r3 = client.post("/auth/refresh", json={"refresh_token": second_refresh})
    assert r3.status_code == 401


def test_refresh_with_access_token_is_rejected(client):
    """Type confusion guard — see decode_token(expected_type=...)."""
    tokens = _register(client).json()["tokens"]
    r = client.post(
        "/auth/refresh", json={"refresh_token": tokens["access_token"]}
    )
    assert r.status_code == 401


def test_logout_revokes_session(client):
    tokens = _register(client).json()["tokens"]
    auth = {"Authorization": f"Bearer {tokens['access_token']}"}

    # Sanity: token works pre-logout.
    assert client.get("/auth/me", headers=auth).status_code == 200

    r = client.post("/auth/logout", headers=auth)
    assert r.status_code == 204

    # After logout, the same access token is rejected.
    assert client.get("/auth/me", headers=auth).status_code == 401


def test_logout_also_revokes_refresh_token(client):
    """Logging out should kill the refresh token tied to that session."""
    tokens = _register(client).json()["tokens"]
    auth = {"Authorization": f"Bearer {tokens['access_token']}"}

    assert client.post("/auth/logout", headers=auth).status_code == 204

    r = client.post(
        "/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    assert r.status_code == 401

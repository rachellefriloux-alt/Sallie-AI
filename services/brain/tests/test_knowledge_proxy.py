"""Tests for the brain → knowledge proxy routes.

We don't spin up a real knowledge service. Instead we monkey-patch the
``KnowledgeClient`` instance on ``app.state`` so tests are hermetic.
"""
from __future__ import annotations

from typing import Any, Dict, List

import pytest
from fastapi.testclient import TestClient

from app.clients.knowledge import KnowledgeHit, KnowledgeUnavailable
from app.main import app


class FakeClient:
    base_url = "http://fake-knowledge"

    def __init__(self, *, hits: List[KnowledgeHit] | None = None, raise_exc: bool = False, healthy: bool = True) -> None:
        self._hits = hits or []
        self._raise = raise_exc
        self._healthy = healthy

    async def health(self) -> bool:  # mirrors KnowledgeClient.health
        return self._healthy

    async def query(self, text: str, *, limit: int = 5) -> List[KnowledgeHit]:
        if self._raise:
            raise KnowledgeUnavailable("simulated outage")
        return self._hits[:limit]


@pytest.fixture
def client():
    with TestClient(app) as c:
        # Drop any previous override (the singleton is created lazily).
        c.app.state.knowledge_client = None
        yield c
        c.app.state.knowledge_client = None


def _install(client: TestClient, fake: FakeClient) -> None:
    client.app.state.knowledge_client = fake


def test_knowledge_health_proxy_ok(client):
    _install(client, FakeClient(healthy=True))
    r = client.get("/knowledge/health")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["upstream"] == "http://fake-knowledge"


def test_knowledge_health_proxy_down(client):
    _install(client, FakeClient(healthy=False))
    r = client.get("/knowledge/health")
    assert r.status_code == 200
    assert r.json()["ok"] is False


def test_knowledge_query_returns_hits(client):
    _install(client, FakeClient(hits=[
        KnowledgeHit(id="a#0", score=0.9, text="alpha text", metadata={"title": "Alpha"}),
        KnowledgeHit(id="b#0", score=0.5, text="beta text", metadata={"title": "Beta"}),
    ]))
    r = client.post("/knowledge/query", json={"query": "what is alpha", "limit": 5})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["query"] == "what is alpha"
    assert body["upstream"] == "http://fake-knowledge"
    assert len(body["hits"]) == 2
    assert body["hits"][0]["id"] == "a#0"
    assert body["hits"][0]["metadata"]["title"] == "Alpha"


def test_knowledge_query_unavailable_returns_503(client):
    _install(client, FakeClient(raise_exc=True))
    r = client.post("/knowledge/query", json={"query": "anything", "limit": 3})
    assert r.status_code == 503
    assert "simulated outage" in r.json()["detail"]


def test_knowledge_query_validation(client):
    # Don't even need the fake — validation runs before the dependency.
    r = client.post("/knowledge/query", json={"query": "", "limit": 5})
    assert r.status_code == 422
    r = client.post("/knowledge/query", json={"query": "ok", "limit": 0})
    assert r.status_code == 422

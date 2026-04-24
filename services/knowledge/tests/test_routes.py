"""Route tests using a fully wired in-memory runtime."""
from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.config import Settings
from app.embeddings import HashEmbedder
from app.routes import router
from app.runtime import Runtime
from app.store import InMemoryStore


@pytest.fixture
def client() -> TestClient:
    settings = Settings()  # env defaults; ignored because we inject below
    runtime = Runtime.from_settings(
        settings,
        embedder=HashEmbedder(dim=128),
        store=InMemoryStore(dim=128),
    )

    app = FastAPI()
    app.state.runtime = runtime
    app.include_router(router)
    return TestClient(app)


def test_health_ok(client: TestClient):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_ready_reports_runtime(client: TestClient):
    r = client.get("/ready")
    assert r.status_code == 200
    body = r.json()
    assert body["ready"] is True
    assert body["embedder"] == "injected"
    assert body["store"] == "injected"
    assert body["dim"] == 128


def test_stats_starts_empty(client: TestClient):
    r = client.get("/stats")
    assert r.status_code == 200
    assert r.json()["count"] == 0


def test_ingest_then_query(client: TestClient):
    docs = [
        {
            "id": "doc-loyalty",
            "title": "Loyalty",
            "text": (
                "Sallie is fiercely loyal to one person. "
                "Loyalty defines her bond and her boundaries. " * 8
            ),
        },
        {
            "id": "doc-direct",
            "title": "Directness",
            "text": (
                "Sallie speaks plainly and directly. "
                "She does not soften the truth. " * 8
            ),
        },
    ]
    r = client.post("/ingest", json={"documents": docs})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["documents"] == 2
    assert body["chunks"] >= 2
    assert body["skipped_documents"] == 0

    stats = client.get("/stats").json()
    assert stats["count"] == body["chunks"]

    # The "loyal" query should rank the loyalty doc first.
    q = client.post("/query", json={"query": "loyal bond loyalty", "limit": 3})
    assert q.status_code == 200
    hits = q.json()["hits"]
    assert hits, "expected at least one hit"
    assert hits[0]["metadata"]["doc_id"] == "doc-loyalty"


def test_query_validation(client: TestClient):
    r = client.post("/query", json={"query": "", "limit": 5})
    assert r.status_code == 422
    r = client.post("/query", json={"query": "ok", "limit": 0})
    assert r.status_code == 422
    r = client.post("/query", json={"query": "ok", "limit": 999})
    assert r.status_code == 422


def test_ingest_validation_empty_docs(client: TestClient):
    r = client.post("/ingest", json={"documents": []})
    assert r.status_code == 422


def test_ingest_with_wikitext_flag(client: TestClient):
    r = client.post(
        "/ingest",
        json={
            "documents": [
                {
                    "id": "wiki:cat",
                    "title": "Cat",
                    "text": (
                        "[[File:Cat.jpg|thumb|cat]]\n"
                        "Cats are mammals.<ref>cite</ref> They purr. " * 12
                    ),
                    "is_wikitext": True,
                }
            ]
        },
    )
    assert r.status_code == 200
    q = client.post("/query", json={"query": "cats purr mammals", "limit": 1}).json()
    assert q["hits"]
    assert "File:" not in q["hits"][0]["text"]
    assert "cite" not in q["hits"][0]["text"]


def test_ingest_skips_empty_text(client: TestClient):
    r = client.post(
        "/ingest",
        json={
            "documents": [
                {"id": "empty", "title": "x", "text": "   "},
                {
                    "id": "real",
                    "title": "y",
                    "text": "Real content with multiple words. " * 20,
                },
            ]
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert body["documents"] == 2
    assert body["skipped_documents"] == 1
    assert body["chunks"] >= 1

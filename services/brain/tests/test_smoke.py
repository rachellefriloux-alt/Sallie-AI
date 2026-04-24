"""Smoke tests for Sallie Brain — Phase 1.

Verify the FastAPI app boots, all 9 systems start, the health endpoint
responds, and the 40-question Convergence bank is exposed correctly.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    # TestClient as a context manager runs FastAPI's lifespan
    # (startup/shutdown), which is what populates app.state.brain.
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_ready_lists_all_nine_systems(client):
    r = client.get("/ready")
    assert r.status_code == 200
    body = r.json()
    expected = {
        "limbic", "memory", "monologue", "synthesis", "agency",
        "dream_cycle", "degradation", "control", "convergence",
    }
    assert set(body["systems"].keys()) == expected
    assert body["ready"] is True


def test_convergence_has_forty_questions(client):
    r = client.get("/convergence/questions")
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 40
    ids = [q["id"] for q in body["questions"]]
    assert ids == list(range(1, 41))


def test_convergence_phases_include_visage(client):
    r = client.get("/convergence/phases")
    assert r.status_code == 200
    body = r.json()
    phase_ids = [p["id"] for p in body["phases"]]
    assert phase_ids == [
        "obsidian", "leopard", "peacock", "celestial", "void", "visage",
    ]
    visage = next(p for p in body["phases"] if p["id"] == "visage")
    assert visage["start_question"] == 30
    assert visage["end_question"] == 40


def test_convergence_session_flow(client):
    r = client.post("/convergence/sessions")
    assert r.status_code == 200
    sid = r.json()["session_id"]

    r = client.post(
        f"/convergence/sessions/{sid}/answer",
        json={"question_id": 1, "answer": "no lying, ever"},
    )
    assert r.status_code == 200
    sess = r.json()
    assert sess["current_question"] == 2
    assert sess["complete"] is False
    assert sess["answers"]["1"]["value"] == "no lying, ever"


def test_get_unknown_question_404(client):
    r = client.get("/convergence/questions/999")
    assert r.status_code == 404


def test_completing_all_questions_marks_session_complete(client):
    sid = client.post("/convergence/sessions").json()["session_id"]
    last_response = None
    for qid in range(1, 41):
        last_response = client.post(
            f"/convergence/sessions/{sid}/answer",
            json={"question_id": qid, "answer": f"answer-{qid}"},
        )
        assert last_response.status_code == 200
    final = last_response.json()
    assert final["complete"] is True
    assert final["current_question"] is None
    assert len(final["answers"]) == 40

"""Tests for the synthesis composer + /synthesis/respond route."""
from __future__ import annotations

from typing import List

import pytest
from fastapi.testclient import TestClient

from app.clients.knowledge import KnowledgeHit, KnowledgeUnavailable
from app.main import app
from app.synthesis import Composer, GroundedStubResponder, Responder


# ---- Fakes ---------------------------------------------------------------


class FakeKnowledge:
    """Drop-in for KnowledgeClient — only the `query` method is exercised."""

    def __init__(
        self,
        *,
        hits: List[KnowledgeHit] | None = None,
        raise_exc: bool = False,
    ) -> None:
        self._hits = hits or []
        self._raise = raise_exc
        self.calls: list[tuple[str, int]] = []
        self.base_url = "http://fake-knowledge"

    async def query(self, text: str, *, limit: int = 5) -> List[KnowledgeHit]:
        self.calls.append((text, limit))
        if self._raise:
            raise KnowledgeUnavailable("simulated outage")
        return self._hits[:limit]


class EchoResponder:
    """LLM-shaped fake — returns the prompt verbatim with a marker."""

    async def respond(self, prompt: str) -> str:
        return f"[echo]\n{prompt}"


# ---- Composer unit tests -------------------------------------------------


@pytest.mark.asyncio
async def test_compose_with_hits_uses_stub_responder():
    fake = FakeKnowledge(hits=[
        KnowledgeHit(id="a#0", score=0.9, text="The Eiffel Tower is in Paris.", metadata={"title": "Eiffel Tower"}),
        KnowledgeHit(id="b#0", score=0.7, text="Paris is the capital of France.", metadata={"title": "Paris"}),
    ])
    c = Composer(knowledge=fake)
    result = await c.compose("where is the Eiffel Tower", limit=2)

    assert result.query == "where is the Eiffel Tower"
    assert result.knowledge_available is True
    assert len(result.citations) == 2
    assert result.citations[0].title == "Eiffel Tower"
    # Stub answer cites both
    assert "[1]" in result.answer and "[2]" in result.answer
    assert "Eiffel Tower" in result.answer
    # Knowledge was queried once with the right limit
    assert fake.calls == [("where is the Eiffel Tower", 2)]


@pytest.mark.asyncio
async def test_compose_without_knowledge_returns_ungrounded():
    c = Composer(knowledge=None)
    result = await c.compose("anything")
    assert result.knowledge_available is False
    assert result.citations == []
    assert "don't have grounded context" in result.answer


@pytest.mark.asyncio
async def test_compose_when_knowledge_errors_degrades_gracefully():
    fake = FakeKnowledge(raise_exc=True)
    c = Composer(knowledge=fake)
    result = await c.compose("anything")
    assert result.knowledge_available is False
    assert result.citations == []
    # Still produces *some* answer rather than blowing up
    assert result.answer


@pytest.mark.asyncio
async def test_compose_uses_custom_responder_when_provided():
    fake = FakeKnowledge(hits=[
        KnowledgeHit(id="x#0", score=0.5, text="some text", metadata={"title": "X"}),
    ])
    c = Composer(knowledge=fake, responder=EchoResponder())
    result = await c.compose("hello")
    assert result.answer.startswith("[echo]")
    # The prompt the responder saw should be the same one returned
    assert result.prompt in result.answer


@pytest.mark.asyncio
async def test_compose_rejects_empty_query():
    c = Composer(knowledge=None)
    with pytest.raises(ValueError):
        await c.compose("")
    with pytest.raises(ValueError):
        await c.compose("   \n   ")


@pytest.mark.asyncio
async def test_compose_rejects_oversized_query():
    c = Composer(knowledge=None)
    with pytest.raises(ValueError):
        await c.compose("x" * 5000)


@pytest.mark.asyncio
async def test_compose_clamps_limit():
    fake = FakeKnowledge(hits=[
        KnowledgeHit(id=f"d#{i}", score=1.0 - i * 0.1, text=f"chunk {i}", metadata={})
        for i in range(30)
    ])
    c = Composer(knowledge=fake)
    # limit=999 should be clamped to the internal max (20)
    await c.compose("query", limit=999)
    assert fake.calls[-1] == ("query", 20)
    # limit=0 clamps up to 1
    await c.compose("query", limit=0)
    assert fake.calls[-1] == ("query", 1)


@pytest.mark.asyncio
async def test_prompt_truncates_long_chunks():
    huge = "x" * 5000
    fake = FakeKnowledge(hits=[
        KnowledgeHit(id="big", score=0.9, text=huge, metadata={"title": "Big"}),
    ])
    c = Composer(knowledge=fake)
    result = await c.compose("anything")
    # Prompt should not contain the full 5000-char chunk verbatim
    assert huge not in result.prompt
    assert "…" in result.prompt


@pytest.mark.asyncio
async def test_stub_responder_is_pure_passthrough_when_called_directly():
    # GroundedStubResponder.respond() is only used as a marker; the composer
    # special-cases it. Just confirm the contract.
    r = GroundedStubResponder()
    out = await r.respond("the prompt")
    assert out == "the prompt"


# ---- Route integration tests --------------------------------------------


@pytest.fixture
def client():
    with TestClient(app) as c:
        # Reset both injected slots between tests
        c.app.state.composer = None
        c.app.state.knowledge_client = None
        yield c
        c.app.state.composer = None
        c.app.state.knowledge_client = None


def _install_composer(client: TestClient, composer: Composer) -> None:
    client.app.state.composer = composer


def test_respond_returns_grounded_answer(client):
    fake = FakeKnowledge(hits=[
        KnowledgeHit(id="loyal#0", score=0.9, text="Loyalty defines the bond.", metadata={"title": "Loyalty"}),
    ])
    _install_composer(client, Composer(knowledge=fake))

    r = client.post("/synthesis/respond", json={"query": "what is loyalty", "limit": 3})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["query"] == "what is loyalty"
    assert body["knowledge_available"] is True
    assert len(body["citations"]) == 1
    assert body["citations"][0]["title"] == "Loyalty"
    assert "Loyalty" in body["answer"]


def test_respond_when_knowledge_down_still_200(client):
    _install_composer(client, Composer(knowledge=FakeKnowledge(raise_exc=True)))
    r = client.post("/synthesis/respond", json={"query": "anything"})
    assert r.status_code == 200
    body = r.json()
    assert body["knowledge_available"] is False
    assert body["citations"] == []
    assert body["answer"]


def test_respond_validation(client):
    r = client.post("/synthesis/respond", json={"query": ""})
    assert r.status_code == 422
    r = client.post("/synthesis/respond", json={"query": "ok", "limit": 0})
    assert r.status_code == 422
    r = client.post("/synthesis/respond", json={"query": "ok", "limit": 999})
    assert r.status_code == 422
    r = client.post("/synthesis/respond", json={"query": "x" * 5000})
    assert r.status_code == 422


# ---- Synthesis system metrics ------------------------------------------


def test_synthesis_system_records_metrics(client):
    fake = FakeKnowledge(hits=[
        KnowledgeHit(id="m#0", score=0.9, text="metric chunk", metadata={"title": "M"}),
        KnowledgeHit(id="m#1", score=0.8, text="another", metadata={"title": "N"}),
    ])
    _install_composer(client, Composer(knowledge=fake))

    # Baseline: nothing recorded yet.
    r = client.get("/systems/synthesis")
    assert r.status_code == 200
    base = r.json()
    assert base["name"] == "synthesis"
    assert base["responses_total"] == 0
    assert base["last_query"] is None
    assert base["last_knowledge_available"] is None
    assert base["last_citation_count"] is None
    assert base["last_at"] is None

    # Two grounded responses.
    assert client.post("/synthesis/respond", json={"query": "first", "limit": 2}).status_code == 200
    assert client.post("/synthesis/respond", json={"query": "second", "limit": 1}).status_code == 200

    after = client.get("/systems/synthesis").json()
    assert after["responses_total"] == 2
    assert after["last_query"] == "second"
    assert after["last_knowledge_available"] is True
    # limit=1 → at most one citation
    assert after["last_citation_count"] == 1
    assert isinstance(after["last_at"], str) and after["last_at"]


def test_synthesis_system_records_ungrounded_responses(client):
    _install_composer(client, Composer(knowledge=FakeKnowledge(raise_exc=True)))
    assert client.post("/synthesis/respond", json={"query": "anything"}).status_code == 200

    s = client.get("/systems/synthesis").json()
    assert s["responses_total"] == 1
    assert s["last_query"] == "anything"
    assert s["last_knowledge_available"] is False
    assert s["last_citation_count"] == 0


def test_synthesis_system_truncates_long_last_query(client):
    _install_composer(client, Composer(knowledge=FakeKnowledge()))
    long_q = "q" * 1000
    assert client.post("/synthesis/respond", json={"query": long_q}).status_code == 200

    s = client.get("/systems/synthesis").json()
    assert s["last_query"] is not None
    # Truncated and ellipsised, never the full 1000 chars.
    assert len(s["last_query"]) < 1000
    assert s["last_query"].endswith("…")

"""Tests for the GitHub Models responder + ``build_default_responder`` factory.

These tests must NOT make real network calls. The OpenAI client is always
either unimported (factory tests) or patched out (responder tests).
"""
from __future__ import annotations

from types import SimpleNamespace
from typing import Any, Dict, List

import pytest

from app.synthesis import (
    GitHubModelsResponder,
    GroundedStubResponder,
    build_default_responder,
)
from app.synthesis import composer as composer_mod


# ---- Factory ------------------------------------------------------------


def test_factory_default_is_deterministic(monkeypatch):
    monkeypatch.delenv("SALLIE_RESPONDER", raising=False)
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    assert isinstance(build_default_responder(), GroundedStubResponder)


def test_factory_unknown_backend_is_deterministic(monkeypatch):
    monkeypatch.setenv("SALLIE_RESPONDER", "made-up-backend")
    monkeypatch.setenv("GITHUB_TOKEN", "t")
    assert isinstance(build_default_responder(), GroundedStubResponder)


def test_factory_github_models_without_token_falls_back(monkeypatch):
    monkeypatch.setenv("SALLIE_RESPONDER", "github_models")
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    # Missing token → silent fallback so the brain still boots.
    assert isinstance(build_default_responder(), GroundedStubResponder)


def test_factory_github_models_with_token_returns_github_responder(monkeypatch):
    monkeypatch.setenv("SALLIE_RESPONDER", "github_models")
    monkeypatch.setenv("GITHUB_TOKEN", "ghp_test_token")
    monkeypatch.delenv("SALLIE_RESPONDER_MODEL", raising=False)
    monkeypatch.delenv("SALLIE_RESPONDER_TEMPERATURE", raising=False)
    monkeypatch.delenv("SALLIE_RESPONDER_TOP_P", raising=False)
    r = build_default_responder()
    assert isinstance(r, GitHubModelsResponder)
    # Defaults match the snippet
    assert r._model == "openai/gpt-4.1"
    assert r._temperature == 1.0
    assert r._top_p == 1.0


def test_factory_reads_env_overrides(monkeypatch):
    monkeypatch.setenv("SALLIE_RESPONDER", "github_models")
    monkeypatch.setenv("GITHUB_TOKEN", "ghp_test_token")
    monkeypatch.setenv("SALLIE_RESPONDER_MODEL", "openai/gpt-4o-mini")
    monkeypatch.setenv("SALLIE_RESPONDER_TEMPERATURE", "0.2")
    monkeypatch.setenv("SALLIE_RESPONDER_TOP_P", "0.5")
    r = build_default_responder()
    assert isinstance(r, GitHubModelsResponder)
    assert r._model == "openai/gpt-4o-mini"
    assert r._temperature == 0.2
    assert r._top_p == 0.5


def test_factory_invalid_floats_use_defaults(monkeypatch):
    monkeypatch.setenv("SALLIE_RESPONDER", "github_models")
    monkeypatch.setenv("GITHUB_TOKEN", "ghp_test_token")
    monkeypatch.setenv("SALLIE_RESPONDER_TEMPERATURE", "not-a-number")
    monkeypatch.setenv("SALLIE_RESPONDER_TOP_P", "")
    r = build_default_responder()
    assert isinstance(r, GitHubModelsResponder)
    assert r._temperature == 1.0
    assert r._top_p == 1.0


def test_factory_case_insensitive(monkeypatch):
    monkeypatch.setenv("SALLIE_RESPONDER", "  GitHub_Models  ")
    monkeypatch.setenv("GITHUB_TOKEN", "ghp_test_token")
    assert isinstance(build_default_responder(), GitHubModelsResponder)


# ---- GitHubModelsResponder ---------------------------------------------


class _FakeMessage:
    def __init__(self, content: str) -> None:
        self.content = content


class _FakeChoice:
    def __init__(self, content: str) -> None:
        self.message = _FakeMessage(content)


class _FakeCompletion:
    def __init__(self, choices: List[_FakeChoice]) -> None:
        self.choices = choices


class _FakeChatCompletions:
    def __init__(self, *, response: Any = None, raise_exc: Exception | None = None):
        self.response = response
        self.raise_exc = raise_exc
        self.calls: List[Dict[str, Any]] = []

    def create(self, **kwargs: Any) -> Any:
        self.calls.append(kwargs)
        if self.raise_exc is not None:
            raise self.raise_exc
        return self.response


class _FakeOpenAI:
    last_init_kwargs: Dict[str, Any] | None = None

    def __init__(self, *, response: Any = None, raise_exc: Exception | None = None):
        self.chat = SimpleNamespace(
            completions=_FakeChatCompletions(response=response, raise_exc=raise_exc)
        )


def _install_fake_openai(monkeypatch, *, response=None, raise_exc=None) -> _FakeOpenAI:
    fake_instance = _FakeOpenAI(response=response, raise_exc=raise_exc)

    class _OpenAIFactory:
        def __init__(self, *, base_url: str, api_key: str) -> None:
            _FakeOpenAI.last_init_kwargs = {"base_url": base_url, "api_key": api_key}
            # Forward to the prebuilt instance so the test can inspect it.
            self.chat = fake_instance.chat

    fake_module = SimpleNamespace(OpenAI=_OpenAIFactory)
    monkeypatch.setitem(__import__("sys").modules, "openai", fake_module)
    _FakeOpenAI.last_init_kwargs = None
    return fake_instance


@pytest.mark.asyncio
async def test_github_responder_calls_openai_with_expected_args(monkeypatch):
    fake = _install_fake_openai(
        monkeypatch,
        response=_FakeCompletion([_FakeChoice("the answer with [1]")]),
    )
    r = GitHubModelsResponder(
        api_key="ghp_test",
        model="openai/gpt-4.1",
        temperature=0.7,
        top_p=0.9,
    )
    out = await r.respond("PROMPT BODY")
    assert out == "the answer with [1]"

    # Client was built with the GitHub Models base URL + supplied key.
    assert _FakeOpenAI.last_init_kwargs == {
        "base_url": "https://models.github.ai/inference",
        "api_key": "ghp_test",
    }
    # The single chat.completions.create call carried our config and
    # forwarded the composer's prompt as the user message.
    assert len(fake.chat.completions.calls) == 1
    call = fake.chat.completions.calls[0]
    assert call["model"] == "openai/gpt-4.1"
    assert call["temperature"] == 0.7
    assert call["top_p"] == 0.9
    msgs = call["messages"]
    assert msgs[0]["role"] == "system"
    assert "Sallie" in msgs[0]["content"]
    assert msgs[1] == {"role": "user", "content": "PROMPT BODY"}


@pytest.mark.asyncio
async def test_github_responder_resolves_token_from_env(monkeypatch):
    monkeypatch.setenv("GITHUB_TOKEN", "from-env")
    _install_fake_openai(
        monkeypatch, response=_FakeCompletion([_FakeChoice("ok")])
    )
    r = GitHubModelsResponder()  # no api_key passed
    assert await r.respond("p") == "ok"
    assert _FakeOpenAI.last_init_kwargs == {
        "base_url": "https://models.github.ai/inference",
        "api_key": "from-env",
    }


@pytest.mark.asyncio
async def test_github_responder_falls_back_when_no_token(monkeypatch):
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    # No need to install fake openai — we should never reach the import.
    r = GitHubModelsResponder()
    out = await r.respond("p")
    # Default fallback returns the degraded user-facing message.
    assert "trouble" in out.lower()


@pytest.mark.asyncio
async def test_github_responder_falls_back_on_api_exception(monkeypatch):
    _install_fake_openai(monkeypatch, raise_exc=RuntimeError("boom: 401"))
    r = GitHubModelsResponder(api_key="ghp_test")
    out = await r.respond("p")
    assert "trouble" in out.lower()


@pytest.mark.asyncio
async def test_github_responder_falls_back_on_empty_choices(monkeypatch):
    _install_fake_openai(monkeypatch, response=_FakeCompletion(choices=[]))
    r = GitHubModelsResponder(api_key="ghp_test")
    out = await r.respond("p")
    assert "trouble" in out.lower()


@pytest.mark.asyncio
async def test_github_responder_falls_back_on_empty_content(monkeypatch):
    _install_fake_openai(
        monkeypatch, response=_FakeCompletion([_FakeChoice("   ")])
    )
    r = GitHubModelsResponder(api_key="ghp_test")
    out = await r.respond("p")
    assert "trouble" in out.lower()


@pytest.mark.asyncio
async def test_github_responder_uses_custom_fallback(monkeypatch):
    class _MyFallback:
        async def respond(self, prompt: str) -> str:
            return f"FB:{prompt}"

    _install_fake_openai(monkeypatch, raise_exc=RuntimeError("nope"))
    r = GitHubModelsResponder(api_key="ghp_test", fallback=_MyFallback())
    assert await r.respond("hello") == "FB:hello"


@pytest.mark.asyncio
async def test_github_responder_lazy_client_init(monkeypatch):
    # Constructing the responder must not import openai or read env.
    monkeypatch.delenv("GITHUB_TOKEN", raising=False)
    r = GitHubModelsResponder()
    # No client created yet
    assert r._client is None  # noqa: SLF001
    # And then a successful call lazily builds it.
    monkeypatch.setenv("GITHUB_TOKEN", "later")
    _install_fake_openai(
        monkeypatch, response=_FakeCompletion([_FakeChoice("hi")])
    )
    assert await r.respond("p") == "hi"


# ---- Composer integration with GitHubModelsResponder --------------------


@pytest.mark.asyncio
async def test_composer_uses_github_responder_output(monkeypatch):
    """End-to-end: Composer + GitHubModelsResponder with mocked OpenAI."""
    from app.clients.knowledge import KnowledgeHit

    class _FakeKnowledge:
        async def query(self, text: str, *, limit: int = 5):
            return [KnowledgeHit(id="x#0", score=0.9, text="ctx", metadata={"title": "X"})]

    _install_fake_openai(
        monkeypatch,
        response=_FakeCompletion([_FakeChoice("LLM SAID HI [1]")]),
    )
    r = GitHubModelsResponder(api_key="ghp_test")
    c = composer_mod.Composer(knowledge=_FakeKnowledge(), responder=r)
    result = await c.compose("what")
    assert result.answer == "LLM SAID HI [1]"
    assert result.knowledge_available is True
    assert len(result.citations) == 1

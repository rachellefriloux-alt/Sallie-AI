"""Response composition: retrieval → grounded prompt → answer.

The composer's job is small and well-defined:

1. Query the knowledge service for the top-N chunks relevant to the user's
   message.
2. Format them as a numbered context block + grounded prompt.
3. Hand the prompt to a :class:`Responder` (LLM, stub, or test fake) and
   return its output along with the citations we used.

Keeping retrieval and generation behind one entry point means routes,
cognitive systems, and tests all use the same code path.
"""
from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from typing import List, Optional, Protocol

from app.clients.knowledge import KnowledgeClient, KnowledgeHit, KnowledgeUnavailable

log = logging.getLogger("sallie.brain.synthesis")

# Hard caps. The brain trusts callers, but the route layer doesn't, and we
# enforce again here as defence in depth.
_MAX_QUERY_CHARS = 4000
_DEFAULT_LIMIT = 4
_MAX_LIMIT = 20
# Per-chunk truncation when building the prompt — keeps prompts bounded
# regardless of what's in the index.
_MAX_CHUNK_CHARS_IN_PROMPT = 800


@dataclass(frozen=True)
class Citation:
    id: str
    title: str
    score: float


@dataclass(frozen=True)
class GroundedAnswer:
    query: str
    answer: str
    prompt: str
    citations: List[Citation] = field(default_factory=list)
    knowledge_available: bool = True


class Responder(Protocol):
    """Anything that can turn a prompt into an answer string."""

    async def respond(self, prompt: str) -> str: ...


# ---- Default responder: deterministic, no LLM ---------------------------


class GroundedStubResponder:
    """Emits a stable, citation-tagged answer built from the prompt's context.

    This is a *real* responder, not a placeholder — it's what production
    runs on until we wire an LLM responder in Phase 6. The output:

    * Names the question
    * Lists the retrieved facts as numbered citations
    * Marks itself as "ungrounded" if no context was retrieved

    Deterministic output makes it cheap to test and easy for the mobile
    app to render predictably.
    """

    async def respond(self, prompt: str) -> str:  # noqa: D401
        return prompt  # the composer will replace this with the formatted answer


# ---- Composer ------------------------------------------------------------


class Composer:
    def __init__(
        self,
        *,
        knowledge: Optional[KnowledgeClient],
        responder: Optional[Responder] = None,
    ) -> None:
        # ``knowledge`` may be ``None`` if the brain is configured without a
        # knowledge service — in that case we still answer, just ungrounded.
        self._knowledge = knowledge
        self._responder = responder or GroundedStubResponder()

    async def compose(
        self,
        query: str,
        *,
        limit: int = _DEFAULT_LIMIT,
    ) -> GroundedAnswer:
        query = (query or "").strip()
        if not query:
            raise ValueError("query must be non-empty")
        if len(query) > _MAX_QUERY_CHARS:
            raise ValueError(f"query exceeds {_MAX_QUERY_CHARS} chars")
        limit = max(1, min(int(limit), _MAX_LIMIT))

        hits, knowledge_available = await self._retrieve(query, limit)
        prompt = self._build_prompt(query, hits)

        # If we have a custom responder it generates; otherwise we use the
        # built-in deterministic formatter.
        if isinstance(self._responder, GroundedStubResponder):
            answer = self._format_stub_answer(query, hits)
        else:
            answer = await self._responder.respond(prompt)

        citations = [
            Citation(
                id=h.id,
                title=str(h.metadata.get("title") or h.id),
                score=h.score,
            )
            for h in hits
        ]
        return GroundedAnswer(
            query=query,
            answer=answer,
            prompt=prompt,
            citations=citations,
            knowledge_available=knowledge_available,
        )

    # ---- internals ------------------------------------------------------

    async def _retrieve(
        self, query: str, limit: int
    ) -> tuple[List[KnowledgeHit], bool]:
        if self._knowledge is None:
            return [], False
        try:
            return await self._knowledge.query(query, limit=limit), True
        except KnowledgeUnavailable:
            # Degrade gracefully: an ungrounded answer is better than a 503
            # bubbling all the way to the phone.
            return [], False

    def _build_prompt(self, query: str, hits: List[KnowledgeHit]) -> str:
        if not hits:
            return (
                "You are Sallie. Answer the following question honestly. "
                "You have no retrieved context for this question, so be "
                "explicit about what you don't know.\n\n"
                f"Question: {query}\n"
            )
        context_lines = []
        for i, hit in enumerate(hits, start=1):
            title = str(hit.metadata.get("title") or hit.id)
            text = hit.text.strip()
            if len(text) > _MAX_CHUNK_CHARS_IN_PROMPT:
                text = text[:_MAX_CHUNK_CHARS_IN_PROMPT].rstrip() + "…"
            context_lines.append(f"[{i}] {title}\n{text}")
        context = "\n\n".join(context_lines)
        return (
            "You are Sallie. Answer the question using the numbered context "
            "below. Cite sources as [1], [2], etc. If the context is "
            "insufficient, say so plainly.\n\n"
            f"Context:\n{context}\n\nQuestion: {query}\n"
        )

    def _format_stub_answer(self, query: str, hits: List[KnowledgeHit]) -> str:
        if not hits:
            return (
                f"I don't have grounded context for: \"{query}\". "
                "I'm running without a populated knowledge index, so I'd be "
                "guessing if I answered."
            )
        bullets = []
        for i, hit in enumerate(hits, start=1):
            title = str(hit.metadata.get("title") or hit.id)
            snippet = hit.text.strip().replace("\n", " ")
            if len(snippet) > 240:
                snippet = snippet[:240].rstrip() + "…"
            bullets.append(f"[{i}] {title}: {snippet}")
        joined = "\n".join(bullets)
        return (
            f"Here's what I found for \"{query}\":\n\n{joined}\n\n"
            f"({len(hits)} source{'s' if len(hits) != 1 else ''} cited.)"
        )


# ---- GitHub Models responder -------------------------------------------

# GitHub Models exposes an OpenAI-compatible Chat Completions API at this
# base URL. Auth uses a GitHub PAT (``GITHUB_TOKEN``) instead of an OpenAI
# key. See https://github.com/marketplace/models for the model catalog.
_GITHUB_MODELS_BASE_URL = "https://models.github.ai/inference"
_DEFAULT_GITHUB_MODEL = "openai/gpt-4.1"
_DEFAULT_TEMPERATURE = 1.0
_DEFAULT_TOP_P = 1.0


class _DegradedFallbackResponder:
    """User-facing fallback when an upstream LLM responder fails.

    Returns a short, honest message instead of echoing the raw grounding
    prompt back to the caller. Used by :class:`GitHubModelsResponder`
    when the GitHub Models API is unreachable, unauthorized, rate-limited,
    or returns no choices — keeping ``/synthesis/respond`` at HTTP 200.
    """

    async def respond(self, prompt: str) -> str:  # noqa: D401, ARG002
        return (
            "I had trouble reaching my reasoning backend just now. "
            "Please try again in a moment."
        )


class GitHubModelsResponder:
    """Responder backed by GitHub Models (OpenAI-compatible Chat API).

    The composer hands this responder a fully-built grounded prompt
    (system framing + numbered context + user question). We forward that
    prompt to GitHub Models as the user message, with a short system
    message reinforcing Sallie's role.

    Robustness contract:

    * The OpenAI client is created lazily on the first request, so a
      missing ``GITHUB_TOKEN`` (or a missing ``openai`` package) never
      breaks app startup or unrelated tests.
    * Any exception during the upstream call (auth, rate limit, network,
      empty choices) is logged and the request falls back to the
      deterministic :class:`GroundedStubResponder` output for that single
      turn — so ``/synthesis/respond`` still returns 200.
    """

    def __init__(
        self,
        *,
        api_key: Optional[str] = None,
        model: str = _DEFAULT_GITHUB_MODEL,
        temperature: float = _DEFAULT_TEMPERATURE,
        top_p: float = _DEFAULT_TOP_P,
        base_url: str = _GITHUB_MODELS_BASE_URL,
        fallback: Optional[Responder] = None,
    ) -> None:
        # Read the token lazily-friendly: capture at construction if
        # provided, otherwise resolve at first use so tests can set env
        # after import.
        self._api_key = api_key
        self._model = model
        self._temperature = temperature
        self._top_p = top_p
        self._base_url = base_url
        # Fallback returns a short user-facing degraded message rather
        # than echoing the raw grounding prompt. ``GroundedStubResponder``
        # itself returns the prompt verbatim because the composer normally
        # special-cases it; once GitHubModelsResponder is in play we can't
        # reach that special case from a per-request fallback path.
        self._fallback = fallback or _DegradedFallbackResponder()
        self._client = None  # type: ignore[assignment]

    def _get_client(self):
        if self._client is not None:
            return self._client
        api_key = self._api_key or os.environ.get("GITHUB_TOKEN")
        if not api_key:
            raise RuntimeError(
                "GITHUB_TOKEN is not set; cannot use GitHubModelsResponder"
            )
        # Imported lazily so the brain still boots if ``openai`` is
        # absent (e.g. in minimal test environments).
        from openai import OpenAI  # type: ignore[import-not-found]

        self._client = OpenAI(base_url=self._base_url, api_key=api_key)
        return self._client

    async def respond(self, prompt: str) -> str:
        try:
            client = self._get_client()
            # The composer's prompt already contains the full grounding
            # (system framing + context + question). We pass it as the
            # user turn and add a short system message reinforcing role
            # and citation discipline.
            completion = client.chat.completions.create(
                model=self._model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are Sallie. Follow the instructions in the "
                            "user message exactly. When numbered context is "
                            "provided, cite it as [1], [2], etc."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=self._temperature,
                top_p=self._top_p,
            )
            choices = getattr(completion, "choices", None) or []
            if not choices:
                raise RuntimeError("GitHub Models returned no choices")
            content = (choices[0].message.content or "").strip()
            if not content:
                raise RuntimeError("GitHub Models returned empty content")
            return content
        except Exception:  # noqa: BLE001 - any failure → degrade, don't 500
            log.warning(
                "GitHubModelsResponder failed; falling back to deterministic "
                "responder for this request",
                exc_info=True,
            )
            return await self._fallback.respond(prompt)


# ---- Responder factory --------------------------------------------------


def _env_float(name: str, default: float) -> float:
    raw = os.environ.get(name)
    if raw is None or raw == "":
        return default
    try:
        return float(raw)
    except ValueError:
        log.warning("invalid %s=%r; using default %s", name, raw, default)
        return default


def build_default_responder() -> Responder:
    """Pick a responder based on environment.

    * ``SALLIE_RESPONDER=github_models`` plus a non-empty ``GITHUB_TOKEN``
      → :class:`GitHubModelsResponder` (configurable model / temperature
      / top_p via ``SALLIE_RESPONDER_MODEL``,
      ``SALLIE_RESPONDER_TEMPERATURE``, ``SALLIE_RESPONDER_TOP_P``).
    * Anything else → :class:`GroundedStubResponder` (current default).

    The factory never raises: a misconfigured GitHub Models selection
    (missing token) silently falls back to the deterministic responder
    so the brain always boots.
    """
    backend = (os.environ.get("SALLIE_RESPONDER") or "").strip().lower()
    if backend == "github_models":
        if not os.environ.get("GITHUB_TOKEN"):
            log.warning(
                "SALLIE_RESPONDER=github_models but GITHUB_TOKEN is unset; "
                "falling back to deterministic responder"
            )
            return GroundedStubResponder()
        model = os.environ.get("SALLIE_RESPONDER_MODEL") or _DEFAULT_GITHUB_MODEL
        temperature = _env_float("SALLIE_RESPONDER_TEMPERATURE", _DEFAULT_TEMPERATURE)
        top_p = _env_float("SALLIE_RESPONDER_TOP_P", _DEFAULT_TOP_P)
        return GitHubModelsResponder(
            model=model,
            temperature=temperature,
            top_p=top_p,
        )
    return GroundedStubResponder()

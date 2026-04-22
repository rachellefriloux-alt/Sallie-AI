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

from dataclasses import dataclass, field
from typing import List, Optional, Protocol

from app.clients.knowledge import KnowledgeClient, KnowledgeHit, KnowledgeUnavailable

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

"""Synthesis — Sallie's response composer.

This package is *not* the cognitive ``SynthesisSystem`` (that lives in
``app.systems.synthesis`` and remains a Phase-1 stub). It is the
**response-composition pipeline** the brain uses today:

    user message → knowledge retrieval → grounded prompt → responder → answer

The responder is pluggable. The default (:class:`GroundedStubResponder`)
needs no LLM — it just emits a deterministic, citation-tagged answer
built from the retrieved chunks. That keeps the brain useful (and
testable) without Ollama. Phase 6 swaps in real LLM responders behind
the same interface.
"""

from app.synthesis.composer import (
    Composer,
    GitHubModelsResponder,
    GroundedAnswer,
    GroundedStubResponder,
    Responder,
    build_default_responder,
)

__all__ = [
    "Composer",
    "GroundedAnswer",
    "GroundedStubResponder",
    "GitHubModelsResponder",
    "Responder",
    "build_default_responder",
]

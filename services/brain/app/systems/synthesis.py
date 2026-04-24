"""Synthesis system — runtime metrics for the grounded-response pipeline.

The actual composition logic lives in :mod:`app.synthesis.composer`; this
class is its presence in the cognitive-system registry. It records
lightweight counters every time `/synthesis/respond` finishes a compose
so that `/systems/synthesis` and the mobile Brain Status screen show
something more useful than `running: true`.

We deliberately keep this small: counts and the most recent query
(truncated). No prompts, no answers, no citation payloads — the brain
already returns those to the caller; mirroring them here would just be
a memory leak.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.systems.base import CognitiveSystem

# Truncation cap for the snapshot of the last query — long enough to be
# recognisable in a status pane, short enough not to balloon memory.
_MAX_LAST_QUERY_CHARS = 200


class SynthesisSystem(CognitiveSystem):
    name = "synthesis"

    def __init__(self) -> None:
        super().__init__()
        self._responses_total: int = 0
        self._last_query: Optional[str] = None
        self._last_knowledge_available: Optional[bool] = None
        self._last_citation_count: Optional[int] = None
        self._last_at: Optional[str] = None
        self._last_latency_ms: Optional[float] = None

    def record_response(
        self,
        *,
        query: str,
        knowledge_available: bool,
        citation_count: int,
        latency_ms: Optional[float] = None,
    ) -> None:
        """Called by the synthesis route after each successful compose."""
        self._responses_total += 1
        snippet = (query or "").strip()
        if len(snippet) > _MAX_LAST_QUERY_CHARS:
            snippet = snippet[:_MAX_LAST_QUERY_CHARS].rstrip() + "…"
        self._last_query = snippet
        self._last_knowledge_available = bool(knowledge_available)
        self._last_citation_count = max(0, int(citation_count))
        self._last_at = datetime.now(timezone.utc).isoformat()
        if latency_ms is None:
            self._last_latency_ms = None
        else:
            # Clamp to non-negative and round to 0.1ms — the wall-clock
            # resolution we need for a status pane, not a profiler.
            self._last_latency_ms = round(max(0.0, float(latency_ms)), 1)

    def status(self) -> Dict[str, Any]:
        s = super().status()
        s.update(
            responses_total=self._responses_total,
            last_query=self._last_query,
            last_knowledge_available=self._last_knowledge_available,
            last_citation_count=self._last_citation_count,
            last_at=self._last_at,
            last_latency_ms=self._last_latency_ms,
        )
        return s

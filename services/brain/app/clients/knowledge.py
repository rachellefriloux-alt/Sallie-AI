"""Thin HTTP client for the knowledge service.

The brain calls this to ground responses in retrieved Wikipedia chunks.
Kept dependency-light: just httpx and dataclasses. Failures bubble up as
:class:`KnowledgeUnavailable` so callers can degrade gracefully.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List

import httpx


class KnowledgeUnavailable(RuntimeError):
    """Raised when the knowledge service is unreachable or errored."""


@dataclass(frozen=True)
class KnowledgeHit:
    id: str
    score: float
    text: str
    metadata: Dict[str, Any]


class KnowledgeClient:
    def __init__(self, *, base_url: str, timeout_s: float = 10.0) -> None:
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout_s

    @property
    def base_url(self) -> str:
        return self._base_url

    async def health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                r = await client.get(f"{self._base_url}/health")
                return r.status_code == 200
        except httpx.HTTPError:
            return False

    async def query(self, text: str, *, limit: int = 5) -> List[KnowledgeHit]:
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                r = await client.post(
                    f"{self._base_url}/query",
                    json={"query": text, "limit": limit},
                )
                r.raise_for_status()
                payload = r.json()
        except httpx.HTTPError as exc:
            raise KnowledgeUnavailable(
                f"knowledge unreachable at {self._base_url}: {exc}"
            ) from exc
        return [
            KnowledgeHit(
                id=str(h["id"]),
                score=float(h["score"]),
                text=str(h["text"]),
                metadata=dict(h.get("metadata") or {}),
            )
            for h in payload.get("hits", [])
        ]

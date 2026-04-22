"""Brain → knowledge-service proxy routes.

These are *thin* — the brain forwards a query to the knowledge service
and returns its hits. Mobile clients can talk to either service, but
having the brain expose ``/knowledge/query`` keeps the phone with a single
backend URL to remember.
"""
from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.clients.knowledge import KnowledgeClient, KnowledgeUnavailable
from app.config import settings

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


def _client(request: Request) -> KnowledgeClient:
    """Reuse a singleton client per app, lazily constructed."""
    client = getattr(request.app.state, "knowledge_client", None)
    if client is None:
        client = KnowledgeClient(base_url=settings.knowledge_base_url)
        request.app.state.knowledge_client = client
    return client


class KnowledgeQueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    limit: int = Field(default=5, ge=1, le=50)


class KnowledgeHitOut(BaseModel):
    id: str
    score: float
    text: str
    metadata: Dict[str, Any]


class KnowledgeQueryResponse(BaseModel):
    query: str
    upstream: str
    hits: List[KnowledgeHitOut]


@router.get("/health")
async def knowledge_health(request: Request) -> dict:
    client = _client(request)
    return {"upstream": client.base_url, "ok": await client.health()}


@router.post("/query", response_model=KnowledgeQueryResponse)
async def knowledge_query(
    request: Request, body: KnowledgeQueryRequest
) -> KnowledgeQueryResponse:
    client = _client(request)
    try:
        hits = await client.query(body.query, limit=body.limit)
    except KnowledgeUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    return KnowledgeQueryResponse(
        query=body.query,
        upstream=client.base_url,
        hits=[
            KnowledgeHitOut(id=h.id, score=h.score, text=h.text, metadata=h.metadata)
            for h in hits
        ],
    )

"""HTTP routes for the knowledge service."""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.ingest import Document
from app.runtime import Runtime

router = APIRouter(tags=["knowledge"])


def _runtime(request: Request) -> Runtime:
    rt: Optional[Runtime] = getattr(request.app.state, "runtime", None)
    if rt is None:
        raise HTTPException(status_code=503, detail="knowledge runtime not ready")
    return rt


# ---- schemas -------------------------------------------------------------


class DocumentIn(BaseModel):
    id: str = Field(..., min_length=1, max_length=256)
    title: str = Field(default="")
    text: str
    is_wikitext: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class IngestRequest(BaseModel):
    documents: List[DocumentIn] = Field(..., min_length=1, max_length=500)


class IngestResponse(BaseModel):
    documents: int
    chunks: int
    skipped_documents: int


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    limit: int = Field(default=5, ge=1, le=50)


class QueryHit(BaseModel):
    id: str
    score: float
    text: str
    metadata: Dict[str, Any]


class QueryResponse(BaseModel):
    query: str
    hits: List[QueryHit]


class StatsResponse(BaseModel):
    embedder: str
    store: str
    dim: int
    collection: str
    count: int


# ---- routes --------------------------------------------------------------


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@router.get("/ready")
async def ready(request: Request) -> dict:
    rt = _runtime(request)
    return {
        "ready": True,
        "embedder": rt.embedder_kind,
        "store": rt.store_kind,
        "dim": rt.embedder.dim,
    }


@router.get("/stats", response_model=StatsResponse)
async def stats(request: Request) -> StatsResponse:
    rt = _runtime(request)
    return StatsResponse(
        embedder=rt.embedder_kind,
        store=rt.store_kind,
        dim=rt.embedder.dim,
        collection=rt.settings.collection,
        count=await rt.store.count(),
    )


@router.post("/ingest", response_model=IngestResponse)
async def ingest(request: Request, body: IngestRequest) -> IngestResponse:
    rt = _runtime(request)
    docs = [
        Document(
            id=d.id,
            title=d.title,
            text=d.text,
            is_wikitext=d.is_wikitext,
            metadata=d.metadata,
        )
        for d in body.documents
    ]
    stats = await rt.ingestor.ingest(docs)
    return IngestResponse(
        documents=stats.documents,
        chunks=stats.chunks,
        skipped_documents=stats.skipped_documents,
    )


@router.post("/query", response_model=QueryResponse)
async def query(request: Request, body: QueryRequest) -> QueryResponse:
    rt = _runtime(request)
    [vector] = await rt.embedder.embed([body.query])
    hits = await rt.store.search(vector, limit=body.limit)
    return QueryResponse(
        query=body.query,
        hits=[
            QueryHit(id=h.id, score=h.score, text=h.text, metadata=h.metadata)
            for h in hits
        ],
    )

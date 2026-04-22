"""Synthesis routes — grounded responses from the brain.

`POST /synthesis/respond` is the brain's "talk to me" endpoint. It:

1. Takes a user query.
2. Pulls top-N chunks from the knowledge service (via the same client the
   /knowledge proxy uses, so we share the singleton on app.state).
3. Composes a grounded answer with citations.

Tests inject ``app.state.composer`` directly so they don't need the
knowledge service.
"""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

from app.clients.knowledge import KnowledgeClient
from app.config import settings
from app.synthesis import Composer

router = APIRouter(prefix="/synthesis", tags=["synthesis"])


def _composer(request: Request) -> Composer:
    composer = getattr(request.app.state, "composer", None)
    if composer is not None:
        return composer
    # Lazy default: reuse the existing knowledge client singleton if one
    # was created by the /knowledge routes; otherwise create one.
    knowledge = getattr(request.app.state, "knowledge_client", None)
    if knowledge is None:
        knowledge = KnowledgeClient(base_url=settings.knowledge_base_url)
        request.app.state.knowledge_client = knowledge
    composer = Composer(knowledge=knowledge)
    request.app.state.composer = composer
    return composer


# ---- schemas ------------------------------------------------------------


class RespondRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=4000)
    limit: int = Field(default=4, ge=1, le=20)


class CitationOut(BaseModel):
    id: str
    title: str
    score: float


class RespondResponse(BaseModel):
    query: str
    answer: str
    citations: List[CitationOut]
    knowledge_available: bool


# ---- routes -------------------------------------------------------------


@router.post("/respond", response_model=RespondResponse)
async def respond(request: Request, body: RespondRequest) -> RespondResponse:
    composer = _composer(request)
    result = await composer.compose(body.query, limit=body.limit)
    return RespondResponse(
        query=result.query,
        answer=result.answer,
        citations=[
            CitationOut(id=c.id, title=c.title, score=c.score)
            for c in result.citations
        ],
        knowledge_available=result.knowledge_available,
    )

"""Sallie Knowledge — FastAPI entrypoint.

Tiny by design: configures the runtime (embedder + vector store +
ingestor), wires the router, and exposes the app at module scope so
``uvicorn app.main:app`` works.

Tests do *not* import this; they construct ``Runtime`` themselves with
in-memory components and mount :data:`app.routes.router` on a fresh app.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import router as knowledge_router
from app.runtime import Runtime

logging.basicConfig(level=settings.log_level)
log = logging.getLogger("sallie.knowledge")


@asynccontextmanager
async def lifespan(app: FastAPI):
    runtime = Runtime.from_settings(settings)
    await runtime.start()
    app.state.runtime = runtime
    log.info(
        "Sallie knowledge online — embedder=%s store=%s",
        runtime.embedder_kind, runtime.store_kind,
    )
    try:
        yield
    finally:
        log.info("Sallie knowledge offline")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Sallie Knowledge",
        version="0.1.0",
        description=(
            "Wikipedia-backed RAG service. Owns ingestion (Wikipedia dumps "
            "or arbitrary documents), embedding (Ollama by default), and "
            "vector retrieval (Qdrant)."
        ),
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(knowledge_router)
    return app


app = create_app()

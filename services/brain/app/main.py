"""
Sallie Brain — FastAPI entrypoint.

This is the central process that hosts Sallie's nine cognitive systems
and exposes them over HTTP. It is intentionally thin: each system lives
in its own module under `app.systems`, and this file only orchestrates
their lifecycle and routes requests to them.

See ../README.md for the architectural picture.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.runtime import Brain
from app.routes import convergence as convergence_routes
from app.routes import health as health_routes
from app.routes import knowledge as knowledge_routes
from app.routes import systems as systems_routes

logging.basicConfig(level=settings.log_level)
log = logging.getLogger("sallie.brain")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Boot every cognitive system at startup, shut them down on exit."""
    brain = Brain()
    await brain.start()
    app.state.brain = brain
    log.info("Sallie brain online — %d systems running", len(brain.systems))
    try:
        yield
    finally:
        await brain.stop()
        log.info("Sallie brain offline")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Sallie Brain",
        version="0.1.0",
        description=(
            "Reasoning core for Sallie. Hosts the nine cognitive systems "
            "(Limbic, Memory, Monologue, Synthesis, Agency, Dream Cycle, "
            "Degradation, Control, Convergence)."
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

    app.include_router(health_routes.router)
    app.include_router(convergence_routes.router)
    app.include_router(knowledge_routes.router)
    app.include_router(systems_routes.router)
    return app


app = create_app()

"""Health and readiness routes."""
from __future__ import annotations

from fastapi import APIRouter, Request

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict:
    """Liveness probe — always returns ok if the process is up."""
    return {"status": "ok"}


@router.get("/ready")
async def ready(request: Request) -> dict:
    """Readiness probe — reports per-system status."""
    brain = request.app.state.brain
    systems = brain.status()
    all_ready = all(s["running"] for s in systems.values())
    return {"ready": all_ready, "systems": systems}

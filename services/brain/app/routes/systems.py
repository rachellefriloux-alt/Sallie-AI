"""Per-system status routes."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

router = APIRouter(prefix="/systems", tags=["systems"])


@router.get("")
async def list_systems(request: Request) -> dict:
    return {"systems": request.app.state.brain.status()}


@router.get("/{name}")
async def get_system(name: str, request: Request) -> dict:
    brain = request.app.state.brain
    system = brain.systems.get(name)
    if system is None:
        raise HTTPException(status_code=404, detail=f"unknown system: {name}")
    return system.status()

"""Common base class for cognitive systems."""

from __future__ import annotations

from typing import Any, Dict


class CognitiveSystem:
    """
    Minimal lifecycle contract every system implements.

    Phase-1 implementations are stubs: they report `running` but do no real
    work yet. Subsequent phases replace each `tick()` body with the actual
    algorithm pulled from `legacy/Sallie/server/`.
    """

    name: str = "system"

    def __init__(self) -> None:
        self._running = False

    async def start(self) -> None:
        self._running = True

    async def stop(self) -> None:
        self._running = False

    async def tick(self) -> None:
        """One scheduler step — overridden by subclasses."""

    def status(self) -> Dict[str, Any]:
        return {"name": self.name, "running": self._running}

"""
Brain runtime — owns the nine cognitive systems and their lifecycle.

Each system is a small class with `start()`, `stop()`, and `status()`.
This module wires them up and exposes them to the rest of the app.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Dict

from app.systems.agency import AgencySystem
from app.systems.control import ControlSystem
from app.systems.convergence import ConvergenceSystem
from app.systems.degradation import DegradationSystem
from app.systems.dream_cycle import DreamCycleSystem
from app.systems.limbic import LimbicSystem
from app.systems.memory import MemorySystem
from app.systems.monologue import MonologueSystem
from app.systems.synthesis import SynthesisSystem
from app.systems.base import CognitiveSystem

log = logging.getLogger("sallie.brain.runtime")


class Brain:
    """Container for Sallie's nine cognitive systems."""

    def __init__(self) -> None:
        # Order matters for some startup dependencies, e.g. Limbic before
        # Monologue (Monologue reads Limbic state). Convergence comes first
        # because if it isn't complete, the rest run in a "pre-birth" mode.
        self.systems: Dict[str, CognitiveSystem] = {
            "convergence": ConvergenceSystem(),
            "limbic": LimbicSystem(),
            "memory": MemorySystem(),
            "monologue": MonologueSystem(),
            "synthesis": SynthesisSystem(),
            "agency": AgencySystem(),
            "dream_cycle": DreamCycleSystem(),
            "degradation": DegradationSystem(),
            "control": ControlSystem(),
        }

    async def start(self) -> None:
        for name, system in self.systems.items():
            try:
                await system.start()
                log.info("system %s started", name)
            except Exception:  # noqa: BLE001 - we want to keep booting others
                log.exception("system %s failed to start", name)

    async def stop(self) -> None:
        await asyncio.gather(
            *(system.stop() for system in self.systems.values()),
            return_exceptions=True,
        )

    def status(self) -> Dict[str, dict]:
        return {name: system.status() for name, system in self.systems.items()}

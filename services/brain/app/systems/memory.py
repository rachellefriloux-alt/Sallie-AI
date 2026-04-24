"""Memory system — hierarchical episodic / semantic / emotional / procedural.
Phase 4 replaces this stub with the implementation imported from
`legacy/Sallie/server/working_memory_hygiene.py` and `legacy/before/`."""

from __future__ import annotations

from collections import deque
from typing import Any, Deque, Dict, List

from app.systems.base import CognitiveSystem


class MemorySystem(CognitiveSystem):
    name = "memory"

    def __init__(self, working_capacity: int = 16) -> None:
        super().__init__()
        self._working: Deque[dict] = deque(maxlen=working_capacity)
        self._episodic: List[dict] = []

    def remember(self, event: dict) -> None:
        self._working.append(event)
        self._episodic.append(event)

    def recent(self, n: int = 5) -> List[dict]:
        return list(self._working)[-n:]

    def status(self) -> Dict[str, Any]:
        s = super().status()
        s.update(
            working_size=len(self._working),
            episodic_size=len(self._episodic),
        )
        return s

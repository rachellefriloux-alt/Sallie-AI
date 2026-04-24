"""Monologue — Sallie's continuous inner voice.

Phase 5 turns this into a real LLM-driven loop. For now it just buffers
the most recent self-talk strings."""

from __future__ import annotations

from collections import deque
from typing import Any, Deque, Dict

from app.systems.base import CognitiveSystem


class MonologueSystem(CognitiveSystem):
    name = "monologue"

    def __init__(self, capacity: int = 32) -> None:
        super().__init__()
        self._stream: Deque[str] = deque(maxlen=capacity)

    def speak(self, line: str) -> None:
        self._stream.append(line)

    def latest(self, n: int = 5) -> list[str]:
        return list(self._stream)[-n:]

    def status(self) -> Dict[str, Any]:
        s = super().status()
        s["buffered"] = len(self._stream)
        return s

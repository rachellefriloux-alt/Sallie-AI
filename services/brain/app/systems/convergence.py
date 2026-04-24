"""
Convergence — the birth / onboarding flow.

Holds the 40-question bank and the per-session answer state. Phase 1
exposes read-only access to the question bank plus a minimal session
API so the mobile app can drive the flow end-to-end. Heritage-DNA
synthesis (mapping answers → `persona.json`) is wired in Phase 4.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.systems.base import CognitiveSystem

DATA_DIR = Path(__file__).resolve().parent.parent / "convergence" / "data"


class ConvergenceSystem(CognitiveSystem):
    name = "convergence"

    def __init__(self) -> None:
        super().__init__()
        self._questions: List[dict] = []
        self._phases: List[dict] = []
        self._sessions: Dict[str, dict] = {}

    async def start(self) -> None:
        await super().start()
        self._questions = json.loads((DATA_DIR / "questions.json").read_text())
        self._phases = json.loads((DATA_DIR / "phases.json").read_text())["phases"]

    # ---- read API ---------------------------------------------------------

    @property
    def questions(self) -> List[dict]:
        return self._questions

    @property
    def phases(self) -> List[dict]:
        return self._phases

    def question(self, qid: int) -> Optional[dict]:
        return next((q for q in self._questions if q["id"] == qid), None)

    # ---- session API ------------------------------------------------------

    def begin_session(self) -> str:
        sid = str(uuid.uuid4())
        self._sessions[sid] = {
            "id": sid,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "current_question": 1,
            "answers": {},
            "complete": False,
        }
        return sid

    def session(self, sid: str) -> Optional[dict]:
        return self._sessions.get(sid)

    def submit_answer(self, sid: str, qid: int, answer: Any) -> dict:
        sess = self._sessions.get(sid)
        if sess is None:
            raise KeyError(f"unknown session: {sid}")
        if self.question(qid) is None:
            raise KeyError(f"unknown question id: {qid}")
        sess["answers"][str(qid)] = {
            "value": answer,
            "answered_at": datetime.now(timezone.utc).isoformat(),
        }
        # advance pointer
        next_id = qid + 1
        if next_id > len(self._questions):
            sess["complete"] = True
            sess["current_question"] = None
        else:
            sess["current_question"] = next_id
        return sess

    def status(self) -> Dict[str, Any]:
        s = super().status()
        s.update(
            total_questions=len(self._questions),
            total_phases=len(self._phases),
            active_sessions=len(self._sessions),
        )
        return s

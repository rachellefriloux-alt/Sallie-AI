"""Convergence (birth / onboarding) routes."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(prefix="/convergence", tags=["convergence"])


class AnswerIn(BaseModel):
    question_id: int
    answer: Any


def _system(request: Request):
    return request.app.state.brain.systems["convergence"]


@router.get("/phases")
async def get_phases(request: Request) -> dict:
    sys = _system(request)
    return {"phases": sys.phases, "total_questions": len(sys.questions)}


@router.get("/questions")
async def get_questions(request: Request) -> dict:
    sys = _system(request)
    return {"questions": sys.questions, "count": len(sys.questions)}


@router.get("/questions/{qid}")
async def get_question(qid: int, request: Request) -> dict:
    q = _system(request).question(qid)
    if q is None:
        raise HTTPException(status_code=404, detail=f"no question {qid}")
    return q


@router.post("/sessions")
async def begin_session(request: Request) -> dict:
    sid = _system(request).begin_session()
    return {"session_id": sid}


@router.get("/sessions/{sid}")
async def get_session(sid: str, request: Request) -> dict:
    sess = _system(request).session(sid)
    if sess is None:
        raise HTTPException(status_code=404, detail=f"no session {sid}")
    return sess


@router.post("/sessions/{sid}/answer")
async def submit_answer(sid: str, body: AnswerIn, request: Request) -> dict:
    try:
        return _system(request).submit_answer(sid, body.question_id, body.answer)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

"""Synthesis system — Phase-1 stub. See legacy/Sallie/server/ for the
upstream implementation that will be ported in a later phase."""

from __future__ import annotations

from app.systems.base import CognitiveSystem


class SynthesisSystem(CognitiveSystem):  # noqa: D401
    name = "synthesis"

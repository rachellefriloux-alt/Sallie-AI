# Sallie — Implementation Checklist: In-Scope Requirements

These items are **required by the spec** (EDIT ME.md and SALLIE_MERGED_SPEC.md). They were already supposed to be in Sallie; this doc tracks implementation status. Update Status as work completes.

**How to use:** Pick items by priority; set Status to **Done** when shipped (add date or version). Spec section = where the requirement is defined.

---

## 1. Experience & Daily Use

| Requirement | Spec § | Status |
|-------------|--------|--------|
| Proactive “before you ask” (patterns, calendar, open loops, stress → offer help) | §10, §11.2.2 (Shoulder Tap), §10.4 | |
| Continuity across devices (same conversation, limbic, context Desktop → Web → Android) | §9.5 (sync, one Sallie everywhere) | |
| Offline queue + sync (queue actions when local down; reconcile when back online) | §9.5 | |
| Genesis/Convergence UX (30 questions, progress, save/resume, optional depth) | §14 | |
| Recovery from mistakes (“That wasn’t what I meant” → rephrase/undo + Sallie explains) | §11.3.1 | |
| Voice quality & latency (local TTS/STT; optional voice cloning) | §9.1.2, §11.4 | |
| Quiet hours / focus mode (no Shoulder Taps unless crisis or override) | §10.4.5 | |

---

## 2. Reliability & Resilience

| Requirement | Spec § | Status |
|-------------|--------|--------|
| Sync protocol (local ↔ Azure; last-write-wins or Creator-chosen; no silent overwrites) | §9.5 | |
| Conflict resolution UI (Local vs Cloud diff; Creator chooses or merges) | §9.5 | |
| Health & observability (limbic, sync status, last backup, model/version in Dashboard/API) | §11.1.1 | |
| Backup/restore UX (one-click backup; clear restore flow) | §11.1.1, §18.3 | |
| Graceful degradation (UI explains what’s limited when Ollama/Qdrant/backend down) | §18 | |

---

## 3. Intelligence & Capability

| Requirement | Spec § | Status |
|-------------|--------|--------|
| 52k knowledge base (6-tier topic model) | §6, plan, SALLIE_MERGED_SPEC §6.3 | |
| ARCHITECT / ORACLE / OPTIMIZER operational modes (first-class) | §6, SALLIE_MERGED_SPEC §6.4 | |
| Parity checklist (Siri/Alexa/Copilot/Gemini/Meli/CopyMind → done/partial/planned) | §6 | |
| Thought cloning (CopyMind): mirror Creator style and reasoning | Plan / merged spec | |
| Habit & goal tracking (Meli-style); follow up and celebrate streaks | Plan / merged spec | |
| “Why did you do that?” (one-sentence explanation + link to rule/context per autonomous action) | §8 | |

---

## 4. Trust & Transparency

| Requirement | Spec § | Status |
|-------------|--------|--------|
| Action history (timeline of file edits, sends, tool calls; expandable; rollback where supported) | §11.1.1, §8.3 | |
| Rollback UX (one-tap “Undo last action” with scope and confirmation) | §8.3, §11 | |
| Drift reports visible (after Foundry runs, “what changed” in Settings or dedicated page) | §11.1.1, §12.4.2 | |
| Loyalty invariant visible (Settings or About: “Loyalty to you never changes”) | §11.1.1 | |

---

## 5. Platform & Ecosystem

| Requirement | Spec § | Status |
|-------------|--------|--------|
| Desktop, Web, Android (primary platforms) | Start here, §11 | |
| iOS app (optional; full 3-platform parity) | — | |
| Browser extension (optional: “Talk to Sallie” / “Save to Sallie”) | — | |
| Public API (actor-aware, trust-tier-aware; §25) | §25 | |
| Plugin directory (optional: curated plugins, capability contracts) | — | |

---

## 6. Identity & Presence

| Requirement | Spec § | Status |
|-------------|--------|--------|
| Avatar reflects limbic state and posture (calm / focused / supportive) | §11.1.1 | |
| Sallie’s Sanctuary in UI (Dashboard place for her thoughts, interests, dreams) | §11.1.1, SALLIE_MERGED_SPEC | |
| Mood/energy visible (limbic visualization: Trust, Warmth, Arousal, Valence) | §11.3.2 | |
| Voice identity (warm alto, textural; optional cloning) | §9.1.2, SALLIE_MERGED_SPEC | |

---

## 7. Privacy & Control

| Requirement | Spec § | Status |
|-------------|--------|--------|
| Full data export (Heritage, memories, logs; standard format e.g. JSON) | §23.5 | |
| Right-to-be-forgotten UX (delete memory/topic/range; confirmation; tombstone) | §23.4 | |
| Per-capability toggles (Creator can turn off specific tools without losing the rest) | §8.5 | |
| Kinship UX (add Kin, set permissions, see what each Kin can access) | §13.6 | |

---

## Spec Maintenance

- **Source of truth:** [EDIT ME.md](EDIT ME.md) (Master Architectural Specification); [SALLIE_MERGED_SPEC.md](SALLIE_MERGED_SPEC.md) for identity and capabilities.
- When an item is **Done**, set Status and optionally add a short note (e.g. version or date).
- If the spec changes, update the Spec § column so the checklist stays aligned.

# legacy/PersonaPilot/ — snapshot metadata

**Source:** https://github.com/rachellefriloux-alt/PersonaPilot
**Scanned:** 2026-04-28
**Role:** Sibling local-first AI assistant. Same architectural thesis
as Sallie (FastAPI + Qdrant + Whisper + Ollama, multi-agent, hybrid
privacy modes), packaged as an Electron desktop app with a 9-tab UI.
**Not** part of the original eight-way merge; surfaced during the
follow-up org-wide sweep in this commit.

## Why it's a *reference* snapshot, not a full code import

PersonaPilot's own self-assessment
([`PERSONAPILOT_VS_SALLIE_ANALYSIS.md`](https://github.com/rachellefriloux-alt/PersonaPilot/blob/main/PERSONAPILOT_VS_SALLIE_ANALYSIS.md))
puts it at *~15% of Sallie's intended feature set*: the chat tab is
unconnected to a real LLM, several tabs are placeholders, and the
memory / personality / values / device-control systems that define
Sallie are not yet implemented. Lifting code from it would mean
re-doing in C/Python/JS work the brain already does in `services/brain/`
and the legacy `Sallie/` snapshot already has at higher fidelity.

What's worth lifting is **shape**, not implementation.

## What's worth porting (tracked for future phases)

| PersonaPilot artefact | Where in Sallie's roadmap | Why |
|---|---|---|
| Per-agent metadata schema `{agent, purpose, autonomy ∈ {proactive, reactive}, privacy ∈ {full, hybrid, restricted}}` (the README's "Available Agents" table) | Phase 4/5 — Skills registry | Sallie's plan calls for "50+ tool slots" but doesn't yet have a typed contract for declaring an autonomy/privacy profile per skill. PersonaPilot's classification is a clean prior art. |
| 9-tab Electron desktop layout (Chat / Tasks / Calendar / Notes / Health / Finance / Family / Learning / Code) | Phase 2 — desktop client | Concrete reference layout when we scaffold a desktop wrapper around the brain. |
| Privacy-mode toggle (`PRIVACY_MODE=full|hybrid|restricted`, `ALLOW_AUTO_ACTIONS=false`) as an env switch | Phase 1.4 — settings/observability | Maps onto Sallie's "consent-gated agency" doctrine (ADR 0004). Worth lifting the env-var contract. |
| RAG modes (`Perplexity` / `Concise` / `Copilot` — top-10/top-3/top-5 with different prompts) | Phase 3 — knowledge service | Sallie's `services/knowledge/` is a single mode today; PersonaPilot's three-mode split is a real product idea. |
| Whisper + Coqui TTS local pipeline | Phase 6 — voice | Already on Sallie's roadmap; PersonaPilot has a working `stt_tts.py` reference. |
| Local model bootstrapping script (`scripts/models/download-models.ps1`) | Phase 0.6 — workspace foundations / DevEx | One-command "download Mistral + Whisper + Coqui to local cache" is something Sallie's compose stack lacks. |

## What was *intentionally not* mirrored

* All source code. Re-fetch from upstream if needed.
* The 30+ status / completion / roadmap markdown files at the repo
  root — these are PersonaPilot-internal project-management notes,
  not Sallie design intent.
* The 58 KB `MULTI_REPO_SALLIE_CAPABILITIES_ANALYSIS.md` — it
  enumerates capability gaps already covered by our existing
  `MERGE_NOTES.md` strategic-doc index plus `VISION.md`.

## Convention conflicts vs. Sallie

| Decision | PersonaPilot | Sallie canonical (per VISION.md) |
|---|---|---|
| Frontend wrapper | Electron + React | Expo / React Native (mobile); Vue + Vite (web). Electron is a *future* desktop target. |
| Vector DB | Qdrant | Qdrant — agreement |
| LLM | Mistral 7B local + optional OpenAI/Anthropic | Ollama + llama3.1:8b local; GitHub Models for cloud (per ADR 0007). PersonaPilot's "swap a `MODEL_TYPE` env var" is consistent with our approach. |
| Skill model | Single flat list of "agents" | Cognitive systems (the 9) **plus** a separate skills/tools registry (Phase 4/5). |

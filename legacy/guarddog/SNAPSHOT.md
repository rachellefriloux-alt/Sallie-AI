# legacy/guarddog/ — snapshot metadata

**Source:** https://github.com/rachellefriloux-alt/guarddog
**Scanned:** 2026-04-28
**Role:** Local-first home security system (Ring + EseeCloud cameras,
local YOLO inference on CPU, OneDrive-backed clip/snapshot storage,
NestJS backend + React/Electron/Android clients). Different problem
domain from Sallie (CCTV vs. personal companion), but shares the
"adapter wraps an opaque source → device-registry + event stream →
WebSocket alerts to clients" pattern that Sallie will need when it
gains proactive sensors.

**Not** part of the original eight-way merge; surfaced during the
follow-up org-wide sweep in this commit.

## Why it's a *reference* snapshot, not a full code import

guarddog is a separate product. There's no Sallie feature today that
would consume its code directly. But the architectural shape it codifies
is genuinely useful as Sallie grows into the Phase 7 "proactive sensors"
territory described in `VISION.md` — agents that watch external streams
(camera, calendar, mail, files), classify events with a local model,
and wake the user only when warranted.

## What's worth porting (tracked for future phases)

| guarddog artefact | Where in Sallie's roadmap | Why |
|---|---|---|
| Adapter pattern: `{Device, Event, Clip, Snapshot}` core entities + per-source `adapters/<name>/` modules with a uniform `getFrame()` / event-emit contract | Phase 7 — Proactive sensors | Generalises cleanly to "watcher skills" that observe a feed and produce `Event` rows for the agency system. |
| `ws/alerts` WebSocket gateway with motion/AI/system event channels | Phase 7 — Sensors + Phase 4 — Realtime client transport | Sallie has nothing yet on the realtime push side; this is a clean shape. |
| Internal vs. public API split (`/api` for clients, `/internal` for adapters + AI) | Phase 1.4 — Service boundaries | Mirrors the `services/brain/` ↔ `services/knowledge/` split we already have; codifying the convention is useful. |
| Local YOLO (ultralytics) on CPU as a separate Python sidecar that polls frames over HTTP | Phase 7 — Sensors + Phase 6 — Multi-AI | "Heavyweight inference runs in its own process, talks to the brain over HTTP" is the same shape as `services/knowledge/`. |
| OneDrive-as-storage convention (everything writes under a sync folder, no S3 dependency) | Phase 9 — Distribution / personal-cloud variant | Useful for the "local-first power user" persona Sallie targets. |
| Strict "Hard Constraints" section in README that enumerates what the system must never do (e.g. "never assume RTSP for C90") | Project-wide doctrine practice | Worth adopting as a convention in `services/*/README.md` files. |

## What was *intentionally not* mirrored

* All source code. Re-fetch from upstream if needed.
* The EseeCloud-specific desktop-app screen-capture machinery — too
  domain-specific to be portable.
* The Ring / `ring-mqtt` integration — same.

## Convention conflicts vs. Sallie

| Decision | guarddog | Sallie canonical (per VISION.md) |
|---|---|---|
| Backend language | Node.js + TypeScript + NestJS | Python + FastAPI for the brain. Sallie *does* allow per-service language choice (e.g. `services/knowledge/` could be Node), so a future "sensors" service might reasonably copy guarddog's Nest stack — but a Python+FastAPI port is the more consistent default. |
| Realtime | NestJS WebSocket gateway | Sallie has no realtime layer yet — Phase 7 adds one. |
| Inference | YOLOv8n on CPU via ultralytics | Sallie uses Ollama (text); a vision sidecar would be additive. |
| Auth | Single-user `email + password_hash` | Sallie's full JWT + refresh-token rotation (Phase 1.0/1.1). guarddog's auth is too thin to lift. |

# legacy/email-assistant/ — snapshot metadata

**Source:** https://github.com/rachellefriloux-alt/email-assistant
**Scanned:** 2026-04-28
**Role:** Standalone Gmail assistant — FastAPI + React + Vite + Tailwind,
SQLite/Postgres, Docker Compose / Helm / Terraform / Prometheus + Grafana
deployment artefacts, GPT-powered reply generation. **Not** part of the
original eight-way merge; surfaced during the follow-up org-wide sweep
in this commit.

## Why it's a *reference* snapshot, not a full code import

email-assistant is a single-purpose product (Gmail triage + reply
suggestions). Sallie's product surface is much broader, but a Gmail
skill is on the Sallie roadmap (Phase 4/5 Skills, mirroring the
"Inbox Triage" agent in PersonaPilot's roster). When that phase
lands, this repo is the natural source-of-truth for the implementation
because it already solves: OAuth, threading, categorisation, bulk
operations, reply templates with variable substitution, and scheduled
fetching.

Until then, mirroring the code into `legacy/email-assistant/` would
make this monorepo larger without giving us anything actionable.

## What's worth porting (tracked for future phases)

| email-assistant artefact | Where in Sallie's roadmap | Why |
|---|---|---|
| Gmail OAuth flow + token-refresh service (`backend/app/auth/`) | Phase 4 — Email skill | Reusable verbatim; the OAuth boilerplate is the long pole. |
| `categorize/email` zero-shot classifier with keyword fallback | Phase 4 — Email skill | Cleaner than reaching for an LLM for every message. |
| Email-threading endpoints (`/threads/`, `/threads/{id}/emails`, archive/unarchive) | Phase 4 — Email skill | Conversation grouping is a hard-to-get-right feature. |
| Reply-template engine with `{{variable}}` substitution and usage tracking | Phase 4 — Email skill, also Phase 5 — Personality (tone-aware drafting) | Aligns with Sallie's persona-driven response generation. |
| Per-account scheduler (`/scheduler/account`, `/scheduler/jobs`) | Phase 4 — Skills runtime | Sallie will need a generic per-skill scheduler; this is one concrete shape. |
| Bulk operations endpoints | Phase 4 — Email skill | Convenience layer; trivial port. |
| Prometheus + Grafana monitoring stack with `alert.rules.yml` | Phase 1.4 — Observability (OTel/metrics) | Concrete `alert.rules.yml` is a useful starting template. |
| Helm chart + raw k8s manifests + Terraform AWS/GCP starters | Phase 9 — Distribution | Sallie's compose stack covers local dev; this fills the cloud-deploy gap. |

## What was *intentionally not* mirrored

* All source code. Re-fetch from upstream if needed.
* The Docker/Helm/Terraform deployment artefacts — they assume a
  single-product topology that doesn't match Sallie's monorepo.
  We'll lift the *patterns* in Phase 9, not the files.

## Convention conflicts vs. Sallie

| Decision | email-assistant | Sallie canonical (per VISION.md) |
|---|---|---|
| LLM provider | OpenAI (`gpt-4o-mini`) hardcoded; Gemini for some paths | Ollama local default; cloud models swappable via `SALLIE_RESPONDER` (ADR 0007). Skill ports must add the abstraction. |
| Database | SQLite dev / PostgreSQL prod | Same |
| Frontend | React + Vite + Tailwind | Vue + Vite (web); Expo (mobile). React port goes in the desktop client. |
| Auth | Implicit (single-user app) | JWT + refresh-token rotation per `services/brain/app/auth/` (Phase 1.0/1.1). The skill has to gate every action through the brain's auth middleware. |

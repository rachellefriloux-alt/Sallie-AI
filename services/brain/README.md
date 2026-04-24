# services/brain

Sallie's reasoning core. A FastAPI app that hosts the **nine cognitive
systems** and exposes them over HTTP.

> Phase 1 status: the app boots, all nine systems start, `/health` and
> `/ready` respond, and the **40-question Convergence flow** is fully
> driveable end-to-end. Most systems are intentional stubs that get
> filled in by later phases per `VISION.md`.

## Quick start

```bash
# from this directory
docker-compose up --build
# then:
curl http://localhost:8000/health
curl http://localhost:8000/ready
curl http://localhost:8000/convergence/phases
```

Or without Docker:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Endpoints

| Method | Path                                           | Notes                                      |
|--------|------------------------------------------------|--------------------------------------------|
| GET    | `/health`                                      | Liveness                                   |
| GET    | `/ready`                                       | Per-system status (all 9)                  |
| GET    | `/systems`                                     | Status of every system                     |
| GET    | `/systems/{name}`                              | Status of one system                       |
| GET    | `/convergence/phases`                          | The 6 phases (Obsidian → Visage)           |
| GET    | `/convergence/questions`                       | All 40 questions                           |
| GET    | `/convergence/questions/{id}`                  | One question                               |
| POST   | `/convergence/sessions`                        | Begin a birth session                      |
| GET    | `/convergence/sessions/{sid}`                  | Inspect session                            |
| POST   | `/convergence/sessions/{sid}/answer`           | Submit an answer; advances pointer         |

## Convergence (the birth flow)

40 questions across 6 phases:

| # | Phase                 | Questions | Theme                                          |
|---|-----------------------|-----------|------------------------------------------------|
| 1 | Obsidian Protocol     | Q1–Q5     | Boundaries — the Shield                        |
| 2 | Leopard Protocol      | Q6–Q12    | Ambition — the Engine                          |
| 3 | Peacock Protocol      | Q13–Q17   | Morality — the Code                            |
| 4 | Celestial Protocol    | Q18–Q23   | Love — the Heart                               |
| 5 | Void Protocol         | Q24–Q29   | Final Union — the Binding                      |
| 6 | **Visage Protocol**   | **Q30–Q40** | **Face & Voice — the Form** *(new)*          |

Phases 1–5 (Q1–29) come from the canonical Heritage DNA spec carried
forward verbatim from `legacy/Sallie/shared/genesis/`. Phase 6 (Q30–40)
is added to satisfy the requirement that Convergence also creates
Sallie's *face and visual personality* — palette, shape language, eyes,
expression baseline, motion, voice pitch, voice pace, names, first
words, and final composite confirmation.

Question text and metadata live in
[`app/convergence/data/questions.json`](app/convergence/data/questions.json).
Phase manifest in
[`app/convergence/data/phases.json`](app/convergence/data/phases.json).

## Clients

- **Mobile app:** `lib/brain.ts` at the repo root is the typed TypeScript
  client used by the Expo React Native app. The drawer screen
  `app/(drawer)/brain-status.tsx` shows a live readout of `/ready`
  with per-system status and pull-to-refresh — the first real
  phone↔brain connection.
- **Knowledge proxy:** the brain forwards `/knowledge/health` and
  `/knowledge/query` to `services/knowledge/` (see
  `app/clients/knowledge.py` + `app/routes/knowledge.py`). Mobile uses
  `lib/knowledge.ts` to call these — that way the phone only knows one
  backend URL.
- **Synthesis:** `POST /synthesis/respond` is the brain's "talk to me"
  endpoint. It pulls top-N chunks from the knowledge service, composes a
  grounded prompt + cited answer, and degrades gracefully (200 with
  `knowledge_available=false`) if knowledge is down. The responder is
  pluggable — the default emits a deterministic citation-tagged answer
  with no LLM dependency. Set `SALLIE_RESPONDER=github_models` plus a
  non-empty `GITHUB_TOKEN` to route generation through GitHub Models
  (OpenAI-compatible API at `https://models.github.ai/inference`).
  Optional tuning: `SALLIE_RESPONDER_MODEL` (default `openai/gpt-4.1`),
  `SALLIE_RESPONDER_TEMPERATURE` (default `1.0`), `SALLIE_RESPONDER_TOP_P`
  (default `1.0`). If the upstream call fails (auth, rate limit, network,
  empty response) the request falls back to a short user-facing degraded
  message and `/synthesis/respond` still returns 200. See
  `app/synthesis/composer.py`.

## Tests

```bash
pytest
```

Seven smoke tests cover health, readiness, the 40-question bank, the
6-phase manifest, the session API, and 404 behavior.

## What's stubbed (filled in by later phases)

| System        | Phase-1 status                | Filled in by |
|---------------|-------------------------------|--------------|
| Convergence   | **Real** — 40-question flow   | Phase 4: Heritage-DNA synthesis → `persona.json` |
| Limbic        | Stub (baseline state only)    | Phase 4 (port `legacy/Sallie/server/enhanced_limbic_engine.py`) |
| Memory        | Working buffer only           | Phase 4 (port `working_memory_hygiene.py` + `legacy/before/`) |
| Monologue     | String buffer only            | Phase 5 (LLM-driven loop) |
| Synthesis     | Stub                          | Phase 5 |
| Agency        | Stub                          | Phase 5 (port `shared/services/agencyService.ts`) |
| Dream Cycle   | Stub                          | Phase 5 (port `server/dream_cycle*.py`) |
| Degradation   | Stub                          | Phase 5 |
| Control       | Stub                          | Phase 5 |

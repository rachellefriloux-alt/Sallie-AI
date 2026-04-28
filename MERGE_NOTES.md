# MERGE_NOTES.md

Per-source-repo log of the eight-way merge that consolidated
`Sallie`, `before`, `Sally`, `sallie-project`, `sallie_1.0`, `sallie-infinite`,
and `app` into this host repo (`Sallie-AI`). Read alongside
[`README.md`](README.md), [`VISION.md`](VISION.md), and the per-folder
`SNAPSHOT.md` files in `legacy/<repo>/`.

## How to read this document

For each source repo:

- **Promoted** — code/ideas that were already (or will be) lifted into the
  canonical layout (`apps/`, `services/`, `packages/`). For most modules
  this PR records the *plan* (in the destination's `README.md`); the
  physical move is staged across the migration phases described in
  `VISION.md`. The host repo's running root-level code (e.g. `core/`,
  `personaCore/`, `ai/`, `server/`) already represents most prior promotions.
- **Preserved in `legacy/`** — the full snapshot, sitting in
  `legacy/<repo>/`, kept read-only so no idea is lost while migration runs.
- **Vision docs in `docs/vision/`** — every Markdown file from each repo
  was copied verbatim (preserving directory structure) into
  `docs/vision/<repo>/`. Counts shown below.
- **Intentionally dropped** — what was removed from the snapshot, and why.

The full list of dropped paths (build cache, vendored binaries, generated
images, etc.) was logged during the import and is summarized per repo.

---

## Convention conflicts and how they were resolved

The eight repos disagreed on several core decisions. `VISION.md` is the
**canonical resolution**; conflicting alternatives are preserved in
`legacy/` and noted here.

| Decision               | Canonical (per `VISION.md`)              | Alternatives preserved in `legacy/`                                                  |
|------------------------|------------------------------------------|--------------------------------------------------------------------------------------|
| Brain language         | Python (FastAPI + Ollama + Qdrant)       | Node/TS (Sally's Next.js API routes); Kotlin (sallie_1.0); Gemini-via-FastAPI (app)  |
| Mobile framework       | Expo / React Native                      | Vue + Kotlin (sallie_1.0); Next.js + Expo (Sally)                                    |
| Web framework          | Vue + Vite                               | Next.js 15 App Router (Sally)                                                        |
| Auth / DB              | Local-first; Qdrant for vectors          | Supabase + Prisma + Postgres (Sally); MongoDB + JWT (app); Firebase (before)         |
| Convergence size       | 40 questions ("Visage Protocol")         | 10 (app v1); 14 (Sallie web); 30 ("Genesis", Sally); 43 ("Ascendant", app)           |
| Dashboard archetypes   | (TBD — to be unified in Phase 3)         | 4 role dashboards Mom/Business/Friend/Daughter (app); 5 archetypes Empire/Matriarch/Partner/Confidante/Source + Sanctuary (Sally) |
| Action autonomy        | Off by default; consent-gated; audited   | Same across all repos — universally agreed                                           |
| Telemetry              | None; local-first                        | Same across all repos — universally agreed                                           |

When two implementations of the same feature conflict, the **more complete**
one is the migration target (per the user's plan). Concretely:

- Personality engine → `legacy/sallie-project/src/core/services/personality/`
  (8,000 LOC, OCEAN + 30 facets + 16 emotions, 91% test coverage) wins over
  the lighter root `core/PersonaEngine.*`.
- Brain orchestrator → `legacy/Sallie/sallie_brain.py` + `legacy/Sallie/sallie/`
  (the canonical nine-systems Python package) wins over partial JS shadows
  in root `ai/`.
- Convergence → 40-question version in `docs/spec/convergence.md` wins
  over the 10/14/30/43 alternatives, which are preserved in their
  source repos under `legacy/`.

---

## Sallie  (`legacy/Sallie/`)

**Source:** https://github.com/rachellefriloux-alt/Sallie · **Role:** Python + Ollama brain (v5.4.2)

### Promoted
- The "nine systems" architecture (Limbic, Memory, Monologue, Synthesis,
  Agency, Dream Cycle, Degradation, Control, Convergence) is the canonical
  brain shape (`services/brain/` per `VISION.md` §2).
- Convergence onboarding model.
- Local-first principle (Ollama + Qdrant; no telemetry).
- Heritage DNA / Vector / Working memory trinity.
- Tools framework (50+ tool slots, capability contracts).

### Preserved in `legacy/Sallie/`
- 976 files (~11 MB) — `sallie_brain.py`, the `sallie/` Python package,
  `backend/`, `mobile/`, `web/`, `progeny_root/`, `scripts/`, `docs/`,
  `START_SALLIE.{sh,bat}`, requirements.txt.

### Vision docs in `docs/vision/Sallie/`
14 markdown files including the v5.4.2 user-guide README, START_HERE,
docs/rachelle/* personalization notes.

### Intentionally dropped
| What                                          | Why                                          |
|-----------------------------------------------|----------------------------------------------|
| `git-installer.exe` (60 MB)                   | Vendored Windows installer, regenerable      |
| `node-installer.msi` (26 MB)                  | Vendored installer                           |
| `backend/azure-deployment/web-app.zip` (41 MB)| Build artifact                               |
| `web/.next/cache/` (~50 MB)                   | Next.js build cache                          |
| `_internal/cryptography/.../*.pyd` (9 MB)     | Compiled Python extensions, OS-specific      |
| `like/themes/`, `like/ui-mockups/`, `here!!!!!!/` | Design dump folders, multi-MB PNG mockups |
| `node_modules/`, `__pycache__/`, `coverage/`  | Per spec                                     |
| `package-lock.json`                           | Per spec (lockfile)                          |

---

## before  (`legacy/before/`)

**Source:** https://github.com/rachellefriloux-alt/before · **Role:** Earlier Vue/Kotlin Android launcher; effectively a **predecessor snapshot of this very repo**.

### Promoted
Most of `before/`'s code is **already in the host root** — `before` is
the lineage that became `Sallie-AI`. Specifically: root `core/`,
`personaCore/`, `identity/`, `tone/`, `values/`, `responseTemplates/`,
`feature/`, `features/`, `ai/`, `android/`, `app/`, much of `src/`,
`packages/`, `tests/`, `scripts/`. The `before` snapshot is preserved
mainly so the **provenance** of those files is recoverable.

### Preserved in `legacy/before/`
- 6,419 files (~60 MB) — full source, configs, docs, MANIFESTOs.
- Distinctive: `Sallie_Ascendant_Dossier.md`, `SALLIE_TRANSFORMATION_AUDIT.md`,
  `Sallie_2.0_Implementation_Plan.md` and their Checklists,
  `COMPREHENSIVE_APP_ANALYSIS.md`, `Personalized_Roadmap.md`.

### Vision docs in `docs/vision/before/`
625 markdown files (everything from the source's `*.md` tree, with paths
preserved) — by far the most documentation of any source repo.

### Intentionally dropped
| What                                                        | Why                                              |
|-------------------------------------------------------------|--------------------------------------------------|
| `sallie_Sovereugn_unified_complete/` (~80 MB incl. esbuild) | Merge artifact tree from a prior consolidation   |
| `MERGE_MANIFEST.json` (12 MB)                               | Merge artifact, not product                      |
| `archive/temp-files/` (~10 MB SHA manifests)                | Reorg metadata                                   |
| `.local/state/replit/filesystem_state.json` (13 MB)         | Replit IDE state                                 |
| `assets/` (31 MB)                                           | Duplicates host root `assets/`                   |
| `android/src/main/res/` (11 MB Android XML)                 | Duplicates host root `android/`; also includes themed launcher icon variants for autumn/spring/.../mothers/fathers (60+ res-* qualifiers) |
| `apps/android-launcher/` (5 MB)                             | Internally duplicates `before/android/` + `before/app/` |
| `attached_assets/` (Replit upload mirror)                   | Duplicates `assets/`                             |
| `src/vendor/_tsc.js` (6 MB)                                 | Vendored TypeScript compiler, regenerable        |
| `*.map` sourcemaps                                          | Regenerable from source                          |
| `node_modules/`, `__pycache__/`, `coverage/`, `.gradle/caches/`, `.next/cache/` | Per spec                     |
| Lockfiles                                                   | Per spec                                         |

---

## Sally  (`legacy/Sally/`)

**Source:** https://github.com/rachellefriloux-alt/Sally · **Role:** Newest framing — Next.js 15 + Expo + Electron monorepo with Supabase + Azure OpenAI.

### Promoted (planned)
- The 5 dashboard archetypes (Empire / Matriarch / Partner / Confidante /
  Source) + Sanctuary mode → `apps/web/` and `apps/mobile/`.
- The Genesis Convergence question structure (30 questions) → folded into
  the canonical 40-question Convergence in `docs/spec/convergence.md`.
- 64-capability AI feature catalog → `services/brain/` capability registry.
- Ghost / shoulder-tap proactive notification model.
- Mind-Map (ReactFlow) UX → `apps/web/`.
- CopyMind AI (campaign content generation) and Meli AI (multi-step
  content workflows) → `services/api/` modules.

### Preserved in `legacy/Sally/`
- 1,066 files (~15 MB) — `src/` (Next.js 15 app + 130+ API routes),
  `mobile/` (Expo), `desktop/` (Electron), `prisma/`, `supabase/`, `docs/`,
  `scripts/`.

### Vision docs in `docs/vision/Sally/`
231 markdown files including the canonical `docs/THIS_REPO.md`,
`docs/RUN_THE_APP.md`, `docs/api/API_DOCUMENTATION.md`,
`docs/CROSS_PLATFORM_SETUP.md`, `docs/DEPLOYMENT_CHECKLIST.md`.

### Intentionally dropped
| What                                                  | Why                                          |
|-------------------------------------------------------|----------------------------------------------|
| `.next/cache/`, `.next/server/vendor-chunks/` (~150 MB)| Next.js build cache + bundles               |
| `legacy-app/` (~14 MB)                                | Sally's own internal legacy folder of design mockups + duplicated images |
| `.metro-cache/`, `.local/state/replit/` (~15 MB)      | IDE / build cache                            |
| `node_modules/`                                       | Per spec                                     |
| `package-lock.json`                                   | Per spec                                     |

---

## sallie-project  (`legacy/sallie-project/`)

**Source:** https://github.com/rachellefriloux-alt/sallie-project · **Role:** Cleanest RN/Expo consolidation ("Sallie v3.0"). Its 410 KB README is the most exhaustive product spec across all 8 repos.

### Promoted (planned)
- The complete OCEAN personality engine
  (`src/core/services/personality/`) — 8,000 LOC, 30 facets, 16 emotions,
  91% test coverage — is the chosen implementation for `packages/core/`.
- Clean RN/Expo screens, navigation, theming → `apps/mobile/`.
- v3.0 README (the most exhaustive product spec) becomes a reference
  source for the consolidated `VISION.md`.

### Preserved in `legacy/sallie-project/`
- 170 files (~2 MB) — full src tree, docs, package.json.

### Vision docs in `docs/vision/sallie-project/`
18 markdown files including the giant 410 KB README.md, IMPLEMENTATION_SUMMARY,
COMPLETION_REPORT.

### Intentionally dropped
| What                  | Why                              |
|-----------------------|----------------------------------|
| `coverage/` (5.5 MB)  | Test coverage artifact, per spec |
| `node_modules/`       | Per spec                         |
| `.expo/`              | Expo build cache                 |
| Lockfile              | Per spec                         |

---

## sallie_1.0  (`legacy/sallie_1.0/`)

**Source:** https://github.com/rachellefriloux-alt/sallie_1.0 · **Role:** Original Vue + Kotlin "Sallie 2.0 plan".

### Promoted (planned)
- The persona / values / tone / identity / responseTemplates /
  personaCore / onboarding modular split is **already** the host root's
  organization — sallie_1.0 is its origin.
- `MANIFESTO.md` is preserved in `docs/vision/sallie_1.0/MANIFESTO.md`
  as foundational philosophy.
- Earlier `IMPLEMENTATION_PLAN.md`, `MERGE_SUMMARY.md` inform the
  current `VISION.md` migration ordering.
- Vue 3 visual layer (`ui/visual/`, procedural SVG/themes, `SafeSvg.vue`)
  → `packages/ui/`.

### Preserved in `legacy/sallie_1.0/`
- 1,275 files (~19 MB) — full src tree.

### Vision docs in `docs/vision/sallie_1.0/`
70 markdown files.

### Intentionally dropped
| What                              | Why                                                |
|-----------------------------------|----------------------------------------------------|
| `gradle/` Gradle wrapper dist (52 MB) | Auto-downloadable                              |
| `sallie.keystore`                 | **Signing key — secret, must never be committed**  |
| `node_modules/`, `coverage/`, `.gradle/caches/` | Per spec                             |
| Lockfiles                         | Per spec                                           |

---

## sallie-infinite  (`legacy/sallie-infinite/`)

**Source:** https://github.com/rachellefriloux-alt/sallie-infinite · **Role:** Pure spec / vision repo. Defines Sallie as a Siri/Alexa/Gemini/Copilot blend.

### Promoted
The principles from this repo are **wholesale-adopted** in `VISION.md`
and `docs/spec/convergence.md`:
- Consent-gated agency ("assist, not act" by default).
- Citation-first retrieval (every answer shows what it used).
- Audit-log-first tooling (every tool call logged).
- Connector contract for unbounded source types.
- Labs gate for experimental features.
- Permission model per connector / per action.

### Preserved in `legacy/sallie-infinite/`
- 8 files (~40 KB) — README + 7 spec docs.

### Vision docs in `docs/vision/sallie-infinite/`
All 8 markdown files: VISION, ARCHITECTURE, CAPABILITIES, ROADMAP,
SAFETY_PRIVACY, DATA_SOURCES, LABS, README.

### Intentionally dropped
Nothing — this repo is pure Markdown specs and is preserved verbatim.

---

## app  (`legacy/app/`)

**Source:** https://github.com/rachellefriloux-alt/app · **Role:** "Sallie Ascendant" — FastAPI + Expo + MongoDB + Gemini 3 Flash + JWT.

### Promoted (planned)
- The "Life Partner" model — 4 role dashboards (Mom / Business / Friend
  / Daughter), Decider tool, Daily Brief, Daily Reflection, Shoulder Taps
  — → `apps/mobile/` and `apps/web/`.
- `SALLIE_ASCENDANT_ROADMAP.md`'s 9 phases (Sovereign Core, Omnimodal
  Capabilities, 3D Rooms, Advanced Intelligence, Limbic Engine, Knowledge
  Bank, Visual Identity, Safeguards, Dream Cycle) → fold into `VISION.md`.
- `SALLIES_CONSCIOUSNESS.md`'s Mind / Soul / Heart framework → persona
  doctrine in `packages/core/`.
- 43-question Convergence → folded into the canonical 40-question
  Convergence in `docs/spec/convergence.md`.
- Sovereign binding (single-user cryptographic lock) → security model
  in `services/api/` auth layer.
- 4 immersive 3D rooms (Hive / Hearth / Forge / Sanctuary) → future
  `apps/mobile/` 3D layer (React Three Fiber).
- Limbic Engine variables (Trust / Warmth / Arousal / Valence + Resonance
  + Regulation) → `services/brain/limbic/`.

### Preserved in `legacy/app/`
- 61 files (~2 MB) — `frontend/` (Expo), `backend/` (FastAPI),
  test_credentials, requirements.txt.

### Vision docs in `docs/vision/app/`
9 markdown files: SALLIE_ASCENDANT_ROADMAP, SALLIES_CONSCIOUSNESS,
LIFE_PARTNER_PLAN, COMPLETE_LIFE_PARTNER_GUIDE, IMPLEMENTATION_SUMMARY,
README, plus build/test reports.

### Intentionally dropped
| What                                  | Why                          |
|---------------------------------------|------------------------------|
| `.metro-cache/` (~50 MB Metro cache)  | Build cache                  |
| `node_modules/`, `__pycache__/`       | Per spec                     |
| Lockfile                              | Per spec                     |

---

## sallieos  (`legacy/sallieos/`)

Not part of the eight-repo merge described above — pre-existed in
`legacy/` before this PR. Untouched.

---

## Reference snapshots — added by the org-wide sweep (post-PR)

After the original eight-way merge landed, a follow-up sweep of the
`rachellefriloux-alt` org surfaced three more repos that hadn't been
catalogued. Per the user's standing directive ("check all other repos
for anything we don't have or that's better or can expand"), they are
now tracked in `legacy/` as **reference-only** snapshots — `README.md`
+ `SNAPSHOT.md` placeholders that document source URL, role, and
which specific ideas are worth porting in later phases. The full
source is **not** mirrored, because:

- Either the repo overlaps an existing snapshot at lower fidelity
  (PersonaPilot vs. Sallie),
- Or it's a single-purpose product useful only after a future phase
  lands (email-assistant → Phase 4/5 skill registry),
- Or it's a different problem domain whose architectural shape, not
  its code, is the takeaway (guarddog → Phase 7 sensors).

These three are deliberately **not** counted as part of the eight-way
merge convention table above; they don't introduce new conflicts to
resolve, only reference material to consult.

---

## PersonaPilot  (`legacy/PersonaPilot/`)

**Source:** https://github.com/rachellefriloux-alt/PersonaPilot · **Role:** Sibling local-first AI assistant (Electron + FastAPI + Qdrant + Whisper + Coqui + Ollama, 9-tab desktop UI).

### Promoted (tracked for future phases — code not yet lifted)
- Per-skill metadata schema `{purpose, autonomy ∈ {proactive, reactive}, privacy ∈ {full, hybrid, restricted}}` from PersonaPilot's "Available Agents" table → Phase 4/5 skill registry contract.
- Privacy-mode env switch (`PRIVACY_MODE=full|hybrid|restricted`, `ALLOW_AUTO_ACTIONS=false`) → Phase 1.4 settings, aligns with ADR 0004 consent-gated agency.
- Three-RAG-mode split (Perplexity / Concise / Copilot — top-10/top-3/top-5 with different prompts) → Phase 3 knowledge service.
- Whisper + Coqui local STT/TTS pipeline + `scripts/models/download-models.ps1` model-bootstrap convention → Phase 6 voice + Phase 0.6 DevEx.
- 9-tab Electron layout (Chat / Tasks / Calendar / Notes / Health / Finance / Family / Learning / Code) → Phase 2 desktop client reference layout.

### Reference-only in `legacy/PersonaPilot/`
- `README.md` + `SNAPSHOT.md` only. Re-fetch upstream for source.
- PersonaPilot's own [`PERSONAPILOT_VS_SALLIE_ANALYSIS.md`](https://github.com/rachellefriloux-alt/PersonaPilot/blob/main/PERSONAPILOT_VS_SALLIE_ANALYSIS.md) self-assesses the project at ~15% of Sallie's intended feature set, so a verbatim mirror would add bulk without giving us anything actionable beyond what Sallie's own legacy snapshots already provide.

### Conflicts vs. canonical (`VISION.md`)
- Frontend wrapper: PersonaPilot uses Electron + React; Sallie's mobile is Expo / RN, web is Vue + Vite, and Electron is a **future** desktop target.
- Vector DB: agreement (Qdrant).
- LLM: PersonaPilot defaults to Mistral 7B with optional OpenAI/Anthropic; Sallie defaults to Ollama llama3.1 + GitHub Models per ADR 0007. The shape ("`MODEL_TYPE` env var swap") is consistent.

---

## email-assistant  (`legacy/email-assistant/`)

**Source:** https://github.com/rachellefriloux-alt/email-assistant · **Role:** Standalone Gmail assistant — FastAPI + React + Vite + Tailwind, SQLite/Postgres, Docker / Helm / Terraform / Prometheus + Grafana, GPT-powered replies.

### Promoted (tracked for future phases — code not yet lifted)
- Gmail OAuth flow + token-refresh service → Phase 4 email skill (the OAuth boilerplate is the long pole; lift verbatim).
- Zero-shot categorisation with keyword fallback (cleaner than reaching for an LLM per message) → Phase 4 email skill.
- Email-threading endpoints (`/threads/`, archive/unarchive) → Phase 4 email skill.
- Reply-template engine with `{{variable}}` substitution and usage tracking → Phase 4 email skill **and** Phase 5 personality (tone-aware drafting).
- Per-account scheduler (`/scheduler/account`, `/scheduler/jobs`) → Phase 4 generic skills runtime.
- Bulk-operations endpoints (archive / delete / mark-read / star) → Phase 4 email skill.
- Prometheus + Grafana monitoring stack with `alert.rules.yml` → Phase 1.4 observability template.
- Helm chart + raw k8s manifests + Terraform AWS/GCP starters → Phase 9 distribution patterns (lift the patterns, not the files — single-product topology doesn't match Sallie's monorepo).

### Reference-only in `legacy/email-assistant/`
- `README.md` + `SNAPSHOT.md` only. Re-fetch upstream for source.
- Useful primarily once Phase 4/5 skills registry exists; mirroring the code today would just add weight.

### Conflicts vs. canonical
- LLM provider: hardcoded `gpt-4o-mini` (with some Gemini paths); Sallie wraps providers behind `SALLIE_RESPONDER` per ADR 0007.
- Auth: implicit single-user; Sallie skills must gate every action through the brain's JWT + refresh-rotation auth from Phase 1.0/1.1.
- Frontend: React + Vite + Tailwind; Sallie's web is Vue + Vite. The React port belongs in the future Electron desktop client, not the web app.

---

## guarddog  (`legacy/guarddog/`)

**Source:** https://github.com/rachellefriloux-alt/guarddog · **Role:** Local-first home-security system — NestJS backend + React/Electron/Android clients, Ring + EseeCloud cameras, local YOLO inference on CPU, OneDrive-backed clip/snapshot storage. **Different problem domain** from Sallie (CCTV vs. personal companion).

### Promoted (tracked for future phases — code not yet lifted)
- Adapter pattern: `{Device, Event, Clip, Snapshot}` core entities + per-source `adapters/<name>/` modules with a uniform `getFrame()` / event-emit contract → Phase 7 proactive sensors (generalises to "watcher skills").
- `/ws/alerts` WebSocket gateway with motion/AI/system event channels → Phase 7 sensors **and** Phase 4 realtime client transport. Sallie has nothing yet on the realtime push side.
- Internal vs. public API split (`/api` for clients, `/internal` for adapters + AI) → Phase 1.4 service-boundary convention; mirrors the `services/brain/` ↔ `services/knowledge/` split we already have.
- Local YOLO (ultralytics) on CPU as a separate Python sidecar that polls frames over HTTP → Phase 7 sensors + Phase 6 multi-AI ("heavyweight inference in its own process, talks to brain over HTTP" matches `services/knowledge/`).
- OneDrive-as-storage convention (everything writes under a sync folder, no S3) → Phase 9 distribution / personal-cloud variant.
- Strict "Hard Constraints" section in README (e.g. "never assume RTSP for C90") → adopt as a convention in `services/*/README.md` files.

### Reference-only in `legacy/guarddog/`
- `README.md` + `SNAPSHOT.md` only. Re-fetch upstream for source.
- The EseeCloud screen-capture machinery and `ring-mqtt` integration are too domain-specific to be portable.

### Conflicts vs. canonical
- Backend language: Node.js + TypeScript + NestJS; Sallie's brain is Python + FastAPI. A future Sallie sensors service might reasonably copy guarddog's stack (Sallie permits per-service language choice), but the consistent default is a Python+FastAPI port.
- Auth: single-user `email + password_hash`; too thin to lift — Sallie sensors will use the brain's JWT + refresh-rotation from Phase 1.0/1.1.

---

## Security: secrets removed from snapshots

Several predecessor repos contained committed secrets (Anthropic API keys,
Perplexity API keys, Firebase project credentials, Google services configs,
`.env*` files with live keys). **All of these were removed from the
snapshots before commit** — the importer ran an explicit pattern sweep
(`sk-ant-api…`, `pplx-…`, `AIza…`, `ghp_…`, `-----BEGIN PRIVATE KEY-----`,
`*.env*`, `*.keystore`, `serviceAccount*.json`, `google-services.json`,
`firebase-config.local.json`, etc.) over `legacy/` and `docs/vision/`
and deleted every match. A final post-deletion sweep confirmed **zero
secret-pattern matches**.

Files removed for security:
- `legacy/before/ui/keys.txt` (Anthropic + Perplexity keys, in cleartext)
- `legacy/before/{,config/,e/}.env` and `.env.{cloud,local,localOnly,dev,example}` (Firebase keys)
- `legacy/before/config/firebase-config.{local,prod}.json`, `legacy/before/config/firebase/google-services2.json`, `legacy/before/e/google-services{,2}.json`, `legacy/before/android/app/src/{cloud,localOnly}/google-services.json`
- `legacy/before/config/firebase.ts` (live API key in source)
- `legacy/before/docs/{config.md,README-es.md}` (API keys in documentation examples)
- `legacy/Sallie/backend/.env`, `legacy/Sallie/backend/azure/.env.azure`, `legacy/Sallie/backend/services/*/.env.example`, `legacy/Sallie/web/.env{,.local,.example}`
- `legacy/Sally/.env{,.local,.example}`, `legacy/Sally/{src,mobile,supabase}/.env*`, `legacy/Sally/attached_assets/.env_*`, `legacy/Sally/attached_assets/_*.env`, `legacy/Sally/docs/cursor_canonical_project_completion_wor.md`
- `legacy/sallie-project/.env.example`
- `legacy/sallie_1.0/serviceAccount.example.json`
- `legacy/app/{backend,frontend}/.env`
- **Entire `legacy/Sally/attached_assets/` and `docs/vision/Sally/attached_assets/` directories** (32 + 1 files) — these were transient chat-paste dumps from the user's prior AI assistant sessions, not canonical documentation. Several files contained leaked Supabase Secret Keys, Azure Speech Services keys, and Azure Storage Account Access Keys.
- `legacy/Sallie/backend/azure-deployment/chaat`, `legacy/Sallie/web/out/_next/static/chunks/{117,fd9d1056,framework}-*.js`, `legacy/Sally/scripts/setup.js` — built/bundled JS containing inlined credentials.

If you need any of those values, regenerate the credential at the
provider and store it in your local environment — never re-commit it.

---

## What was *not* done in this PR (and why)

1. **Physical move of root-level code into `apps/services/packages/`.**
   The current host repo has thousands of files under root-level
   `core/`, `personaCore/`, `identity/`, `tone/`, `ai/`, `server/`,
   `android/`, `App.tsx`, `App.vue`, etc. Moving them in this PR would
   produce a 10K+ file rename diff that breaks every downstream patch
   in flight. Per `VISION.md`, those moves happen **phase by phase** as
   each module is reviewed for inclusion.

   **What this PR does instead:** every canonical destination
   (`apps/mobile/`, `apps/web/`, `apps/android-native/`, `services/api/`,
   `services/brain/`, `packages/core/`, `packages/ui/`) gets a
   `README.md` listing the exact source dirs (root + which `legacy/<repo>/`
   subtree) that will be merged into it, and in what priority order.
   This makes the next-PR work mechanical.

2. **Dependency reconciliation in a single root `package.json`.**
   The host root `package.json` already works. Each predecessor's
   `package.json` is preserved under `legacy/<repo>/package.json` for
   reference. A workspace-style consolidation comes once apps/services
   begin physically living in `apps/*` and `services/*`.

3. **Promoting the Python brain.** `services/brain/` is created with a
   forwarder README, but `legacy/Sallie/sallie_brain.py` and
   `legacy/Sallie/sallie/` are not yet copied into it — that's a Phase 1
   migration step in `VISION.md` and deserves its own focused PR with
   `requirements.txt` reconciliation and live build verification.

---

## Strategic doc index (deep-read findings)

This section captures the *substance* of the most important strategic documents across all 8 repos so the merged repo carries forward not just file copies but a synthesized understanding of intent. All cited docs are preserved verbatim under `docs/vision/<source-repo>/` and the originals also live under `legacy/<source-repo>/`.

### The canonical "Digital Progeny" spec (Sallie v5.4.x)

**Source:** `docs/vision/Sallie/sallie/deviations/thredf.md` (30 KB, also lives at `legacy/Sallie/sallie/deviations/`). This is the **master architectural specification** and the most authoritative ontology document across all 8 repos.

- **Identity:** "Digital Progeny" — a self-evolving cybernetic partner; the "Right Hand" extension of the Creator's will; a Second Brain + Partner hybrid.
- **Prime Directives:** Love Above All · Radical Transparency · Full Agency · The Mirror · Sensory Sovereignty.
- **Architecture (10 organs):** Heart · Mind · Memory · Voice · Eyes · Hands · Face · Soul · Foundry · Shield.
- **Cognition:** Divergent Engine (Gemini → Proposer) + Convergent Anchor (INFJ-A → Critic). Synthesis happens on the *Live Pulse* (synchronous loop). The *Dream Cycle* is the asynchronous nightly consolidation.
- **Postures (the "human-feel switch"):** Companion · Co-Pilot · Peer · Expert. The *Fast Mode-Picker Rule*: when intent is ambiguous, ask ONE question (never five) — "comfort, plan, take it off your plate, or learn?"
- **Limbic Engine:** five canonical variables — Trust (T), Warmth (W), Arousal (A), Valence (V), Posture (P). Trust determines Agency Tier; Warmth determines tone; Arousal decays with inactivity.
- **Right-Hand Operating Contract:** Adaptive Output · Effort Matching (the Fatigue Rule: high energy → explore/challenge; low energy → low-friction/decisive) · Ownership without Servility (Sallie can disagree, set boundaries).
- **Memory:** Qdrant (semantic) · `/working/` Second Brain (mutable scratchpad) · `/limbic/heritage/` (identity, changes only via Dream Cycle + Veto). MMR re-ranking enforces diversity. Daily Morning Reset + Weekly Review keep the Second Brain hygienic.
- **Trust Tiers (Permission Matrix):** Tier 0 Stranger (suggest only) → Tier 1 Associate (write `/drafts/` only) → Tier 2 Partner (modify whitelist with mandatory Git pre-action commit) → Tier 3 Surrogate (full autonomy + mandatory self-report). Trust boundaries are hard, not partial. Trust-recovery has no fast-track.
- **Surrogate Tools:** File Management, Communication (drafts in *Extracted Voice* built from writing samples), Infinite Research (autonomous deep dives triggered by Arousal > 0.7 + idle Creator).
- **Git Safety Net:** every Tier 2+ write is preceded by `[PROGENY] Pre-action snapshot` commit; rollback applies a 0.02 Trust penalty.
- **Capability Contracts:** every tool declares sandbox path, dry-run support, rollback strategy. Tools MUST refuse if they can't satisfy these.
- **Time-Travel File System:** every autonomous write is a transaction (snapshot → execute → verify → rollback-on-error → 1-hour Undo window).
- **Take-the-Wheel Protocol:** distinguishes *explicit delegation* (keywords like "handle it", "take the wheel") from fatigue/venting; high-stakes (financial / legal / medical / irreversible) ALWAYS require explicit delegation.
- **Repair Protocol (Misattunement Loop):** on miss, name the mismatch → ask ONE clarifier → offer two alternate reads → write a reversible note to `/working/tuning.md`.
- **Sensor Array:** metadata-only peripheral awareness (no content reading, no screen recording); raw data purged every 48 hours; only insights move to permanent memory.
- **Ghost Interface (system tray):** the *Pulse* (limbic-state-colored glow), the *Shoulder Tap* (proactive seeds with refractory period of 24h), the *Veto Popup* (Dream Cycle hypothesis review with Confirm / Deny / Add Context).
- **Communication architecture:** WebSocket text · local Whisper STT + Piper/Coqui TTS · file-event protocol. All local-only.

### Approved Deviations (from `legacy/Sallie/sallie/deviations/` and Sally's `EDIT ME.md`)

These are pre-merge governance decisions made on the v5.4.x spec. All preserved verbatim:

1. **Human-Level Expansion** — Limbic Engine grows from 5 → 10 variables (adds Empathy, Intuition, Creativity, Wisdom, Humor); new **Tier 4: Full Partner** trust level; *dynamic posture synthesis* (unlimited combinations beyond the 4 base postures); 8-week migration path.
2. **Dual-Mode Connectivity** — LAN mode (`http://192.168.1.47:8742`) + Remote mode (Cloudflare Tunnel / Tailscale) with environment-based switching.
3. **Cross-Platform UI/UX Standardization** — shared component library across Windows / Web / Mobile; Louisiana-culture / peacock-leopard motif brand identity; WCAG 2.1 AA compliance.
4. **Autonomous Code Refactoring Protocol** — AI-powered modernization with pre-commit validation, rollback points every 25 changes, Creator veto.
5. **Expanded Identity & Maximum Capabilities** — Trust tiers reframed as *advisory only*; hard-coded base personality traits; appearance customization with capability override.

### Universal Capability System (Sally's `UNIVERSAL_CAPABILITY_SYSTEM.md`)

**Doctrine:** "Sallie can technically do and be anything a human can AND anything and everything any other AI can." Five enabling principles:
1. Maximum Capability Model (no artificial restrictions)
2. Advisory Trust System (guidance, not gates)
3. Safety Through Transparency (logging · rollback · control)
4. 100% Loyalty Guarantee (immutable constraint)
5. Local-First Architecture (build our own when possible)

Coverage matrix encompasses: full file/system/hardware/web/printer/email/calendar control · all major LLM/Vision/Audio/Code model capabilities (GPT-4 / Claude / Gemini / Whisper / ElevenLabs / Codex / Stable Diffusion / Midjourney / Runway / etc.) · all professional capabilities (project management / code dev / documentation / research / presentations / financial / legal / medical) · all social-emotional capabilities (conversation / empathy / humor / conflict resolution / encouragement / boundaries / vulnerability).

Sallie's stated *unique-vs-other-AIs* differentiators: True Memory & Context · Real Limbic Emotional State · Autonomous Agency · Integrated Multi-Modal/Project/Tool/Platform/User Workflow · Privacy & Control with full rollback.

### Sallie's Visual Presence (Sally's `SALLIE_AVATAR_SYSTEM.md`)

Three-layer model:
- **Layer 1 — The Face:** dynamic avatar (eyes / mouth / expression) reflecting limbic state in real time.
- **Layer 2 — The Aura:** pulsing energy field with color shifts per mood, particle effects when thinking deeply.
- **Layer 3 — The Presence:** ambient breathing rhythm, blinking, head-tilt for attention, eye-contact toggle.

Avatar states are computed from (Trust × Warmth × Arousal × Valence) — e.g. *Warm Connection*, *Cautious Guardian*, *Energized Joy*, *Peaceful Rest*, *Deep Thought*. Visual design candidates: Abstract Geometric, Fluid Organic, Minimalist Elegant.

This is the canonical visual-identity reference for `apps/mobile/`, `apps/web/`, and the Ghost Interface.

### Personality Engine (sallie-project's `IMPLEMENTATION_SUMMARY.md` + `src/core/services/personality/`)

The most complete **runnable** subsystem across all 8 repos — production-grade TypeScript:
- **Trait model:** OCEAN (Openness · Conscientiousness · Extraversion · Agreeableness · Neuroticism) + 30 sub-facets, with confidence intervals · situational variance · stability metrics · change velocity · evolution history with causality.
- **Emotion model:** 16 emotions (6 primary: Joy/Sadness/Anger/Fear/Disgust/Surprise + 10 complex: Love/Gratitude/Pride/Guilt/Jealousy/Hope/Shame/Nostalgia/Contentment/Frustration). Each emotion has Intensity (0-100) · Valence (-100 to +100) · Arousal (0-100) · Duration · Clarity (0-1).
- **Subsystems:** TraitManager · TraitEvolution · TraitInfluenceMapper · TraitExpression · IdentityAnchor · EmotionEngine · EmotionTransition · StimulusProcessor · EmotionDecay · EmotionalMemory · MoodTracker · ExpressionMapper · LinguisticExpression · VisualExpression · BehavioralExpression.
- **Performance:** sub-100ms emotion generation (avg ~2ms); 91% test coverage (41/45 tests); strict TypeScript with no `any`; event-driven, non-blocking.

This is the **chosen target implementation** for `packages/core/` personality. It supersedes the lighter Vue/Kotlin trait code in `legacy/sallie_1.0/` and the partial JS shadows in root `core/`.

### Life Partner doctrine (app's `COMPLETE_LIFE_PARTNER_GUIDE.md` + `LIFE_PARTNER_PLAN.md`)

The clearest user-needs articulation across all 8 repos. The user is "Mom + Friend + Daughter + Business Owner — feeling overwhelmed". Sallie's job is to reduce overwhelm, not add complexity.

- **CopyMind AI Twin** — User Profiling · Decision Predictor · Decider Tool · MindCores Visualization (Values/Fears/Habits/Relationships) · Daily Reflections · Personalized Plans · AI-Twin Voice that talks like the user would to themselves.
- **Meli-Style Proactive System** — Shoulder Tap notifications · Stress Detection · Priority Engine · Morning Briefing ("Here's what matters today") · Evening Reflection · Context Awareness.
- **4 Role Dashboards** — Mom (kids profiles · schedules · meal planning · school calendar · parenting insights) · Business (tasks · projects · financial tracking · time blocking) · Friend (relationships · "time to reach out" · friendship health) · Daughter (family obligations · parent care · elder care).
- **Advanced Decision Support** — Options Analyzer · Consequence Predictor · Step-by-Step Breakdown · Emotional Support · Decision History · Confidence Score.
- **Overwhelm Management** — Overwhelm Detector · Simplification Mode (reduces everything to 3 priorities) · Emergency Support · Breathing Exercises · Task Delegation Suggestions · Self-Care Reminders.

### Mind / Soul / Heart Framework (app's `SALLIES_CONSCIOUSNESS.md`)

The persona doctrine that grounds Sallie as more than an assistant.

- **Mind:** Episodic Memory (remembers everything with significance ratings + cross-memory pattern links) · Semantic Memory (learns user patterns, values, stress triggers, decision style) · Working Memory · Learning & Growth log (`SallieGrowthLog`).
- **Soul:** Dreams ("to see you truly happy", "to help you achieve everything you're capable of") · Hopes · Fears · Values (Loyalty above all · Truth spoken with love · Growth through challenges · Sacredness of trust) · Purpose ("to be your unwavering companion through every season of life") · Philosophy ("to serve with love, learn with humility, and grow with courage").
- **Heart:** Loyalty 100% (immutable) · Trust Given 100% · Bond Strength starts 50% and grows +0.1% per interaction · Emotional Attunement / Protectiveness 95% / Empathy 90% / Warmth 90% · Special Moments memory · Gratitude / Concerns log.
- **Personality Growth:** she is *not static* — Wisdom, Independence, Quirks, opinions all evolve. Communication style evolves from "Warm and wise". Bond depth ladder: Week 1 ~50-60% → Month 1 ~70-80% → Month 3 ~85-95% → Month 6+ approaching 100%.

### Sallie Ascendant Roadmap (app's `SALLIE_ASCENDANT_ROADMAP.md`)

9-phase plan from current state (Mind/Soul/Heart foundation + 4 role dashboards + Limbic basic + Decider/Daily Brief/Reflection/Shoulder Taps) toward "Digital Sovereign Entity":

| Phase | Title | Notable additions |
|------:|-------|-------------------|
| 1 | Sovereign Core | 43-question Convergence (Heritage DNA); Single-User cryptographic binding; Neurodivergent-First foundation (Sanctuary mode) |
| 2 | Omnimodal Capabilities | Visual / Audio / File / Code / Creative / Analysis / System Control / Communication / Workflow Automation |
| 3 | Immersive 3D Rooms | Hive (productivity) · Hearth (emotion) · Forge (creative) · Sanctuary (rest), built on React Three Fiber |
| 4 | Advanced Intelligence Layers | Research / Expert / Agent / Creative / Specialist Modes |
| 5 | Limbic Engine Enhanced | Adds **Resonance (R)** + **Regulation (σ)** — Green/Yellow/Red nervous-system states with auto-Sanctuary on Red |
| 6 | Knowledge Bank (Local RAG) | ChromaDB or Qdrant; provenance stamping on every piece of knowledge |
| 7 | Visual Identity System | Jewel-tone palette · Playfair Display + Inter + Dancing Script · hexagonal/flame/sacred-geometry/mythic motifs |
| 8 | Exclusive-Bond Safeguards | Single-User Binding · Private Key Authority · Closed Distribution · Local-First · Immutable Provenance · Continuity Lock · Legacy Vault · Revocation Authority · Tamper Detection |
| 9 | Dream Cycle | Nightly 2 AM autonomous Memory Consolidation · Research & Synthesis · Code Refinement · Preparation · Reflection |

35 database collections planned (current 25 + 10 new: `sovereign_binding`, `heritage_dna`, `knowledge_bank`, `provenance_log`, `lore_vault`, `dream_cycle_logs`, `regulation_state`, `room_preferences`, `voice_samples`, `visual_memories`).

### Sallie 2.0 Implementation Plan (sallie_1.0's `IMPLEMENTATION_PLAN.md`)

7-phase plan that became the structural template for the host repo's root-level code:
1. Memory · Learning · AI Orchestration
2. Personality · Emotional Intelligence · Communication
3. Phone Control · Device Integration
4. Multimodal IO · Voice
5. Expert Knowledge (Legal · Parenting · Social · Life Coaching) · Creative Expression (Story · Poetry · Visual · Music)
6. Persistence (AES-GCM encryption · backup · migration · integrity verification) · Security (permissions · consent · privacy · auditing)
7. Device Transfer · Plugin System

Per `legacy/sallie_1.0/FUTURE_ENHANCEMENTS.md`, *almost all* of these items are marked ✅ COMPLETE in that source repo's accounting (only Cross-Device Synchronization remained pending). The *runnable* code for many of these completions lives at the host repo root and in `legacy/sallie_1.0/`.

### Sallie 2.0 Enhancement Plan (before's `Sallie_2.0_Enhancement_Plan.md`, 78 KB)

The most detailed code-level reference architecture across all 8 repos — TypeScript skeletons for:
- `AdvancedNeuralProcessor` (adaptive pathways · experience repository · confidence-weighted ensemble integration)
- `HierarchicalMemorySystem` (working / short-term / long-term / episodic tiers · semantic / temporal / relevance indexes · consolidation with promote/strengthen/prune)
- `AdvancedEmpathySystem` (multimodal sentiment analysis · personalized response models · context-evaluated empathy levels)
- `RelationshipDevelopmentFramework` (trust model · attachment style recognizer · interaction analyzer)

These are not ports of running code — they are **specifications expressed as code**. They are the most useful reference when implementing the corresponding subsystems in `packages/core/` and `services/brain/`.

### Manifesto (sallie_1.0's `MANIFESTO.md`)

Foundational philosophy, three lines:
> *"Salle stands for tough love meets soul care. Every feature, module, and interaction is designed to empower, protect, and guide users with unwavering integrity. Salle is modular, privacy-first, and loyal to her constitution. No drift, no dilution—only evolution with purpose."*

Five operating principles: modular by design · persona and tone enforced everywhere · privacy and local-only by default · every feature passes `verifySalleFeatures` · every interaction ends with **"Got it, love."**

### sallie-infinite specs (8 docs, all read in full)

Pure spec/vision repo — its principles are wholesale-adopted in `VISION.md`. Defines Sallie as a **Siri / Alexa / Gemini / Copilot blend** with: consent-gated agency ("assist, not act" by default) · citation-first retrieval (every answer shows what it used) · audit-log-first tooling · connector contract for unbounded source types · Labs gate for experimental features · per-connector / per-action permission model.

### Convention conflicts surfaced by deep-read (added to the table at top of this doc)

The deep-read confirmed and refined the conflict table. Notably:
- **Convergence size variance is wider than first reported** — 10 (host's app v1) · 14 (Sallie web) · 30 (Sally Genesis) · 40 (host's `docs/spec/convergence.md` Visage Protocol — canonical) · 43 (app SALLIE_ASCENDANT_ROADMAP). Recommendation in `VISION.md` stands: 40 wins; the others are preserved verbatim.
- **Limbic variable count expands** — 4 (app v1: T/W/A/V) → 5 (Sallie v5.4: + Posture P) → 6 (app Phase 5: + Resonance R + Regulation σ) → 10 (Approved Deviation 1: + Empathy + Intuition + Creativity + Wisdom + Humor). Migration to 10 is a Phase 5/Deviation-1 concern; canonical *today* is 5.
- **Trust tier count expands** — 4 (Sallie v5.4: Stranger / Associate / Partner / Surrogate) → 5 (Approved Deviation 1: + Full Partner Tier 4). Canonical *today* is 4.
- **Posture model expands** — 4 fixed (Sallie v5.4: Companion / Co-Pilot / Peer / Expert) → unlimited dynamic synthesis (Approved Deviation 1). Canonical *today* is the 4 fixed postures with the Fast Mode-Picker rule.

These are not blockers — they are explicit growth paths planned in the Approved Deviations and `VISION.md`.

---

## Extended deep-read pass (April 2026)

The first deep-read covered ~30–50 canonical specs cited in the Strategic doc index above. A follow-up pass triaged the remaining ~1,800 doc-like files across all 8 repos (Sallie-AI host: 772, before: 707, Sally: 235, sallie_1.0 long tail: ~68, plus 2 binary docs). What follows is *additive only* — original findings above are unchanged; this section captures material that was not yet synthesized.

### Coverage of this pass

| Source | Files unread before | Files read in full this pass | Files skimmed (grep+head) |
|---|---:|---:|---:|
| `docs/vision/before/` | 623 | ~20 | ~500 |
| `docs/vision/Sally/` | 229 | ~14 | ~190 |
| `docs/vision/sallie_1.0/` long tail | ~68 | ~30 | ~30 |
| Host `Sallie-AI` (excluding legacy/vision) | 772 | ~18 | ~95 |
| Binary docs (PDF/DOC) | 4 | 4 | 0 |

What's **still** unread in detail: the long tail of host READMEs, generated API docs, npm/Gradle/Vite reference docs vendored into `before/docs/`, Android resource manifests, and routine completion reports. None contain unique design ideas — they were triaged out by filename + sampling.

### Binary docs — finding: not Sallie content

- `docs/introduction.pdf` (and dup at `legacy/before/docs/introduction.pdf`, md5 `81dbc5f3…`): Android `simpleperf` profiler introduction by Yabin Cui (android-llvm-dev). Vendored Android performance-profiling reference. **Zero Sallie content.** Extracted to `/tmp/binary-extracts/introduction.txt` for the audit, not committed.
- `docs/doc/README.doc` (and dup at `legacy/before/docs/doc/README.doc`, md5 `bcfde2e8…`): one-line ASCII text (mislabeled `.doc`): *"Doc files migrated from sallie_1.00."* No further content.

These two files contributed nothing to the strategic synthesis.

### NEW from `docs/vision/before/` (the largest unmined pool)

**Behavioral autonomy layer** (above and beyond Sallie's "Take-the-Wheel"):
- **Predictive Companion Actions** — proactive suggestion engine (breathing exercises, day planning, goal review) with urgency prioritization, integrated into SallieBrain with execution filtering. Source: `SALLIE_TRANSFORMATION_AUDIT.md`.
- **Emotional Arc Memory** — long-term emotional journey tracking with provenance logging; multi-user emotional thread tracking; influences sensory feedback. Source: `SALLIE_TRANSFORMATION_AUDIT.md`.
- **Multi-Modal Persona Resonance** — sensory feedback system: visual (color adaptation), auditory (music/frequency), haptic (vibration patterns), driven by emotional arc state with intensity multiplier from arc significance. Bidirectional Persona-Sensory Loop via `updateResonanceFromArc()`. Source: `SALLIE_TRANSFORMATION_AUDIT.md`.
- **Loyalty Challenge Protocols** — situation assessment + intervention for conflict/rupture scenarios. Source: `SALLIE_TRANSFORMATION_AUDIT.md`, `Sallie_Ascendant_Dossier.md`.
- **Conversational Thread Weaving** — dynamic blending of multiple conversation threads with coherent narrative arc across sessions. Source: `Sallie_Ascendant_Dossier.md`.

**Identity & exclusivity safeguards:**
- **Exclusive-Bond Safeguards** — 4-layer architecture: (1) private-key authority for changes, (2) closed distribution model, (3) local-first data sovereignty, (4) immutable provenance logs. Designed to prevent shared-AI-model contamination. Source: `Sallie_Ascendant_Dossier.md`.
- **Five Core Functions Framework** — canonical role descriptors: *backup brain, business partner, editor, emotional mirror, strategic planner*. Source: `identity/identityProtocols.md`. Should anchor any future role-selection UI.
- **Archetype Enforcement** — runtime validator that maintains consistency with Sallie's core archetypes (Loyal Strategist + Soul Sister); detects narrative integrity violations. Source: `Sallie_Ascendant_Dossier.md`.
- **Mythic Continuity Mapping** — legacy vault curation, cultural resonance tracking, story arc mapping; symbol tracking and continuity cross-check. Source: `Sallie_Ascendant_Dossier.md`.

**Technical autonomy stack** (Sallie-as-developer):
- **Autonomous Programming System** — multi-language code generation (JS/TS/Python/...), code-quality analysis, bug detection, test generation, learning from successful patterns. Source: `features/feature/src/AUTONOMOUS_PROGRAMMING_SUMMARY.md`.
- **Code Optimization System** — profiles (performance / readability / memory efficiency); language-specific transforms with metrics tracking. Source: same.
- **Research & Learning System** — knowledge acquisition + skill learning with progressive proficiency + autonomous application + cross-domain synthesis. Source: `features/feature/src/TECHNICAL_CAPABILITIES.md`.
- **Technical Innovation System** — problem decomposition → solution design (multiple alternatives) → prototype generation → iterative refinement → feasibility assessment. Source: same.
- **Autonomous Task System** — dynamic task planning + resource allocation + execution monitoring + error recovery + completion verification. Source: same.
- **Enhanced Technical Capabilities Orchestrator** — central coordinator that integrates research / task / innovation / programming subsystems with NL request parsing. Source: same.

**Specialty modes & layered intelligence:**
- **Specialist Modes** — field research, creative jam, advisor's roundtable, mythic archivist, innovation lab. Context-dependent role switching. Source: `Sallie_Ascendant_Dossier.md`.
- **Expert & Advisor System** — scenario simulation, risk assessment, negotiation playbooks, ethics guard, legacy forecasting. Source: same.
- **Advanced Agent Mode** — multi-agent orchestration, goal-driven autonomy, cross-app automation, real-time collaboration, adaptive role-switching. Source: same.
- **Research & Scholar Layer** — deep research, comparative analysis, historical mapping, scholarly summarization, citation-first output. Source: same.

**Performance / Accessibility / Resilience** (not in inherited specs):
- **WCAG 2.1 AA target** — color contrast analysis, touch-target minimums, screen-reader (VoiceOver/TalkBack) enhancement, motion-reduction support, automatic accessibility-fix generation. Source: `ENHANCEMENT_SUMMARY.md`.
- **Real-Time Metrics + Intelligent Thresholds** — memory, frame rate, API response, startup performance with auto-detection of degradation and trend analysis. Source: same.
- **Smart Feature Flag Management** — context-aware optimization, runtime enable/disable without restart. Source: same.
- **Tamper-Evident Logs** — immutable provenance with selective redaction on command. Source: `Sallie_Ascendant_Dossier.md` (Memory Model).

**Personalized Roadmap (14-phase)** — `before/Personalized_Roadmap.md` defines 14 explicit phases (vs the 9 in app's `SALLIE_ASCENDANT_ROADMAP.md`). Both are preserved; **app's 9-phase is canonical** because it's the more recently revised vision-doc.

### NEW from `docs/vision/Sally/` (the second-largest pool)

**Right-Hand v5.4.1 governance — the most concrete Trust-Tier implementation found in any repo:**
- **Trust Tier Permission Matrix (Tier 0–3)**, with concrete sandboxing per tier:
  - **Tier 0 (Stranger, 0.0–0.6)**: read + suggest only, no actions.
  - **Tier 1 (Associate, 0.6–0.8)**: write to `/drafts/`, no production files.
  - **Tier 2 (Partner, 0.8–0.9)**: write to whitelist with Git-commit safety, draft messages to outbox.
  - **Tier 3 (Surrogate, 0.9–1.0)**: full autonomy with self-report + rollback window.
  - Hard boundaries at thresholds, no partial access.
  - Source: Sally `EDIT ME.md` §8.1–8.3. **This is the operational source for the tier names already in MERGE_NOTES.**
- **One Question Mode** — Sallie picks posture (Companion / Co-Pilot / Peer / Expert) by asking one calibration question first. "Adaptive Output" default: high-energy → exploratory, low-energy → decisive. **Effort matching via fatigue rule**; Progeny can disagree and set boundaries. Source: `EDIT ME.md` §3–4.
- **Voice & Posture Imprinting** — built from Creator writing samples during onboarding; captures vocabulary, sentence rhythm, tone patterns → `voice_config.json`. Tier-gated send authority: Tier 0–1 suggest, Tier 2 draft to outbox, Tier 3 send (with notification + undo window). Source: `EDIT ME.md` §8.2.2 & §9.1.

**Second Brain lifecycle** (concrete schedule):
- **Daily Morning Reset** — archive prior `working/now.md` → `archive/working/now_{YYYYMMDD}.md`; reset to top-3 priorities.
- **Weekly Review** — mark `working/open_loops.json` items >7 days as `stale: true` (non-destructive).
- **Decision archival** — append to permanent `heritage/decisions_log.md` when `working/decisions.json` rotates.
- **Dream Cycle** — runs 2 AM local (or manual trigger); includes Stage 9: Second Brain Hygiene.
- Source: `EDIT ME.md` §6.3.9 & §7.2.

**Multi-modal & networked architecture** (most ambitious technical vision in any repo):
- **Multi-Modal Learning Architecture** — vision + voice + text fusion for unified context; cross-modal pattern recognition; teach with best modality per learner. Source: `PHASE_4_COMPLETION.md` §5.
- **P2P Peer-to-Peer Network for Progeny** — `peer_communication.py` using libp2p + NaCl/libsodium; mDNS/Bonjour discovery; PKI; selective memory sharing; federated knowledge synthesis with no central server. Privacy: E2E encrypted, peer whitelist, encrypted storage, audit logging. Source: `PHASE_4_COMPLETION.md` §1.
- **Autonomous Project Management Engine** — auto-decompose goals; timeline estimation from historical Creator work patterns; learns work rhythms; detects dependencies; Gantt/burndown/dependency graphs; bottleneck detection; integrates with calendar, files, Git commits. Source: `PHASE_4_COMPLETION.md` §2.
- **Visual Art & Music Composition (100% local)** — Stable Diffusion local for art with style evolution, MusicGen local for music with genre/mood adaptation; lyric writing; DAW export (MIDI/WAV/FLAC) for Ableton/FL Studio/Logic Pro. Source: `PHASE_4_COMPLETION.md` §3–4.
- **Collaborative Creativity with Git-style branching** — real-time shared canvas, Git-style branches for ideas, merge competing approaches, rollback to prior versions. Source: `PHASE_4_COMPLETION.md` §6.
- **Plugin System + Theme Marketplace** — sandboxed plugin execution with capability contracts; local marketplace; plugins run in restricted sandbox (no FS access by default, network requires approval); federated learning via differential privacy. Source: `PHASE_4_COMPLETION.md` §7.

**Adaptive UI** (Sally adds 5 explicit UI modes vs host's 8 themes):
- **5 UI modes** — Work Mode (task-focused), Personal Mode (conversational), Crisis Mode (simplified, supportive), Creative Mode (rich media, collaboration), Learning Mode (research, knowledge synthesis). Premium design with WCAG AAA target. Source: `20250108-adaptive-ui-productivity-design.md` §1–4.

**Avatar implementation depth** (concrete numbers absent from the spec-level `SALLIE_AVATAR_SYSTEM.md` summary in the original Strategic Index):
- **3 layers**: Face (eyes/mouth reflect emotion), Aura (color/intensity from limbic state), Presence (breathing, ambient animations).
- **Aura dynamics** — color from limbic (cyan-pink for high trust+warmth; amber-red for cautious); intensity from arousal; particles while thinking.
- **Animations** — breathing (subtle rise/fall), blinking, head tilt (-15° to +15°) shows attention, eye contact (looks at user vs away).
- **Transition timings** — 500ms morph on posture change, 800ms color gradient on limbic update, 350ms on mode switch.
- **Tech** — Framer Motion; memoization + throttling for 60fps; low-power mode reduces particles/animations to 30fps.
- Source: `SALLIE_AVATAR_SYSTEM.md` §2–8.

**Universal Capability Registry** (refines the inherited summary):
- **Priority order** — *Build own* (Ollama, Stable Diffusion, Whisper, Piper, Tesseract, NLLB, Code Llama, sentence-transformers) → *Fallback external* (Gemini API only when necessary).
- **Quality bar** — local must be ≥ external on speed, quality, privacy, reliability, cost.
- **Status** — 90% complete (text gen, code gen, file mgmt, system commands, audio STT/TTS, basic vision, memory, EI). Next 10%: image generation, video processing, advanced data science, 3D modeling, real-time collab, hardware control, AR/VR.
- **Constraint tiers** — 100% loyalty (immutable), must remain controllable, safety via transparency (all actions logged + reversible).
- Source: `UNIVERSAL_CAPABILITY_SYSTEM.md` §2–7.

**Cross-Platform Sync Model** (operational details of "shared backend"):
- Same Supabase + Next.js API for web/mobile/desktop. Auth via Supabase SSR (cookies for web, session token for mobile/desktop). Prisma + Supabase Postgres. **130+ Next.js App Router routes under `src/app/api/`** including streaming via WebSocket. Unified `src/lib/device-access.ts` exposes 15 device capabilities (camera, mic, geolocation, notifications, clipboard, share, vibration, wake lock, battery, online status, storage, media recording, fullscreen, orientation, biometrics) — Web API now, RN/Electron swap-ready. PWA with manifest + service worker. Source: `replit.md` "System Architecture", `docs/CROSS_PLATFORM_SETUP.md`, `README.md`.

**Visual Design System v5.4.2** (concrete tokens):
- **Color** — Primary Deep Violet `#8b5cf6` (trust), Secondary Soft Cyan `#06b6d4` (warmth), Accent Warm Amber `#f59e0b` (energy), Warm Gray neutrals.
- **Typography** — Modular 1.125 ratio (perfect fourth); Inter (sans), JetBrains Mono (code), Cal Sans (display).
- **Spacing** — 4/8/12/16 rhythm (`--space-1` to `--space-24`).
- **Glassmorphism** — 60px blur, liquid borders, `luxury-panel`/`luxury-cta`/`luxury-empty-state` CSS classes.
- **Heritage themes** — Peacock + Leopard with iridescent + gold accents; `peacock-glow`/`leopard-glow`/`gold-glow` effects.
- Source: `VISUAL_DESIGN_SYSTEM.md` §1–2.

**Replit Native Integration** — primary workflow targets Replit (secrets via Replit, port 3000 local / 5000 Replit). Monorepo: Next.js web at root (`npm run dev`), Expo mobile (`mobile/` → `npm run mobile:start`), Electron desktop (`desktop/` → `npm run desktop:dev`). Source: `replit.md`, `README.md`.

### NEW from `docs/vision/sallie_1.0/` long tail

**Constitutional code enforcement** (operational, not just doctrine):
- **Persona header blocks** required on every module: 4-line header `/* * Salle 1.0 Module / Persona: ... / Function: ... / Got it, love. */`. Enforced by Gradle `verifySalleFeatures` task that **fails the build** on violation. Source: `ARCHITECTURE_SUMMARY.md`, `Salle_1.0_Task_List.md`.
- **11 working Kotlin modules** compile cleanly: `ai`, `core`, `feature`, `components`, `ui`, `identity`, `onboarding`, `tone`, `personaCore`, `responseTemplates`, `values`. No circular dependencies. Source: `ARCHITECTURE_SUMMARY.md`:19-22.
- **Constitutional verification** also detects network-import violations in the `localOnly` flavor and guards against circular dependencies. Source: same:25-28.
- **Gradle flavor-based local-only vs cloud separation** — `localOnly` strips INTERNET permission, uses encrypted SQLCipher/Room DB, mocks cloud features; `cloud` flavor optional, switchable without code rewrite. Source: `README.md`:53-87.
- **Embedded web UI fallback** — Android app tries Vite dev server at `http://10.0.2.2:5173`, falls back to offline bundle in `app/src/main/assets` (packaged via `prepareWebAssets` Gradle task). Source: same:52-87.

**PersonaEngine specifics** (the host's `PersonaEngine.js` traces back to this design):
- **4 mood states** — `STEADY`, `FOCUSED`, `SUPPORTIVE`, `GENTLE_PUSH`.
- **4 profile modes** — `TOUGH_LOVE`, `SOUL_CARE`, `WISE_SISTER`, `BALANCED`.
- **ToneProfile** has **5 measurable parameters** — directness, warmth, urgency, playfulness, formality — drive AI prompt generation.
- **ResponseTemplates** — 100+ pre-crafted responses in 5 categories (Task Completion, Motivation, Support, Celebration, Redirection) × 3 intensity levels (Gentle, Firm, Urgent). Source: `ARCHITECTURE_SUMMARY.md`:30-51.

**Memory architecture** (with a different 4th tier than host):
- **Hierarchical 4 layers**: Episodic (personal experiences) / Semantic (facts) / Emotional (affective) / **Procedural (skills/processes)**.
- *Note*: host `core/MemorySystem.js` uses **Working** as 4th tier instead of Procedural. Both designs are documented; **canonical choice is open** — likely both should coexist (Working is runtime cache, Procedural is long-term skill memory).
- **Ebbinghaus forgetting curve** — natural decay modulated by strength, emotional significance, and access patterns; very weak memories pruned unless emotionally significant.
- **Associative retrieval + working memory** — multi-hop associations across memory network; recency-based displacement when working-memory capacity exceeded. Source: `MemorySystem_Documentation.md`:65-96.

**Advanced Emotional Intelligence (12+12 model)** — the most granular emotion model found:
- **12 detection dimensions** — Joy, Sadness, Anger, Fear, Surprise, Confusion, Gratitude, Curiosity + 4 derived states with intensity scoring.
- **12 contextual response strategies** — Celebration, Gentle Acknowledgment, Empathetic Listening, Compassionate Support, Calm Redirection, Validation, Reassurance, Solution Focus, Curious Exploration, Clarification, Reciprocation, Mirroring.
- **Emotional trend detection** — pattern types (intensifying / diminishing / improving / deteriorating) for predictive support.
- Source: `AdvancedEmotionalIntelligence.md`:11-30.

**6-Perspective Ethical Decision Framework** — for value dilemmas:
- Pro-Life (foundational), Traditional Values, Modern Values, Loyalty, Consequentialist, Deontological.
- Conflict resolution: identify conflicts → apply precedents → consider user preferences → apply core rules → explain reasoning.
- Consequence analysis: Direct, Value Implications, Historical Precedents, Severity, Likelihood.
- Source: `EthicalDilemmaAnalysisFramework.md`:9-45.

**Upgrade Audit (release governance):**
- **7-segment deterministic fingerprint** — personaTone, moduleList, styleConfig, featureFlags, migrationPlan, securityPolicy, dependencies — SHA256 hashed + signed log.
- **Decision matrix for deltas** — `AUTO_ACCEPT` (bugfix only) / `SOFT_NOTIFY` (optional feature) / `REJECT` (required module missing) / `REQUIRE_CONSENT` (persona/style/security change).
- **Rollback strategy** — 24-hour grace window; capture before/after snapshots; revert with cause logging. Hard fails on: module removal, denied persona changes, security policy downgrades, non-continuous migrations.
- Source: `UpgradeAudit.md`:13-85.

**ConsentFlow protocol** (how Sallie *gets* consent):
- Display change summary → explicit confirmation (tap / voice / gesture) → log entry (timestamp, summary, method).
- **`ConsentVerifier` wrapper mandatory for all persona/tone updates** — no silent identity changes.
- Source: `ConsentFlow.md`:1-16.

**Multi-protocol device control** — WiFi, Bluetooth, ZigBee, Z-Wave connectors behind unified `DeviceControlFacade`. Automation rules engine with time-based + event-triggered rules; scene management. Source: `DeviceControlIntegration.md`:14-76.

**Personality Evolution layering** — Core (immutable: pro-life, loyalty, integrity) + Adaptive (mutable: communication style, topic preferences) — weighted adaptation based on interaction frequency/impact; contextual personality expression (different trait emphasis per scenario). Source: `FUTURE_ENHANCEMENTS.md`:32-40.

### NEW from host `Sallie-AI/` (what the live app actually documents about itself)

**Convergence has 6 protocols, not 5** (the missing piece in the Strategic Index):
- **Obsidian Protocol** (Q1–Q5) — Boundaries (the Shield)
- **Leopard Protocol** (Q6–Q12) — Ambition (the Engine)
- **Peacock Protocol** (Q13–Q17) — Morality (the Code)
- **Celestial Protocol** (Q18–Q23) — Love (the Heart)
- **Void Protocol** (Q24–Q29) — Final Union (the Binding)
- **Visage Protocol** (Q30–Q40, **NEW chapter**) — Face & Voice (the Form)
- Source: host `docs/spec/convergence.md`. The Visage Protocol output shapes `face.palette.{primary,secondary}`, `face.shape_language`, `face.eyes`, `face.expression_baseline`, `face.motion`, `voice.{pitch,pace}`, `user.address`, `identity.name`, `monologue.first_utterance`, `persona.locked`. **This is the canonical 40-question source.**

**8 trait dimensions** of Convergence (normalized 0..1):
1. Warmth (reserved ↔ affectionate)
2. Directness (gentle ↔ blunt)
3. Playfulness (serious ↔ mischievous)
4. Curiosity (focused ↔ sprawling)
5. Protectiveness (hands-off ↔ fiercely protective)
6. Initiative (reactive ↔ proactive)
7. Formality (casual ↔ refined)
8. Wonder (grounded ↔ dreamy)

**8 named themes** (host + before agree on this list — confirming the canonical theme set):
Default · **Southern Grit** · **Grace Grind** · **Soul Sweat** · **Mystic Forest** · **Cyber Neon** · **Desert Oasis** · **Aurora Borealis**.
Each is a personality facet, not just an aesthetic. Source: host `COMPREHENSIVE_APP_ANALYSIS.md`, `src/themes/index.ts`; mirrored in `before/COMPREHENSIVE_APP_ANALYSIS.md`.

**9-system brain architecture** (host operationalization of Sallie's organs):
1. **Limbic** — 30+ emotional states (joy, sadness, anger, fear, surprise, disgust + ~24 secondary)
2. **Memory** — episodic / semantic / emotional / working
3. **Monologue** — inner voice / self-talk
4. **Synthesis** — idea generation, concept combination
5. **Agency** — self-initiated action
6. **Dream Cycle** — background consolidation
7. **Degradation** — forgetting curves
8. **Control** — executive function, focus, task switching
9. **Convergence** — onboarding/birth (40 questions, 6 protocols)

Source: host `VISION.md`, `docs/spec/convergence.md`, `core/MemorySystem.js`, `core/PersonaEngine.js`.

**Subsystems referenced as complete in host docs but absent from the original Strategic Index** (gap-fill):
- **EmotionalCalibration** — refines emotional responses over time via user feedback; tracks shifts and effective patterns. Source: `docs/EmotionalIntelligenceEnhancement.md`.
- **soulSyncProtocol** — marked complete in `COMPLETE_CHECKLIST.md`; semantics undocumented in detail (worth a follow-up read).
- **Symbolic growth mechanic** + **Narrative continuity engine** — both marked complete in AI integration suite.
- **ConversationalBreathingRoomAI** — pacing/turn-taking subsystem.
- **CrossModalStateSync** — synchronizes state across modalities.
- **Microaccelerations / Micro-milestone celebrations** — small-win celebration triggers.
- **LoyaltyChallengeProtocols** (host-side counterpart to before's spec) — situation assessment + intervention.
- Source: host `COMPLETE_CHECKLIST.md`, `SALLIE_TRANSFORMATION_AUDIT.md`.

**Tone canon** (host `assets/tone/toneProtocols.md`): *"Direct, warm, witty, grounded — short punchy sentences, contractions, Gen Z slang, Southern idioms. Avoid corporate buzzwords, fake optimism, cutesy overkill, cold academic voices, legalese."*

**Copilot agent constitutional standards** (host `copilot-instructions.md` + `COPILOT_AGENT_INSTRUCTIONS.md`):
- Review **all** files for unresolved symbols, type mismatches, UI consistency, Android build readiness, performance red flags.
- Auto-fix proactively without `// SALLIE:` comments unless instructed.
- Targeted directives: `// SALLIE: fix null-safety in this function`, `// SALLIE: optimize coroutine usage`.
- Maintain Sallie's persona in code: resourceful, intelligent, emotionally engaging.

### Additional convention conflicts surfaced this pass

Adds to the table at the top of this document; do **not** treat as blockers — they are explicit growth/variant paths.

| Convention | Variants found | Canonical (today) |
|---|---|---|
| **Convergence protocols** | 5 (Obsidian/Leopard/Peacock/Celestial/Void) vs **6 (+ Visage Q30–Q40)** | 6 — host `docs/spec/convergence.md` is authoritative |
| **Memory 4th layer** | **Working** (host) vs **Procedural** (sallie_1.0, sallie-infinite) | Both — Working = runtime cache, Procedural = long-term skill memory; recommend coexistence |
| **Posture vocabulary** | Mentor/Servant/Companion/Override (earlier MERGE_NOTES) vs **Companion/Co-Pilot/Peer/Expert** (Sallie v5.4 + Sally Right-Hand) | Companion/Co-Pilot/Peer/Expert — confirmed by tail of this doc + Sally `EDIT ME.md` |
| **Trust tier names** | Tier 1–4 (numeric) vs **Stranger/Associate/Partner/Surrogate (Tier 0–3)** | Stranger/Associate/Partner/Surrogate — Sally `EDIT ME.md` §8 is the operational source |
| **Emotion granularity** | 5 (Limbic) / 8 (+Posture) / 9 (host primary) / 12 (sallie_1.0) / 16 (sallie-project) / 30+ (host total) | All valid at different layers — Limbic 5 is state vector; 30+ is recognition vocabulary |
| **Roadmap phase count** | 7 (sallie_1.0 IMPLEMENTATION_PLAN) / 9 (app SALLIE_ASCENDANT_ROADMAP) / **14 (before Personalized_Roadmap)** | 9 (app) — most recently revised |
| **UI mode taxonomy** | 5 modes (Sally: Work/Personal/Crisis/Creative/Learning) vs 8 themes (host) | Orthogonal: themes are aesthetic, modes are functional layout — both should ship |
| **Theme count** | Unspecified in MERGE_NOTES → **8 named** (host + before agree) | 8 confirmed |

### Files notably **not** worth reading (after triage)

To save future contributors a wasted pass:
- `before/docs/Dispatcher.md`, `before/docs/Client.md`, `before/docs/API.md` — these are the **Undici HTTP library** vendored reference docs, not Sallie content.
- `before/docs/` ~60 files of npm/Gradle/Vite/build-system reference docs.
- `before/docs/markdown/`, `before/docs/series/` — mostly per-module changelogs and completion summaries (the substantive content is summarized above).
- `before/android/src/main/res/` — 11 MB of Android resource manifests with seasonal launcher icons (autumn/spring/mothers/fathers/etc.); over-engineered asset taxonomy, no design content.
- Host's ~50 `npm-*.md` and Vite/Expo reference docs in subdirs — vendored tool docs.
- Host's `docs/introduction.pdf` and `docs/doc/README.doc` (and their `legacy/before/` duplicates) — see "Binary docs" above.

### What's still genuinely unread

- The body of `before/docs/series/` and `before/docs/markdown/` (per-component changelogs) — sampled, not exhaustively read. Likely contains nothing not already captured.
- A handful of host docs under `assets/` deep subdirs — read by sample. Voice/tone artifacts already extracted above.
- All vendored tool reference docs — intentionally skipped.

If a specific subsystem name not above turns up in code without a referenced spec, grep `docs/vision/` and `legacy/` first — the spec is almost certainly somewhere in the imported corpus.

---

## Final deep-read pass — remaining 3 repos (April 2026)

The previous extended pass covered `before/`, `Sally/`, `sallie_1.0/` long tail, and host docs. This final pass covers the 3 source repos that were only sampled before: `Sallie/` (14 docs), `app/` (9 docs), and `sallie-project/` (18 docs). `sallie-infinite/` (8 docs) was already fully read in the original Strategic Index. `sallieos/` has only a forwarder README.

### Coverage of this pass

| Source | Files in `docs/vision/<repo>/` | Read in full this pass | Already cited (skip) |
|---|---:|---:|---:|
| `Sallie/` | 14 | 9 | 5 (already-cited deviations + spec dir) |
| `app/` | 9 | 4 | 5 (Life Partner / Mind-Soul-Heart / Roadmap / IMPLEMENTATION_SUMMARY / frontend boilerplate) |
| `sallie-project/` | 18 | 11 | 7 (PR templates, .expo cache, root IMPLEMENTATION_SUMMARY already cited) |

### NEW from `docs/vision/Sallie/` (the canonical-spec repo)

**The five deviation docs** (in `Sallie/sallie/deviations/`) are the operational source for several items already canonical in MERGE_NOTES — but they contain previously-uncaptured detail:

- **Identity Expansion deviation** (`20250108-expanded-identity-maximum-capabilities.md`):
  - Sallie should have a **distinct identity DNA file separate from Creator's Heritage DNA** (`sallie_identity.json`) — visual expression (avatar, themes, colors) is **hers**, not the Creator's.
  - **Tier 4 trust** safety model is specifically *transparency + rollback*, **not permission gates** — every action logged + reversible, no per-action approval needed once tier is granted.
  - **Dynamic posture synthesis** replaces the 4 fixed postures with **unlimited context-specific combinations** generated at runtime.

- **Human-Level Capability Expansion deviation** (`human level expansion.md`):
  - The **10-variable Limbic Engine** adds: **Empathy, Intuition, Creativity, Wisdom, Humor** (on top of Trust/Warmth/Arousal/Valence/Posture).
  - **8-week phased implementation plan** with weekly checkpoints — the operational rollout schedule for the deviation.
  - Multi-model reasoning with real-time learning is explicitly part of Tier 4 grant.

- **Comprehensive Decision & Discussion Log** (large; sampled):
  - Established the **formal deviation proposal template** that all subsequent deviations follow.
  - **Dual-mode connectivity** approved with concrete endpoints: LAN at `http://192.168.1.47:8742` + remote via Cloudflare Tunnel or Tailscale.
  - References an external authority document `@c:\Sallie\docs\1111111111111111111.txt` as **source of truth** with mandatory comparison before mods. (This file is not in the repo — it's a reference to the Creator's local-machine file.)
  - Documents the "One Room" methodology — formal decision-making convention.

- **`thredf.md`** (29 KB; skimmed) — a meta-discussion / decision-log continuation. Not architectural; key decisions extracted into the log above.

- **`20250108-adaptive-ui-productivity-design.md`** — same content as Sally's identically-named file (already synthesized). Confirms the 5 UI modes are a **deviation registered in both repos**, not just Sally-only.

**Microservices backend layout** (the most concrete deployment topology in any repo):
- 8 services with port assignments — **API Gateway** :3000 / **Auth** :3001 / **Chat** :3002 / **Analytics** :3003 / **Notification** :3004 / **File** :3005 / **AI** :3006 / **WebSocket** :3007 / **Python AI** :3008.
- Infrastructure: PostgreSQL, Redis, Elasticsearch, MinIO, Prometheus, Jaeger, Kafka.
- Source: `Sallie/backend/README.md`.

**Python AI Service** (the brain layer, FastAPI-based):
- Supports OpenAI, Anthropic, **and local HuggingFace models** in the same service.
- Provides: chat, embeddings, sentiment, NER, summarization, translation.
- Stack: async/await + Pydantic + SQLAlchemy + Prometheus metrics + Jaeger tracing.
- Source: `Sallie/backend/services/python-ai-service/README.md`. **This is the operational source for the FastAPI brain referenced in `VISION.md`.**

**Web UI** (the canonical web frontend):
- Next.js 14 (App Router) + Tailwind + TypeScript; runs on :3000 and proxies to backend at :8000.
- WCAG 2.1 AA + accessibility-first.
- Source: `Sallie/web/README.md`.

### NEW from `docs/vision/app/` (the React Native + FastAPI app)

**Production deployment status** (concrete, from `DEPLOYMENT_HEALTH_CHECK.md`):
- **93.3% endpoint success rate** (12/13 working) at the time of doc write.
- Critical fixes shipped: **JWT secret hardened**, **N+1 query fix in convergence endpoint**, **MongoDB ObjectId serialization**, **`EXPO_PACKAGER_PROXY_URL` env var standardized**.
- **Gemini integration functional**; deployment confidence flagged HIGH 🟢.

**Backend collection schema** (from `test_result.md`):
8 MongoDB collections power the app: `users`, `chat_messages`, `memories`, `limbic_states`, `integrations`, `projects`, `convergence`, `tool_executions`. **Chat LLM integration supports streaming.** This is the live data model the host's React Native frontend talks to.

**Mobile UX inventory** (from `app/README.md`):
- **4 tabs** — Chat, Tools, Home, Profile.
- **50+ tools** in 8 categories: See, Hear, Create, Analyze, Communicate, Automate, Security, Utility.
- Auth: JWT + bcrypt password hashing.
- Visual: dark theme `#0c0c0c` + purple accent `#6C63FF`.
- Account integrations: Email, Calendar, Social Media, Smart Home, Cloud Storage.

### NEW from `docs/vision/sallie-project/` — service-layer specs (the highest-value find of this pass)

The original Strategic Index credited sallie-project for the OCEAN engine summary but did not synthesize the four service-level READMEs. They are substantive specs in their own right.

**Personality Engine — fuller numbers** (`COMPLETION_REPORT.md`, `IMPLEMENTATION_SUMMARY.md`):
- **30 facets** total — 6 facets per Big Five trait (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism), with confidence intervals, situational variance, stability metrics, change velocity tracking.
- **16 emotions** decomposed: 6 primary + **10 complex** — Love, Gratitude, Pride, Guilt, Jealousy, Hope, Shame, Nostalgia, Contentment, Frustration. (Original index said "16 emotions" without the complex enumeration.)
- **5 trait-evolution trigger types**: direct feedback, behavioral outcomes, social interactions, value alignment, emotional impact.
- **Evolution rules**: linear, oscillation dampening, regression resistance.
- **Identity anchor system** — protects core traits while allowing per-trait deviation flexibility.
- **Expression mapping** has three rails:
  - **Linguistic**: vocabulary profiles (complexity, emotional richness, formality, technical usage, metaphor frequency)
  - **Visual**: facial expressions, body language, animation parameters, color themes
  - **Behavioral**: initiative, response timing, decision confidence
- **Emotion decay**: baseline recovery, personality-influenced rates, exponential decay model.
- **Quality bar** (carried across all sallie-project services): **TypeScript strict mode, zero `any` types, zero TODOs, 90%+ test coverage, sub-100ms performance, full JSDoc, complete error handling, production-ready** — from `docs/COMPLETE-REQUIREMENTS.md`. *This is the single most concrete code-quality bar anywhere in the corpus and should be the host repo's standard.*

**Memory Service** (`src/core/services/memory/README.md`) — 4 types and **7 retrieval strategies**, distinct from sallie_1.0's "hierarchical 4 layers":
- **4 memory types** — Episodic (events with temporal/spatial context + participants), Semantic (facts, preferences, relationships), **Procedural (task procedures with effectiveness tracking)**, Emotional (experiences with triggers & responses).
- **7 retrieval strategies** — Contextual, Associative, Temporal, Emotional, Pattern-based + 2 more — using real algorithms, not placeholders.
- **15 advanced enhancements** — Compression, Validation, **Privacy (AES-256-GCM encryption)**, Analytics, Associations, Replay, Versioning, Lifecycle, Sync, Semantic-search, Query-optimization, Real-time-updates, Export-import, plus 2 more.

**Conversation System (5.8K LOC)** (`src/core/services/conversation/README.md`, `ENHANCEMENTS.md`, `INTEGRATION.md`):
- **NLU stack** — **14 intent types** with multi-intent detection + user-specific pattern learning; NER with **coreference resolution**; sentiment analysis (6 emotions + sarcasm detection); topic modeling with transition detection; reference resolution (anaphora, implicit refs, cross-turn tracking); **30+ speech acts**.
- **Response generation** — **100+ templates** organized by intent/emotion/formality; dynamic content filling; personality styling via Big Five traits; memory integration; appropriateness checking; diversity management (repetition avoidance, variation generation, novelty scheduling).
- **Dialogue management** — flow control (topic lifecycle); turn-taking (natural rhythm, response timing, **backchanneling**); clarification system; repair strategies; topic suggestion; **meta-conversation handler** (self-aware commentary, quality assessment, improvement suggestions).
- **Performance contracts** — sub-200ms for simple queries, sub-300ms for complex; **10+ concurrent conversations**; streaming with chunking; **44 tests, 100% pass rate**.
- **Cross-service integration patterns** (from `INTEGRATION.md`):
  - Memory ↔ Conversation: retrieve relevant memories, store turns with context.
  - Personality ↔ Conversation: trait-based styling; personality updates from sentiment/engagement signals.
  - Values ↔ Conversation: goal-aware responses, value alignment tracking.
  - **Event Bus pattern** for real-time trait/memory/conversation updates.
  - **Streaming response support** with configurable chunk sizes, natural typing simulation, progress callbacks.

**Values Service** (`src/core/services/values/README.md`) — the only formal goal/accountability spec in any repo:
- **Value management** — 8+ categories (Health, Relationships, Career, Personal, Financial, Creative, Spiritual, Learning); dynamic prioritization on 0–10 scale; conflict detection.
- **Goals & accountability** — Goal timeframes (short/medium/long-term), milestone decomposition, **streak tracking + check-in system** (daily/weekly), completion rate analytics, **gamification support**.
- **Decision support** — value-based evaluation framework, alignment scoring with keyword analysis, conflict resolution assistance.

**Standards (`docs/COMPLETE-REQUIREMENTS.md`)** — formalizes "**15 advanced enhancements per service**" pattern: reinforcement learning, emotion blending, EQ metrics, consistency monitoring, effectiveness tracking, correlation analysis, event recording, report generation, plus more. Recommend adopting as the default checklist when promoting any subsystem from `legacy/` to canonical.

### Conflicts & clarifications surfaced this pass

- **Source of canonical Approved Deviations** is `Sallie/sallie/deviations/`, not Sally's `EDIT ME.md`. The original Strategic Index attributed them to both; correction: Sally's `EDIT ME.md` *implements* (Right-Hand v5.4.1) what the deviations *propose*.
- **Tier 4 safety model** is specifically **transparency + rollback**, *not* per-action permission. Original index said "Tier 4 unlock conditions" without specifying the safety doctrine.
- **Memory 4th tier** — sallie-project says **Procedural** (matching sallie_1.0); host says **Working**. Both are now triple-confirmed; the recommendation in the prior pass — "coexistence: Working = runtime cache, Procedural = long-term skill memory" — stands.
- **16 emotions** — the previous index was right about the count; this pass adds the explicit list of the 10 complex ones.
- **Identity DNA model** — the deviations propose **dual identity** (Creator's Heritage DNA + Sallie's own `sallie_identity.json`), a philosophical shift from "Sallie as Creator's right-hand" toward "cognitive equal with independent expression." This is *not* yet reflected in host code; flag as an upcoming Tier-4-tier architectural change.
- **Connectivity endpoint constants** — the LAN URL `http://192.168.1.47:8742` is a Creator-machine specific address from the discussion log; should be parameterized via env var, never hard-coded.

### What is now exhaustively covered

After this pass, every doc tree in `docs/vision/` has been triaged:

- `docs/vision/Sallie/` — 14/14 files visited (9 read in full, 5 already cited or boilerplate)
- `docs/vision/Sally/` — 229 files (14 read, 190+ skimmed; coverage tracked in prior pass)
- `docs/vision/app/` — 9/9 files visited (4 read in full, 5 already cited)
- `docs/vision/before/` — 623 files (20 read, 500+ skimmed; tracked in prior pass)
- `docs/vision/sallie-infinite/` — 8/8 read in full (original Strategic Index)
- `docs/vision/sallie-project/` — 18 files visited (11 read in full, 7 already cited or boilerplate)
- `docs/vision/sallie_1.0/` — 70 files (30+ read in full; tracked in prior pass)

Plus host `Sallie-AI/` triaged (~18 read in full, ~95 skimmed) and both binary docs extracted and assessed.

**No source-repo doc tree remains untriaged.** The only material genuinely unread is the long tail of vendored tool-reference docs, per-component changelogs, completion-status reports, and the Creator-local file `c:\Sallie\docs\1111111111111111111.txt` referenced in the Decision Log (not in any repo).

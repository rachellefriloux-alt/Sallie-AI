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

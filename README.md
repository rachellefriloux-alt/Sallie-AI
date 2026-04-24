# Sallie

Sallie is a personal AI companion — local-first, privacy-first, persona-driven —
intended to live across mobile, web, and desktop surfaces. This repository
(`Sallie-AI`) is the **canonical home**: the eight predecessor repos
(`Sallie`, `before`, `Sally`, `sallie-project`, `sallie_1.0`, `sallie-infinite`,
`app`, plus this host) have been combined here.

> **The plan and target architecture are in [`VISION.md`](VISION.md).**
> Onboarding (Convergence) spec: [`docs/spec/convergence.md`](docs/spec/convergence.md).
> Per-source-repo merge log: [`MERGE_NOTES.md`](MERGE_NOTES.md).
> Original idea/vision/spec documents from every predecessor repo:
> [`docs/vision/`](docs/vision/) (preserved verbatim).

---

## Repository layout

The repo is mid-restructure into a monorepo. The canonical layout is:

```
apps/
  mobile/          Expo / React Native phone app
  web/             Web app (PWA / desktop browser surface)
  android-native/  Native Android / Kotlin launcher
  desktop/         Electron desktop wrapper
  android-launcher/(predecessor; folds into android-native)
services/
  api/             Node / TypeScript API gateway
  brain/           Python AI brain (the nine core systems)
  knowledge/       RAG / vector search service
  voice/           STT / TTS service
packages/
  core/            Shared persona, memory, tone, identity, AI logic
  ui/              Shared UI components
  persona/, personality/, emotions/, memory/, ai-models/, skills/, features/, common/
docs/
  vision/          Verbatim idea / vision / spec docs from every predecessor repo
  spec/            Live, host-owned specs (e.g. convergence.md)
legacy/
  Sallie/  before/  Sally/  sallie-project/  sallie_1.0/  sallie-infinite/  app/
                   Read-only snapshots of every predecessor repo (no .git, no binaries
                   over 1 MB, no node_modules / build caches). Code migrates *out* of
                   here into apps/services/packages phase by phase.
```

Live root-level dirs (`core/`, `personaCore/`, `identity/`, `tone/`, `ai/`,
`server/`, `android/`, `App.tsx`, `App.vue`, …) currently host the running
implementation; each canonical destination's `README.md` lists the exact
sources and migration plan. See [`MERGE_NOTES.md`](MERGE_NOTES.md) for the
full mapping.

## What lives in `legacy/` (the eight-way merge)

| Folder              | Source repo                                                                | Role                                                                                          |
|---------------------|----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| `Sallie/`           | [Sallie](https://github.com/rachellefriloux-alt/Sallie)                    | Python + Ollama brain (v5.4.2). Canonical "nine systems" + Convergence.                       |
| `before/`           | [before](https://github.com/rachellefriloux-alt/before)                    | Earlier Vue/Kotlin Android launcher; superseded by host root.                                 |
| `Sally/`            | [Sally](https://github.com/rachellefriloux-alt/Sally)                      | Next.js 15 + Expo + Electron monorepo (Supabase + Prisma + Azure OpenAI, 130+ API routes).    |
| `sallie-project/`   | [sallie-project](https://github.com/rachellefriloux-alt/sallie-project)    | Cleanest RN/Expo phone app; production-grade OCEAN personality engine (8K LOC).               |
| `sallie_1.0/`       | [sallie_1.0](https://github.com/rachellefriloux-alt/sallie_1.0)            | Original Vue + Kotlin "Sallie 2.0 plan"; source of `MANIFESTO.md`, persona/values/tone split. |
| `sallie-infinite/`  | [sallie-infinite](https://github.com/rachellefriloux-alt/sallie-infinite)  | Pure spec/vision repo — Siri/Alexa/Gemini/Copilot blend, consent-gated, citation-first.       |
| `app/`              | [app](https://github.com/rachellefriloux-alt/app)                          | "Sallie Ascendant" FastAPI + Expo + MongoDB; Life Partner roles, 3D rooms, sovereign binding. |
| `sallieos/`         | (host-only)                                                                | OS-level integration experiments (predates this PR; preserved as-is).                         |

Each has a curated `legacy/<repo>/SNAPSHOT.md` describing what was excluded
during import and what was promoted out.

## Where to start

1. Read [`VISION.md`](VISION.md) — the canonical target architecture.
2. Read [`MERGE_NOTES.md`](MERGE_NOTES.md) — what came from where, what was
   promoted vs. preserved vs. dropped. Includes a **Strategic doc index**
   that synthesizes the most important specs across all 8 repos (the
   "Digital Progeny" v5.4.x master spec, Approved Deviations, Universal
   Capability System, Avatar System, Personality Engine, Life Partner
   doctrine, Mind/Soul/Heart framework, Sallie Ascendant Roadmap, Sallie
   2.0 Implementation/Enhancement plans, and the Manifesto).
3. Browse [`docs/vision/`](docs/vision/) — the full original idea/vision/spec
   docs from each predecessor repo, preserved verbatim and grouped by source.
4. Browse `apps/*/README.md`, `services/*/README.md`, `packages/*/README.md`
   for per-target-folder migration plans.

## Build (today, transitional)

The running implementation is still rooted at the repo root. Use existing
scripts:

```bash
npm install
npm start            # Expo / React Native (apps/mobile target)
npm run dev          # Vite (apps/web target)
./gradlew :app:assembleDebug   # Android (apps/android-native target)
npm test
npm run lint
```

Per-target builds (`apps/mobile`, `services/brain`, etc.) come online as
each migration phase completes.

## License

See [`LICENSE`](LICENSE).

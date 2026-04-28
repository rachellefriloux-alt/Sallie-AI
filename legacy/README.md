# legacy/

Untouched snapshots of the predecessor repositories. **Nothing in here
runs.** Code is migrated *out* of `legacy/` and into the clean
`apps/services/packages/` tree, phase by phase, per the roadmap in
[`../VISION.md`](../VISION.md).

The promise of this folder is: **no unique element is ever lost.**
Every distinctive module, idea, asset, prompt, or persona note from
the predecessor repos lives here until it has a confirmed home in the
new architecture.

## Full snapshots (the original eight-way merge)

| Folder              | Source repo                       | Migrates in |
|---------------------|-----------------------------------|-------------|
| `Sallie/`           | Python + Ollama brain             | Phase 1     |
| `sallie-project/`   | React Native / Expo phone app     | Phase 2     |
| `before/`           | Personality / memory / skills     | Phase 4 / 6 |
| `sallie_1.0/`       | Earlier persona system            | Phase 4     |
| `sallieos/`         | OS-level integration experiments  | Phase 6     |
| `sallie-infinite/`  | Spec / vision docs                | Phase 0 (→ `docs/`) |
| `app/`              | "Sallie Ascendant" FastAPI + Expo + MongoDB | Phase 4 / 6 |
| `Sally/`            | Next.js 15 + Expo + Electron monorepo | Phase 2 / 3 |

## Reference snapshots (added by the org-wide sweep)

These three repos were not part of the original eight-way merge.
Their full source is **not** mirrored — only `README.md` + `SNAPSHOT.md`
placeholders documenting source URL, role, and per-repo notes about
which specific ideas are worth porting in later phases. Re-fetch the
upstream when actually doing that work.

| Folder              | Source repo                                                          | Why it's reference-only |
|---------------------|----------------------------------------------------------------------|-------------------------|
| `PersonaPilot/`     | Sibling local-first AI assistant (Electron + FastAPI + Qdrant)       | Mostly UI shell (~15% of Sallie's vision per its own self-assessment); shape is interesting, code overlaps the legacy `Sallie/` snapshot at lower fidelity. |
| `email-assistant/`  | Standalone Gmail assistant (FastAPI + React; OAuth, threads, replies) | Lifts cleanly into a future Sallie email *skill* (Phase 4/5); not useful until the skills registry exists. |
| `guarddog/`         | Local home-security system (NestJS + YOLO; CCTV adapters)            | Different problem domain; the *adapter + event-bus + realtime-alerts* shape is good prior art for Phase 7 sensors. |

The actual snapshots for the eight-way merge were imported by tarball
in earlier PRs; the three reference-only entries were added by the
follow-up sweep to make sure no org-level repo escapes the merge log.


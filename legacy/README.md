# legacy/

Untouched snapshots of the predecessor repositories. **Nothing in here
runs.** Code is migrated *out* of `legacy/` and into the clean
`apps/services/packages/` tree, phase by phase, per the roadmap in
[`../VISION.md`](../VISION.md).

The promise of this folder is: **no unique element is ever lost.**
Every distinctive module, idea, asset, prompt, or persona note from
the predecessor repos lives here until it has a confirmed home in the
new architecture.

| Folder              | Source repo                       | Migrates in |
|---------------------|-----------------------------------|-------------|
| `Sallie/`           | Python + Ollama brain             | Phase 1     |
| `sallie-project/`   | React Native / Expo phone app     | Phase 2     |
| `before/`           | Personality / memory / skills     | Phase 4 / 6 |
| `sallie_1.0/`       | Earlier persona system            | Phase 4     |
| `sallieos/`         | OS-level integration experiments  | Phase 6     |
| `sallie-infinite/`  | Spec / vision docs                | Phase 0 (→ `docs/`) |

The actual snapshots are imported by tarball in subsequent PRs. This
folder is intentionally created empty in Phase 0 so the structure is
visible and reviewable before any large code dump.

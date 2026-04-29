# legacy/Sallie/

**Source:** https://github.com/rachellefriloux-alt/Sallie (branch `main`)
**Snapshotted:** 2026-04-22

This is a *read-only* snapshot of the predecessor `Sallie/` (Python + Ollama
brain). Nothing here runs from this folder — code is migrated *out* into the
clean architecture (`services/brain/`, `packages/`, etc.) phase by phase.

### What was excluded from this snapshot
To keep the repo manageable, the following were **not** copied:
- `like/` (148 MB of UI mockups & design exports)
- `_internal/` (42 MB of bundled runtime)
- `SallieStudioApp/` (17 MB Studio app build)
- All binary installers (`*.exe`, `*.msi`, `*.zip`)
- All compiled bytecode (`__pycache__/`, `*.pyc`)
- `node_modules/`, `dist/`, `build/`
- Image / audio / font binaries
- Azure deployment artifacts

If any of these are needed later, re-fetch the original tarball from
GitHub. **All Python sources, TypeScript sources, JSON configs, YAML, and
markdown docs are preserved** — that's the "every unique element" guarantee.

### Where its pieces are going
| Source                                   | Destination                              | Phase |
|------------------------------------------|------------------------------------------|-------|
| `sallie_brain.py`                        | `services/brain/app/sallie_brain.py`     | 1     |
| `server/convergence_processor.py`        | `services/brain/app/systems/convergence/`| 1     |
| `server/dream_cycle*.py`                 | `services/brain/app/systems/dream_cycle/`| 5     |
| `server/enhanced_limbic_engine.py`       | `services/brain/app/systems/limbic/`     | 4     |
| `server/working_memory_hygiene.py`       | `packages/memory/`                       | 4     |
| `shared/genesis/*.json`, `*.ts`          | `services/brain/app/convergence/data/`   | 1     |
| `shared/services/agency*.ts`             | `services/brain/app/systems/agency/`     | 5     |
| `shared/services/limbic*.ts`             | merged into `packages/emotions/`         | 4     |
| `shared/services/memory*.ts`             | merged into `packages/memory/`           | 4     |
| `mobile/`                                | merged into `apps/mobile/`               | 2     |
| `web/`                                   | merged into `apps/desktop/`              | 7     |
| `backend/docker-compose.yml`             | reference for `services/brain/`          | 1     |
| `docs/`, `sallie/deviations/`            | merged into `/docs/`                     | 0/1   |

# `@sallie/convergence`

Convergence engine: renders the Q1–Q40 protocol questions, persists
answers, and produces a sealed DNA blob signed by the brain. Implements
the **6 protocols** (Obsidian / Leopard / Peacock / Celestial / Void /
**Visage**) per [ADR 0006](../../docs/architecture/0006-convergence-canon.md)
with at-rest encryption per
[ADR 0007](../../docs/architecture/0007-convergence-storage.md).

## Status

**Substantial implementations already exist** in the repo and in
`legacy/`. This package is the canonical TS destination for the
client-side rendering, answer persistence, and DNA-blob production logic.
It is intentionally empty (no placeholder `src/index.ts`) until Phase 4
ports the existing implementations in.

## Sources to merge here (in priority order)

Per the build plan, this package is filled in by porting from the
imported repos in `legacy/` and from the existing brain + host code.
Nothing in `legacy/` is modified — code is **promoted** out of it.

| Source                                                              | What to take                                                                |
|---------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `services/brain/app/convergence/data/canonical_29.json`             | Q1–Q29 (5 protocols: Obsidian, Leopard, Peacock, Celestial, Void)           |
| `services/brain/app/convergence/data/visage_11.json`                | Q30–Q40 (Visage protocol per ADR 0006). 29+11=40 ✓                          |
| `services/brain/app/convergence/data/questions.json`, `phases.json` | Phase metadata, branching, progress tracking                                |
| `services/brain/app/systems/convergence.py`                         | Server-side answer validation + DNA-blob sealing (stays server-side)        |
| `services/brain/app/routes/convergence.py`                          | REST contract this client wraps                                             |
| `legacy/Sally/src/lib/convergence-questions.ts`                     | Canonical TS question schema + question registry                            |
| `legacy/Sally/src/lib/convergence-personality-engine.ts`            | Answer → personality dimension mapping                                      |
| `legacy/Sally/src/lib/convergence-questions.test.ts`                | Existing test coverage to preserve                                          |
| `legacy/Sally/src/components/GreatConvergence30.tsx`                | Renderer component reference (web)                                          |
| `legacy/Sally/src/components/ConvergenceFlow.tsx`, `ConvergenceExperience.tsx` | Flow / wizard reference                                            |
| `legacy/Sally/src/app/api/convergence/`                             | Server route reference (Next.js)                                            |
| `legacy/Sally/supabase/functions/convergence-process/`              | Edge-function reference for answer processing                               |
| `legacy/Sallie/web/components/GreatConvergence30.tsx`               | Alternative renderer reference                                              |
| `legacy/Sallie/web/components/ConvergenceExperience.tsx`, `ConvergenceFlow.tsx` | Flow reference                                                  |
| `legacy/Sallie/mobile/src/screens/ConvergenceScreen.tsx`            | Mobile-side renderer reference                                              |
| `legacy/Sallie/mobile/src/ConvergenceExperiencePremium.tsx`         | Premium-mobile renderer reference                                           |
| `legacy/Sallie/server/convergence_processor.py`                     | Server processor reference (Python)                                         |
| `legacy/Sallie/server/convergence_websocket.py`                     | WebSocket streaming reference                                               |
| `legacy/Sallie/backend/shared/convergence_engine_29.py`             | Earlier Q1–Q29 engine                                                       |
| `legacy/Sallie/shared/convergence/`                                 | Shared TS modules                                                           |
| `legacy/Sally/src/shared/convergence/`                              | Additional shared TS modules                                                |
| `legacy/app/frontend/app/onboarding/convergence.tsx`                | Onboarding-flow integration reference                                       |

## Quality bar

Per [ADR 0005](../../docs/architecture/0005-quality-bar.md): TS strict,
zero `any`, ≥90% coverage, full JSDoc.

# packages/core/ — Shared persona, memory, tone, identity, AI logic

**Canonical home for:** the cross-surface shared kernel — anything that
both the mobile app, the web app, and the brain need to share.

**Current implementation:** scattered across root-level dirs (`core/`,
`personaCore/`, `identity/`, `tone/`, `ai/`, `values/`, `responseTemplates/`,
`onboarding/`, `feature/`, `features/`). Migration into this folder
happens phase-by-phase.

### Sources to merge here
| Source                              | What to take                                  |
|-------------------------------------|-----------------------------------------------|
| Root `core/`, `personaCore/`        | Persona kernel                                |
| Root `identity/`, `tone/`, `values/`| Identity, tone, values modules                |
| Root `ai/`                          | EmotionalArcMemory, PredictiveCompanion, MultiModalPersonaResonance, LoyaltyChallengeProtocols, IdentityManager |
| Root `responseTemplates/`           | Response templates                            |
| `legacy/sallie-project/src/core/services/personality/` | Production-grade OCEAN personality engine (8K LOC, 30 facets, 16 emotions) |
| `legacy/before/core/`, `legacy/before/personaCore/` | Earlier persona kernel (mostly duplicate)   |
| `legacy/sallie_1.0/identity/`, `tone/`, `values/`, `personaCore/` | Original modular split |

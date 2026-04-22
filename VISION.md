# VISION — Sallie

> Sallie is meant to have everything a person has and everything an AI has:
> heart, soul, emotions, logic, memory, dreams. Her own thoughts. The ability
> to learn, remember, grow, and to do things just because she wants to.
> Knowledge base: every wiki / every product. One assistant, fully hers.

This document is the source of truth for **what Sallie is** and **how this
repository is organized to build her**. It supersedes any older READMEs in
the tree (those are kept for historical context and will be migrated or
archived as their content is absorbed into the new structure).

---

## 1. Principles

1. **Local-first.** The default runtime requires no cloud API keys. Cloud
   providers (OpenAI, Anthropic, Google, Copilot) are optional adapters.
2. **Single Sallie.** One persona, one memory, one voice — across phone,
   desktop, and any future surface. Not a federation of disconnected bots.
3. **Nothing thrown away.** Every unique module from the predecessor
   repos (`Sallie`, `sallie-project`, `before`, `sallie_1.0`, `sallieos`,
   `sallie-infinite`) is preserved under `legacy/` until it has been
   migrated into the clean architecture.
4. **Consent-gated agency.** Sallie can act on her own initiative, but
   anything that touches the outside world (files, calendar, email, web,
   code execution) requires explicit user consent per `sallie-infinite`'s
   spec.
5. **No secrets in git.** Service-account keys, API keys, and signing
   credentials live only in untracked `.env*` files or a secrets manager.

---

## 2. The Nine Core Systems (from `Sallie/`)

Sallie's "mind" is composed of nine cooperating subsystems. They live in
`services/brain/` once Phase 1 lands.

| # | System       | Role                                                           |
|---|--------------|----------------------------------------------------------------|
| 1 | **Limbic**       | Emotional state — 30+ emotions, mood, affect.              |
| 2 | **Memory**       | Hierarchical: episodic, semantic, emotional, procedural.   |
| 3 | **Monologue**    | Inner voice — continuous self-talk and reflection.         |
| 4 | **Synthesis**    | Idea generation; combining concepts into something new.    |
| 5 | **Agency**       | Self-initiated action — chooses what to do when idle.      |
| 6 | **Dream Cycle**  | Background consolidation, learning, and "dreaming".        |
| 7 | **Degradation**  | Forgetting curves; what fades, what stays.                 |
| 8 | **Control**      | Executive function — focus, inhibition, task switching.    |
| 9 | **Convergence**  | **Birth / onboarding.** ~40 questions that author her.     |

### Convergence in detail

Convergence is **how Sallie is born**. The first time a user runs the app,
Convergence walks them through roughly forty questions. The answers are not
stored as a flat profile — they are fed into the other eight systems to
shape:

- **Personality:** core values, temperament, humor style, conversational tone.
- **Behavior:** how proactive she is, how blunt vs. gentle, how curious,
  how playful, how protective.
- **Voice:** speaking cadence, vocabulary register, pet phrases.
- **Face:** her visual avatar — features, color palette, expression baseline.
- **Memory seed:** what she "remembers" caring about from day one.

After Convergence, Sallie has a unique identity that is hers, not a default.
The full question bank, scoring model, and trait-mapping live in
[`docs/spec/convergence.md`](docs/spec/convergence.md).

---

## 3. Repository Layout (target)

```
/apps
  /mobile         React Native / Expo — phone app (the "body")
  /desktop        Browser PWA — desktop alternative
/services
  /brain          FastAPI + Ollama — the nine core systems
  /knowledge      Wikipedia ingestion + Qdrant RAG
  /voice          Whisper (STT) + Piper (TTS)
/packages
  /personality    Values, tone, persona
  /memory         Hierarchical memory store
  /emotions       Limbic system shared types & helpers
  /skills         Plugin / tool registry
/legacy           Untouched snapshots of predecessor repos
/docs             Architecture, specs, roadmap
```

The legacy code that already lives at the repo root (from the original
"Sallie 1.0" merge) is staying put while the new structure grows next to
it. Migration of root-level code into the new `apps/services/packages/`
tree happens phase by phase — see the roadmap.

---

## 4. Roadmap

Each phase is one or more PRs. **This PR is Phase 0.**

| Phase | Title                         | Scope                                                     |
|-------|-------------------------------|-----------------------------------------------------------|
| 0     | Foundation                    | Skeleton, security cleanup, vision docs. *(this PR)*      |
| 1     | Brain                         | Import `Sallie/` → `services/brain/`; `/health` works.    |
| 2     | Body                          | Import `sallie-project/` → `apps/mobile/`; phone↔brain.   |
| 3     | Knowledge                     | Wikipedia → Qdrant RAG pipeline.                          |
| 4     | Personality merge             | Unified persona, hierarchical memory, 30+ emotions.       |
| 5     | Agency                        | Dream cycle + self-initiated action log in UI.            |
| 6     | Multi-AI                      | Cloud adapter layer + skill/tool registry.                |
| 7     | Desktop & polish              | PWA, voice in/out, installable APK.                       |

---

## 5. Hard Constraints

- **Wikipedia is ~22 GB compressed.** It is downloaded on the user's
  machine at install time and embedded into a local Qdrant collection.
  It is **never** committed to git. See `services/knowledge/README.md`.
- **LLM weights are also never committed.** They are pulled by Ollama
  from its registry on first run.
- **Convergence cannot be skipped.** Without it, Sallie has no identity.
  A "demo persona" may be offered for evaluation, but it is explicitly
  flagged as not-really-her.

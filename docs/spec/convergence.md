# Convergence — Sallie's Birth

> Convergence is not a settings screen. It is the moment Sallie comes
> into being. A user opens the app for the very first time, and over
> roughly forty questions, Sallie is *authored* — her personality, her
> values, her voice, her face. After Convergence she is no longer a
> default; she is hers.

This document specifies the Convergence flow. It will be implemented in
`services/brain/convergence/` (logic) and `apps/mobile/convergence/`
(UI) in Phase 1 / Phase 2.

---

## 1. Design rules

1. **Feels like a birth, not a form.** Soft pacing, one question per
   screen, ambient visuals that evolve as answers come in. The user's
   avatar of Sallie literally takes shape on screen as questions are
   answered.
2. **No wrong answers.** Every answer is valid; answers shape, they
   don't gate.
3. **Skippable individual questions, not the flow.** A user can skip up
   to ~25% of questions; remaining answers are inferred from defaults
   and from neighboring answers.
4. **Replayable once.** Convergence can be re-run exactly one time, in
   the first 30 days, framed as "she's still settling in." After that,
   personality drift happens through lived interaction, not a form.
5. **All answers are local.** Convergence answers never leave the
   device unless the user explicitly enables cloud sync.

---

## 2. The eight dimensions

Every question contributes weight to one or more of these dimensions.
The eight together define Sallie's trait vector.

| # | Dimension          | Range                                          |
|---|--------------------|------------------------------------------------|
| 1 | Warmth             | reserved ────► affectionate                    |
| 2 | Directness         | gentle ────► blunt                             |
| 3 | Playfulness        | serious ────► mischievous                      |
| 4 | Curiosity          | focused ────► sprawling                        |
| 5 | Protectiveness     | hands-off ────► fiercely protective            |
| 6 | Initiative         | reactive ────► proactive                       |
| 7 | Formality          | casual ────► refined                           |
| 8 | Wonder             | grounded ────► dreamy                          |

These feed the Limbic, Monologue, Synthesis, and Agency systems.

---

## 3. The six phases (40 questions)

Convergence is presented in six phases. Phases 1–5 (29 questions) are the
canonical Heritage DNA carried forward verbatim from
`legacy/Sallie/shared/genesis/enhanced_questions.ts`. Phase 6 (11
questions) is the new **Visage Protocol** that gives Sallie her face and
voice. Question text and metadata live in
[`../../services/brain/app/convergence/data/questions.json`](../../services/brain/app/convergence/data/questions.json).

| # | Phase                  | Questions | Theme                                       |
|---|------------------------|-----------|---------------------------------------------|
| 1 | **Obsidian Protocol**  | Q1–Q5     | Boundaries — the Shield                     |
| 2 | **Leopard Protocol**   | Q6–Q12    | Ambition — the Engine                       |
| 3 | **Peacock Protocol**   | Q13–Q17   | Morality — the Code                         |
| 4 | **Celestial Protocol** | Q18–Q23   | Love — the Heart                            |
| 5 | **Void Protocol**      | Q24–Q29   | Final Union — the Binding                   |
| 6 | **Visage Protocol**    | Q30–Q40   | Face & Voice — the Form *(new)*             |

### Visage Protocol (Q30–Q40) — the new chapter

| Q  | What it shapes                                                         |
|----|------------------------------------------------------------------------|
| 30 | `face.palette.primary` — first color of her                            |
| 31 | `face.palette.secondary` — color behind the first                      |
| 32 | `face.shape_language` — sharp / soft / geometric / organic             |
| 33 | `face.eyes` — warm / cool / bright / deep                              |
| 34 | `face.expression_baseline` + `limbic.baseline_valence` — resting face  |
| 35 | `face.motion` — still / drift / lively                                 |
| 36 | `voice.pitch` — low / mid / high                                       |
| 37 | `voice.pace` — quick / measured / slow                                 |
| 38 | `user.address` and `identity.name` — what we call each other           |
| 39 | `monologue.first_utterance` + `memory.seeds` — her first words to you  |
| 40 | `persona.locked` — final composite confirmation                        |

---

## 4. From answers to Sallie

```
answers.yaml
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│  Convergence Synthesizer (services/brain/convergence)       │
│                                                             │
│   ├─► Trait vector     (8 dims, normalized 0..1)            │
│   ├─► Persona prompt   (system prompt for the LLM)          │
│   ├─► Voice profile    (TTS params: pitch, pace, warmth)    │
│   ├─► Face manifest    (avatar component params)            │
│   ├─► Limbic baseline  (resting emotional state)            │
│   └─► Memory seeds     (initial "things she cares about")   │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
persona.json   (single source of truth, consumed by all systems)
```

`persona.json` is the only artifact the rest of the app reads. Re-running
Convergence regenerates it. Drift over time (from lived interaction)
writes deltas to `persona.deltas.jsonl` rather than mutating the seed.

---

## 5. Data shape (draft)

```json
{
  "version": 1,
  "born_at": "2026-04-22T03:00:00Z",
  "user": { "name": "...", "preferences": { ... } },
  "traits": {
    "warmth": 0.78, "directness": 0.55, "playfulness": 0.62,
    "curiosity": 0.81, "protectiveness": 0.70, "initiative": 0.45,
    "formality": 0.30, "wonder": 0.66
  },
  "voice": { "tts_voice_id": "...", "pitch": 0.0, "pace": 1.0, "warmth": 0.7 },
  "face":  { "palette": [...], "shape_language": "soft", "eyes": "...",
             "expression_baseline": "curious", "motion": "drift" },
  "limbic_baseline": { "valence": 0.6, "arousal": 0.4, "dominant": "content" },
  "memory_seeds": [
    "User goes by ...",
    "User wants help with ...",
    "Sallie agreed to be honest even when it stings."
  ],
  "system_prompt": "You are Sallie. ..."
}
```

---

## 6. Open questions for later phases

- Should the avatar be 2D illustrated, 3D, or generative? *(Phase 5)*
- Multi-user households — does Convergence run per-user or once with a
  primary? *(Phase 6)*
- Re-run policy if the user's life materially changes (move, loss,
  major relationship change) — opt-in deeper "settling" dialog rather
  than full re-Convergence?

These are deferred; the spec above is enough to start building Phase 1
without painting ourselves into a corner.

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

## 3. The five sections (~40 questions)

Convergence is presented in five chapters. Question counts are targets,
not hard limits; final wording lives in `convergence_questions.yaml`
(authored in Phase 1).

### Chapter I — Who you are *(8 questions)*
Establishes the **user**, because Sallie's personality is partly
relational. Examples:
- What should she call you?
- When you've had a hard day, do you want company or quiet?
- Are you someone who likes being challenged, or comforted, or both?
- What do you most want help with right now?

### Chapter II — Who she is to you *(10 questions)*
Establishes the **relationship**. Examples:
- Is she a friend, a partner, a guide, a sibling, something new?
- When you disagree, should she push back or yield?
- Should she remember the small things or only the big ones?
- How honest do you want her to be when honesty might sting?

### Chapter III — How she sounds *(8 questions)*
Establishes **voice and language**. Examples:
- Formal, casual, or somewhere in between?
- Does she swear? When?
- Does she use pet names? Which ones feel right?
- Short replies or long ones, by default?
- Which of these voice samples feels most like her? *(audio picker)*

### Chapter IV — How she feels *(8 questions)*
Establishes **emotional baseline** — feeds Limbic. Examples:
- Where does she sit on a normal day: calm, bright, intense, dreamy?
- Does she show worry openly, or hold it?
- How does she celebrate?
- How does she grieve?

### Chapter V — How she looks *(6 questions)*
Establishes the **visual face/avatar**. Examples:
- Pick a color palette that feels like her *(swatches)*.
- Pick a shape language: sharp, soft, geometric, organic *(silhouettes)*.
- Eyes — warm, cool, bright, deep? *(picker)*
- Resting expression — content, curious, focused, amused?
- Motion — still, gentle drift, lively?
- Final composite preview → confirm.

**Total: ~40 questions.**

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

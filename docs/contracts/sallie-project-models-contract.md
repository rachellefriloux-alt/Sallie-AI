# `legacy/sallie-project/src/core/services/` — Missing-Models Contract Specification

> **Phase 1.4 deliverable.** This document is the evidence-based contract
> specification for the 19 missing model classes referenced by the four
> service modules under `legacy/sallie-project/src/core/services/`. It is the
> precursor to (and de-risks) the eventual model-reconstruction pass that
> unblocks promotion of the rich-memory, personality, conversation, and
> values services.
>
> **Source of truth:** every fact in this document is derived from one of:
> (a) a still-present `docs/vision/sallie-project/src/core/services/*/(API|README).md`
> spec; (b) a still-present `__tests__/` constructor / assertion in the
> snapshot; or (c) a still-present consumer call site in the snapshot.
> No fact is invented — when evidence is absent it is marked as such.
>
> See `MERGE_NOTES.md` → "Lift-readiness audit (April 2026 follow-up)" for
> the discovery context.

## Summary

| Module                       | Model files | Distinct exports | Doc spec? | Test ctor signatures? |
|------------------------------|-------------|------------------|-----------|-----------------------|
| `services/memory/` (rich)    | 5           | 7                | ✅ `API.md` (field-level) | ✅ all 4 subtypes |
| `services/conversation/`     | 5           | 21               | ⚠️ none for models | ❌ |
| `services/personality/`      | 4           | 14               | ⚠️ partial (`README.md`) | ❌ |
| `services/values/`           | 5           | 8 + 4 enums      | ⚠️ none for models | ❌ (only call-site usage) |
| **Total**                    | **19**      | **~50**          | mixed     | memory only           |

The asymmetry is significant: **the memory module is by far the most
reconstruction-ready** (full field-level docs in `API.md` plus a complete
test file with concrete constructor calls for all four subtypes). The other
three modules require contract inference from consumer call sites only.

---

## Module 1 — `services/memory/` (rich variant)

**Doc spec:** `docs/vision/sallie-project/src/core/services/memory/API.md`
documents the `MemoryEntity` base class (id, type, content, privacy, metadata,
version, isConsolidated, decayFactor) and lists methods (`validate`,
`recordAccess`, `applyDecay`, `getEffectiveImportance`, `addTags`,
`addEntities`, `consolidate`, `update`, `toJSON`).

**Test evidence:** `__tests__/MemoryEntity.test.ts` exercises all four
subtypes with concrete constructor calls — these are the highest-fidelity
evidence in the entire snapshot.

### `models/MemoryEntity.ts`

**Required exports:**
- `class MemoryEntity<T = unknown>` — base class
- `enum MemoryType { EPISODIC, SEMANTIC, PROCEDURAL, EMOTIONAL }`
- `enum PrivacyLevel { …, SENSITIVE, CONFIDENTIAL, … }` (other levels not exercised)

**Properties (from consumer access patterns):**
```
id: string
type: MemoryType
content: T
privacy: PrivacyLevel
metadata: { createdAt: Date; lastModifiedAt: Date; lastAccessedAt: Date;
            tags: string[]; entities: string[]; confidence: number; … }
isConsolidated: boolean
decayFactor: number
tags: string[]                          // possibly a getter delegating to metadata
```

**Methods (from consumer call patterns):**
```
validate(): boolean
recordAccess(): void
applyDecay(rate: number): void
getEffectiveImportance(): number
addTags(...tags: string[]): void
addEntities(...entities: string[]): void
consolidate(): void
update(newContent: T, description?: string): void
toJSON(): unknown
```

### `models/EpisodicMemory.ts`

**Required exports:** `class EpisodicMemory extends MemoryEntity<EpisodicContent>`

**Constructor signature** (from `MemoryEntity.test.ts:17`):
```ts
new EpisodicMemory(id: string, content: {
  description: string;
  participants: Array<{ id: string; name: string }>;
  temporal: { startTime: Date; /* endTime? duration? */ };
  /* other fields not exercised in test */
})
```

**Required type behaviour:** `instance.type === MemoryType.EPISODIC`.

**Subtype-specific methods (from consumer access):**
```
hasParticipant(id: string): boolean
isAbout(query: string): boolean
getDuration(): number
```

### `models/SemanticMemory.ts`

**Required exports:**
- `class SemanticMemory extends MemoryEntity<SemanticContent>`
- `enum SemanticKnowledgeType { FACT, PREFERENCE, … }`

**Constructor signature** (from `MemoryEntity.test.ts:79`):
```ts
new SemanticMemory(id: string, content: {
  knowledgeType: SemanticKnowledgeType;
  subject: string;
  property: string;
  value: unknown;
})
```

**Required type behaviour:** `instance.type === MemoryType.SEMANTIC`.

### `models/ProceduralMemory.ts`

**Required exports:** `class ProceduralMemory extends MemoryEntity<ProceduralContent>`

**Constructor signature** (from `MemoryEntity.test.ts:122`):
```ts
new ProceduralMemory(id: string, content: {
  name: string;
  description: string;
  context: { activity: string; /* … */ };
  steps: Array<{ order: number; description: string }>;
})
```

**Subtype-specific methods (from consumer access):**
```
recordSuccess(): void
recordFailure(): void
getSuccessRate(): number
```

### `models/EmotionalMemory.ts`

**Required exports:** `class EmotionalMemory extends MemoryEntity<EmotionalContent>`

**Constructor signature** (from `MemoryEntity.test.ts:166`):
```ts
new EmotionalMemory(id: string, content: {
  emotionalState: {
    primaryEmotion: string;            // 'joy' | 'sadness' | … (string, not the enum)
    intensity: number;                 // 0..1
    valence: number;                   // -1..1
    arousal: number;                   // 0..1
  };
  triggers: Array<{ type: string; description: string; strength: number }>;
  context: Record<string, unknown>;
})
```

**Reconstruction risk for memory:** **LOW.** Field-level API.md + concrete
test constructors leave very little to infer. Recommend full reconstruction
as the first item of the eventual implementation pass.

---

## Module 2 — `services/personality/`

**Doc spec:** partial — `README.md` describes `TraitVector` shape (value,
confidence, variance, stability, velocity, 6 facets per trait) and
references `EmotionVector` / `MoodState` shapes at lower fidelity. No
separate API.md for models.

### `models/EmotionVector.ts`

**Required exports:**
- `class EmotionVector` (or `interface` — needs decision)
- `enum PrimaryEmotion { Joy, Sadness, Anger, Fear, Surprise, Disgust }` (6 values, all observed)
- `enum ComplexEmotion { Contentment, Frustration, Gratitude, Guilt, Hope, Jealousy, Love, Nostalgia, Pride, Shame }` (10 values, all observed)
- `enum TriggerType { MemoryBased, Situational, Social, ValueBased }`
- `interface EmotionalBaseline` (used only as type annotation; shape not exercised)
- `interface EmotionTransitionProbability` (ditto)
- `function createDefaultEmotionVector(): EmotionVector`
- `function createDefaultEmotionIntensity()` (signature unknown — appears in factory imports only)
- `function createDefaultBaseline(): EmotionalBaseline`

**Property surface (from `emotionVector.*` access patterns):**
```
primary: Map<PrimaryEmotion, number> | Record<PrimaryEmotion, number>
complex: Map<ComplexEmotion, number> | Record<ComplexEmotion, number>
emotionalClarity: number              // 0..1
intensity: number                      // observed via `emotion.intensity`
valence: number                        // observed via `emotion.valence`
arousal: number                        // observed via `emotion.arousal`
```

### `models/TraitVector.ts`

**Required exports:**
- `class TraitVector` (or interface — see open question below)
- `enum EvolutionCause { BehavioralOutcome, DirectFeedback, EmotionalImpact, SocialInteraction, ValueAlignment }`
- `function createDefaultTraitVector(): TraitVector`

**Property surface (from `traits.*` and `traitVector.*` access patterns):**
```
openness: TraitDimension
conscientiousness: TraitDimension
extraversion: TraitDimension
agreeableness: TraitDimension
neuroticism: TraitDimension
evolutionHistory: Array<{ trait: string; cause: EvolutionCause; … }>
version: number
lastUpdated: Date
```

`README.md` specifies each `TraitDimension` as: `value` (0–100), `confidence`
(0–1), `variance` (situational range), `stability` (0–1, resistance to
change), `velocity` (rate of evolution), `facets` (6 sub-dimensions per
trait). Facet shape is unspecified by docs.

### `models/EmotionalState.ts`

**Required exports:**
- `interface EmotionalMemoryEntry`
- `interface StimulusRecord`
- `enum StimulusType { UserMessage, SystemEvent, ValueConflict, … }` (3 values observed)

No property-level access evidence captured in this pass — these types are
used primarily as type annotations on method signatures within
`emotions/EmotionalMemory.ts` and `emotions/StimulusProcessor.ts`. A
follow-up pass should grep the methods that build/return these for shape.

### `models/MoodState.ts`

**Required exports:**
- `interface MoodState`
- `interface MoodInfluence`
- `function calculateMoodLabel(state: MoodState): string`

**Property surface (from `state.*` access patterns relevant to mood):**
```
averageValence: number
averageArousal: number
clarity: number
dominant: PrimaryEmotion
buffer, history, evolution                  // exact shape not exercised
```

**Reconstruction risk for personality:** **MEDIUM.** Enum values are fully
known; class shapes are partially known via README; precise constructor
signatures and `EmotionalState`/`MoodState` field-level details require
either deeper code inference or a design decision. Best handled together
(all four files form one cohesive personality model).

---

## Module 3 — `services/conversation/`

**Doc spec:** none for models. `README.md`, `USAGE.md`, `INTEGRATION.md`,
and `ENHANCEMENTS.md` describe service behavior, not model shapes.

### `models/ConversationContext.ts`

**Required exports** (from import statements):
- `interface ConversationContext`
- `interface ConversationTurn`
- `interface Topic`
- `interface ContextElement`
- `interface ContextUpdateOptions`
- `interface SentimentScore`

**Property surface for `ConversationContext` (from `context.*` access):**
```
userId: string
turns: ConversationTurn[]
currentTurn: ConversationTurn
recentIntents: Intent[]
focusedEntities: Entity[]
entityFocusHistory: Array<…>
activeTopics: Topic[]
topicStack: Topic[]
currentSentiment: SentimentScore
sentimentHistory: SentimentScore[]
currentGoal: ConversationGoal | null
contextWindow: ContextElement[]
contextWindowSize: number
importantMoments: Array<…>
lastUpdateTime: Date
```

**Property surface for `Topic`:**
```
id: string
name: string
keywords: string[]
importance: number
mentions: number
```

**Property surface for `ConversationTurn` (partial):**
```
entities: Entity[]
/* other fields seen as `turn.entities` only */
```

### `models/DialogueState.ts`

**Required exports:**
- `interface DialogueState` (or class)
- `enum DialoguePhase { OPENING, GOAL_PURSUIT, TOPIC_DEVELOPMENT, CLARIFICATION, REPAIR, CLOSING }` (6 values, all observed)
- `enum TurnStatus { USER_TURN, ASSISTANT_TURN, TRANSITION, WAITING }` (4 values, all observed)
- `enum InitiativeHolder { USER, ASSISTANT, MIXED }` (3 values, all observed)
- `interface TopicTransition`
- `interface ConversationGoal`
- `interface ClarificationRequest`
- `class ConversationError extends Error`

**Property surface for `DialogueState`:**
```
currentPhase: DialoguePhase
turnStatus: TurnStatus
initiativeHolder: InitiativeHolder
initiativeHistory: Array<…>
turnCount: number
lastSpeaker: 'user' | 'assistant'
lastUserActivity: Date
lastAssistantActivity: Date
inMultiTurnResponse: boolean
activeTopics: Topic[]
topicStack: Topic[]
topicExhausted: boolean
canSuggestTopic: boolean
activeGoals: ConversationGoal[]
completedGoals: ConversationGoal[]
pendingClarifications: ClarificationRequest[]
clarificationHistory: ClarificationRequest[]
currentErrors: ConversationError[]
userEngagementLevel: number
```

### `models/Entity.ts`

**Required exports:**
- `interface Entity`
- `enum EntityType { PERSON, LOCATION, ORGANIZATION, DATE, TIME, OBJECT, EMOTION }` (7 values, all observed)
- `interface EntityExtractionResult`
- `interface CoreferenceChain`
- `interface EntityAttribute`
- `interface EntityRelationship`

Property-level shape requires deeper inference — usage occurs almost
entirely inside `nlu/EntityExtractor.ts` which builds these objects from
NLP output.

### `models/Intent.ts`

**Required exports:**
- `interface Intent`
- `enum IntentType { ACTION_REQUEST, INFORMATION_REQUEST, CLARIFICATION, CONFIRMATION, DENIAL, EMOTIONAL_EXPRESSION, FAREWELL, FEEDBACK, GREETING, PREFERENCE_STATEMENT, SOCIAL_INTERACTION, UNKNOWN }` (12 values, all observed)
- `interface IntentRecognitionResult`

### `models/SpeechAct.ts`

**Required exports:**
- `interface SpeechAct`
- `enum SpeechActType` — 17 values observed: `ASSERTION, OPINION, REQUEST, DIRECT_COMMAND, INDIRECT_COMMAND, WH_QUESTION, YES_NO_QUESTION, GREETING, FAREWELL, THANKS, APOLOGY, CONFIRMATION, OFFER, PROMISE, SUGGESTION, ADVICE, WARNING`
- `interface SpeechActRecognitionResult`
- `interface SpeechActIndicator`

**Reconstruction risk for conversation:** **MEDIUM-HIGH.** All enums and
property names are knowable from call sites, but exact shape of the NLP
result wrappers (`*RecognitionResult`, `EntityExtractionResult`,
`CoreferenceChain`) and the `Intent` / `Entity` / `SpeechAct` core
interfaces themselves needs careful inference from how the producers (in
`nlu/`) build them and how the consumers (`ConversationService`, `dialogue/`)
read them. Probably the largest model surface of the four modules.

---

## Module 4 — `services/values/`

**Doc spec:** none for models. `README.md` describes service behavior only.

### `models/Value.ts`

**Required exports:**
- `class Value` (created by `createValue()` factory in service)
- `interface ValueDefinition` (used as plain data record — for storage import/export)

**Constructor data shape (from `ValueService.createValue`):**
```ts
Partial<ValueDefinition> & { name: string; category: ValueCategory }
```

`enum ValueCategory { CREATIVE, HEALTH, PERSONAL, SOCIAL }` (4 values
observed; likely incomplete — others may exist that aren't exercised).

### `models/Goal.ts`

**Required exports:**
- `class Goal`
- `interface GoalDefinition`
- `interface GoalDependency`
- `enum GoalTimeframe { SHORT_TERM, MEDIUM_TERM, LONG_TERM }` (3 values observed)
- `enum GoalStatus { … }` (specific values not exercised in observable code; used as filter type)

**Constructor data shape:**
```ts
Partial<GoalDefinition> & { title: string; timeframe: GoalTimeframe }
```

### `models/Commitment.ts`

**Required exports:**
- `class Commitment`
- `interface CommitmentDefinition`
- `enum CommitmentFrequency { DAILY, … }` (only DAILY observed)

**Constructor data shape:**
```ts
Partial<CommitmentDefinition> & { title: string; frequency: CommitmentFrequency }
```

### `models/Decision.ts`

**Required exports:**
- `class Decision`
- `interface DecisionDefinition`
- `interface DecisionOption`

**Constructor data shape:**
```ts
Partial<DecisionDefinition> & { title: string }
```

### `models/Milestone.ts`

**Required exports:**
- `class Milestone`
- `interface MilestoneDefinition`

**Constructor data shape:**
```ts
Partial<MilestoneDefinition> & { goalId: string; title: string; order: number }
```

**Reconstruction risk for values:** **HIGH.** No doc, no tests; only the
`createX(data: Partial<XDefinition> & {…required…})` factory call sites
reveal shape. The `*Definition` interfaces are used for `import/export`
JSON shapes, so they need to be complete data records, but no field
beyond the required-tuples is observable. Recommend treating values
reconstruction as the **last** of the four — it is the most speculative
and the values service itself sits at the top of the dependency stack.

---

## Open design questions surfaced by this audit

These are *not* contract gaps; they are decisions a future implementer
must make explicitly because the legacy code's intent is ambiguous:

1. **Memory model: classes vs. plain interfaces.** API.md presents
   `MemoryEntity` as a class with methods; consumers use both
   `new EpisodicMemory(...)` (class) **and** spread/serialize patterns
   (`as EpisodicMemory`, `toJSON()`, JSON-driven construction in
   `LocalStorageAdapter`). Pick one shape and document.
2. **Personality: `class TraitVector` vs `interface TraitVector`.**
   `createDefaultTraitVector()` factory + `traits.forEach(...)` access
   suggests an object with iterable trait dimensions. Doc spec implies
   class; some call sites read like Map iteration. Decide before authoring.
3. **`MemoryType` vs `'episodic' | 'semantic' | …` string literals.**
   `EmotionalMemory` test passes `primaryEmotion: 'joy'` as a string
   while `PersonalityService` uses `PrimaryEmotion.Joy` enum. The two
   modules have inconsistent style. Pick one across the new models.
4. **`models/` directory location.** Three options:
   - `services/models/` (single shared package — matches the implicit
     `'../models/...'` path the legacy code used)
   - Per-domain co-located: `services/{memory,conversation,personality,values}/models/`
   - Embed inside each service module's `types/` directory (matches the
     style already established by the promoted simple `services/memory/`)

   The all-or-nothing `@core/services/*` cross-coupling (Finding 3 of the
   audit) means **option 1 (shared package) is the lowest-friction path**.
5. **Replace simple `services/memory/` or coexist?** The promoted simple
   memory and the rich-memory variant cover overlapping ground. Decision
   deferred — but reconstructing models for the rich variant is
   appropriate work in either case (they can coexist under different
   names, or the rich one can wholesale replace once it's fully ported).

---

## Recommended implementation sequence

Driven by reconstruction risk + dependency depth:

| Order | Action | Rationale |
|-------|--------|-----------|
| 1     | Memory models (5 files)              | Lowest risk — full docs + tests. Prerequisite for everything else. |
| 2     | Promote rich `services/memory/`      | Validates the memory models against real consumer code.            |
| 3     | Personality models (4 files)         | Medium risk; well-bounded by docs + observed enums.                |
| 4     | Promote `services/personality/`      | Largest service (~8 K LOC, 91 % coverage per IMPLEMENTATION_SUMMARY). |
| 5     | Conversation models (5 files)        | Medium-high risk; depends on personality + memory completing first. |
| 6     | Promote `services/conversation/`     | Depends on personality + memory.                                   |
| 7     | Values models (5 files)              | Highest risk; minimal observable evidence.                         |
| 8     | Promote `services/values/`           | Sits at the top of the service dependency stack.                   |

Steps 1, 3, 5, 7 each warrant their own focused PR with `tsc --strict` +
the corresponding service's existing test suite as the acceptance gate.
Steps 2, 4, 6, 8 are the verification harness that proves each model set
is complete.

This document supersedes any earlier "lift candidate" claims about these
four service modules. It is the authoritative scoping artifact for the
remaining sallie-project promotions.

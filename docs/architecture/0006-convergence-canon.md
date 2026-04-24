# 0006 — Convergence canon

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Sallie core team
- **Related:** [`VISION.md`](../../VISION.md) §2 (System #9 —
  Convergence in detail), [ADR 0002 Identity model](./0002-identity-model.md),
  [ADR 0007 Convergence storage](./0007-convergence-storage.md),
  [`MERGE_NOTES.md`](../../MERGE_NOTES.md) (Convergence size row).

## Context

Convergence is how Sallie is born — the onboarding flow that authors
her identity from the user's answers. The source repos disagree
sharply on how many questions and how many protocols it contains:

| Source                | Questions | Protocols                                      |
|-----------------------|-----------|------------------------------------------------|
| `legacy/app/` v1      | 10        | (unstructured)                                 |
| `legacy/Sallie/sallie/` (web) | 14 | (unstructured)                            |
| `legacy/Sally/`       | 30        | "Genesis" (single protocol)                    |
| `legacy/Sallie/` (Heritage) | 29  | 5 protocols: Obsidian, Leopard, Peacock, Celestial, Void |
| `legacy/app/` Ascendant | 43      | (loose grouping)                               |
| `VISION.md` (target)  | 40        | 6 phases (Heritage 5 + Visage)                 |

`VISION.md` §2 commits to "40 questions across 6 phases. Phases 1–5
(Q1–29) are the canonical Heritage DNA from the predecessor `Sallie/`
repo … Phase 6 (Q30–40, the Visage Protocol) is new and gives Sallie
her face, voice, and avatar."

This ADR makes that commitment binding and names the protocols, so
that Phase 4 implementation has an unambiguous specification.

## Decision

Convergence is **40 questions across 6 protocols**, in this exact
order:

| #     | Protocol     | Questions | Purpose                                                      |
|-------|--------------|-----------|--------------------------------------------------------------|
| **1** | **Obsidian** | Q01–Q06   | Core values: what Sallie protects.                           |
| **2** | **Leopard**  | Q07–Q12   | Temperament: how Sallie moves through the world.             |
| **3** | **Peacock**  | Q13–Q18   | Voice: register, humor, vocabulary.                          |
| **4** | **Celestial**| Q19–Q24   | Worldview: how Sallie reads meaning and signals.             |
| **5** | **Void**     | Q25–Q29   | Boundaries: what Sallie refuses, where she goes silent.      |
| **6** | **Visage**   | Q30–Q40   | Face, voice, and avatar (new in this canon).                 |

Operational rules:

- The question bank is canonical and lives at
  `services/brain/app/convergence/data/questions.json` (per
  `VISION.md` §2). The schema for a question is defined in
  `packages/core/convergence.ts`.
- Convergence **cannot be skipped** (`VISION.md` §5). A demo persona
  may be offered for evaluation, explicitly flagged as not-really-her.
- The output is a **single signed DNA blob** (per ADR 0002), not six
  separate blobs.
- The Q30–Q40 Visage answers populate fields that overlap with the
  legacy host repo's `sallie_identity.json`. The migration from that
  file is described in ADR 0002.
- A user may **re-run a single protocol** (e.g. "redo Visage" to
  change the avatar) without re-doing the whole flow. Re-running
  produces a new DNA version; the previous version is retained for
  rollback per ADR 0003.
- Question text and answer schemas are versioned. Adding a question is
  a backwards-compatible schema change (new optional field on the DNA
  blob); removing or renumbering a question requires a migration ADR.

## Alternatives considered

- **Stick with 29 questions, 5 protocols (pure Heritage).** Rejected:
  no canonical place for face / voice / avatar choices; forces those
  into a side-channel file that ADR 0002 bans.
- **30 questions, single "Genesis" protocol** (Sally model). Rejected:
  loses the meaningful protocol structure that gives users a sense of
  what each batch of questions is for.
- **43 questions, "Ascendant" loose grouping** (app model). Rejected:
  more than the brain currently uses, with redundancy across groups.
- **More than 6 protocols.** Rejected for now to keep the onboarding
  bounded. Future protocols are not forbidden — they go through their
  own ADR and a Convergence schema migration.

## Consequences

- **Positive:**
  - Phase 4 implementers have an unambiguous spec.
  - Identity (ADR 0002), trust (ADR 0003), and Convergence storage
    (ADR 0007) all reference one fixed canon.
  - Visage gives the avatar / voice work a real home in the flow.
- **Negative:**
  - Re-running a single protocol is a feature that needs UI and
    migration work in `packages/convergence`. Not free.
  - The legacy 14-question web Convergence will be fully retired and
    its data migrated. Users of that flow get a one-time finish-up
    Convergence to fill the gap.
- **Follow-ups:**
  - Author the 40 canonical questions in
    `services/brain/app/convergence/data/questions.json` (Phase 4).
  - Implement the Convergence engine in `packages/convergence`
    (Phase 4, build plan item 44).
  - Implement per-protocol re-run in clients (Phase 2A–C).
  - Author the migration from the 14-question and 29-question legacy
    flows in Phase 4.

## References

- `VISION.md` §2 System #9.
- `MERGE_NOTES.md` Convergence size row.
- `legacy/Sallie/` Heritage protocol definitions.
- Build plan items 6 (this ADR), 43–44, 73.

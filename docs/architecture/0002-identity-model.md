# 0002 — Identity model

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Sallie core team
- **Related:** [`VISION.md`](../../VISION.md) §2 (System #9: Convergence),
  [ADR 0006 Convergence canon](./0006-convergence-canon.md),
  [ADR 0007 Convergence storage](./0007-convergence-storage.md).

## Context

Sallie's identity is produced by Convergence (the onboarding flow). The
source repos disagree on **how that identity is stored and addressed**:

- **`legacy/Sallie/`** treats Convergence Q1–Q29 (Heritage, 5 protocols)
  as the **single source of identity** — one DNA blob, signed by the
  brain, used as the seed for personality, voice, face, and memory.
- **The host repo (`Sallie-AI`)** carries a separate `sallie_identity.json`
  that predates Convergence and overlaps with it (theme, accent color,
  trait dimensions). This was never reconciled with the Heritage DNA.
- **`legacy/sallie-project/`** uses an OCEAN-derived persona blob with
  no explicit "identity file" — identity is implicit in the persisted
  trait vectors.

The build plan adds a sixth Convergence protocol, **Visage** (Q30–Q40),
for face / voice / avatar (per ADR 0006). Visage explicitly overlaps
with the data currently in `sallie_identity.json` (theme, palette, etc.).

We need to decide: one DNA blob or two?

## Decision

We will use a **single canonical DNA blob** as the source of identity.

- The blob is produced by Convergence (Q1–Q40, all six protocols
  including Visage — see ADR 0006).
- The blob is the only authoritative identity record. There is no
  separate `sallie_identity.json` going forward.
- Rendering surfaces (theme, palette, avatar) read derived values from
  the DNA blob through `packages/persona`, not from a parallel file.
- The existing `sallie_identity.json` in the host repo is treated as
  **legacy seed data**: its values are imported into the Visage protocol
  defaults so existing instances do not lose their look during the
  Phase 4 / Phase 6 migration.

The blob is signed by the brain (per `VISION.md` §2 Convergence) and
versioned. Schema changes require a migration in `services/brain/` and
a corresponding bump in `packages/core`.

## Alternatives considered

- **Dual DNA (Heritage Q1–Q29 + separate Visage Q30–Q40 file).**
  Rejected: two files invite drift; "what is Sallie?" must have one
  answer. The Visage data is conceptually part of identity, not a
  preference layer.
- **Three tiers (Heritage DNA + Visage DNA + user preferences file).**
  Rejected: same drift risk plus more migration cost. Preferences that
  are genuinely user-tunable (e.g. notification quiet hours) live in a
  separate `user_preferences` record and are out of scope for identity.
- **Keep `sallie_identity.json` as canonical and treat Convergence as
  computed-from-it.** Rejected: contradicts `VISION.md` §2 ("Convergence
  is how Sallie is born") and loses the Heritage protocols.

## Consequences

- **Positive:**
  - One identity, one signature, one place to back up and export.
  - Aligns with `VISION.md` §2 and unblocks ADR 0006 (Convergence canon)
    and ADR 0007 (Convergence storage).
  - Removes a class of bugs where the avatar said one thing and the
    persona engine said another.
- **Negative:**
  - Existing instances with hand-edited `sallie_identity.json` need a
    one-time migration into the Visage protocol defaults. The migration
    must be lossless for the fields we already store (theme name,
    accent color, trait dimensions).
  - Anyone who liked editing a JSON file directly loses that
    affordance. We will provide a "Re-run Visage" UI flow as the
    supported path to change appearance.
- **Follow-ups:**
  - Define the canonical DNA schema in `packages/core/identity.ts`
    (Phase 0.6 / Phase 4).
  - Build the import-from-`sallie_identity.json` migration in the
    Phase 4 Convergence engine.
  - Mark `sallie_identity.json` as deprecated in the host repo's
    README with a pointer to this ADR.

## References

- `VISION.md` §2 System #9 — Convergence.
- `legacy/Sallie/` Heritage protocols.
- Host repo `identity/` and `sallie_identity.json`.
- Build plan items 43–44.

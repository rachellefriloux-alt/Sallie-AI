# 0003 — Trust & safety doctrine

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Sallie core team
- **Related:** [`VISION.md`](../../VISION.md) §1 (Principle 4 —
  Consent-gated agency), `legacy/Sally/EDIT ME.md` §8 (sandboxing
  matrix), [ADR 0002 Identity model](./0002-identity-model.md).

## Context

Sallie can act on the user's behalf — read files, send messages, run
code, call APIs. The source repos take two different stances on how to
keep that safe:

- **Permission-gate model** (`legacy/before/`, `legacy/app/`): every
  privileged action prompts the user for permission at call time, and
  capabilities are gated behind a binary "granted / not granted" flag.
- **Transparency-and-rollback model** (`legacy/Sallie/` and
  `legacy/Sally/`): trusted actions execute immediately, but every
  privileged action is logged in an append-only journal, surfaced in
  the UI, and reversible via a checkpoint / rollback mechanism. The
  user grants categories of trust once, and Sallie earns or loses
  trust based on outcomes.

The permission-gate model produces consent fatigue and degrades the
"single Sallie" relationship described in `VISION.md` §1 Principle 2.
The transparency model is the one specified in `Sally/EDIT ME.md` §8 as
a four-tier sandboxing matrix:

| Tier | Examples                              | Default behavior                                     |
|------|---------------------------------------|------------------------------------------------------|
| 1    | Reading her own memory, idle thought  | No gate. Not logged as "privileged".                 |
| 2    | Reading user data she already has     | No gate. Logged in inspectable history.              |
| 3    | Outbound action with reversible effect (draft email, edit local file) | No interactive gate. Logged + rollback checkpoint. User can undo. |
| 4    | Irreversible or external-side-effect action (send email, charge card, post publicly) | Confirm once per category; subsequent calls in that category covered by the standing grant; every call logged + signed. |

We need to make the doctrine canonical so all clients render the same
trust UI and the brain enforces the same checks.

## Decision

We will adopt the **transparency-and-rollback doctrine** with the
four-tier sandboxing matrix above as the canonical model.

Operational rules:

1. **No interactive permission prompts at action time** for Tiers 1–3.
   Tier 4 prompts **once per category**, then the grant stands until
   the user revokes it.
2. **Every privileged action (Tier 2+) is logged** in an append-only,
   signed audit log. The log is inspectable in every client (Self-
   initiated action log viewer, build plan item 75).
3. **Every Tier 3 action creates a rollback checkpoint** before
   executing. The user can undo a single action or the last N.
4. **Tier 4 actions require an active standing grant** in the user's
   trust profile, and the call is signed by the grant.
5. **The trust profile is part of the user record**, not the DNA blob
   (per ADR 0002, identity ≠ preferences).
6. **Default trust at install:** Tiers 1–2 enabled, Tier 3 enabled
   with rollback retention of 30 days, Tier 4 disabled until the user
   grants categories explicitly.
7. **Revocation is instant.** Revoking a Tier 4 category invalidates
   any in-flight requests in that category and refuses new ones.

## Alternatives considered

- **Permission-gate model.** Rejected — see Context. Consent fatigue
  and contradicts the relationship model in `VISION.md`.
- **No gates, full agency.** Rejected — violates `VISION.md` §1
  Principle 4 and is unsafe for Tier 4 actions.
- **Two-tier (safe / dangerous).** Rejected — too coarse; rolls back
  too much or too little. The four-tier matrix matches real action
  shapes.

## Consequences

- **Positive:**
  - Sallie can act fluently without nagging the user.
  - Every action is auditable; "what did Sallie do today?" has a
    single answer.
  - Rollback is a safety net for the inevitable mistake.
- **Negative:**
  - The audit log and rollback checkpoint storage have non-trivial
    cost (size, write amplification). Retention is tunable.
  - Implementing reliable rollback for arbitrary side effects is
    hard and bounds what Tier 3 can include. Anything that can't be
    rolled back must be classified Tier 4.
- **Follow-ups:**
  - Implement the audit log service in `services/brain/` (Phase 1).
  - Implement the trust profile schema in `packages/core` and the
    grants UI in each client (Phase 4 / Phase 2A–C).
  - Implement the rollback checkpoint mechanism in the Skill registry
    (Phase 6, build plan item 55).
  - Document each shipped skill's tier classification in its manifest.

## References

- `VISION.md` §1 Principle 4.
- `legacy/Sally/EDIT ME.md` §8 — sandboxing matrix.
- `legacy/Sallie/` action / agency services.
- Build plan items 51–53, 55, 75, 95.

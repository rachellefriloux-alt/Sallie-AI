# Architecture Decision Records (ADRs)

This directory holds the canonical record of architectural decisions for
Sallie. Each ADR captures one decision: its context, the alternatives
considered, the choice made, and the consequences.

ADRs are **append-only**. To change a decision, write a new ADR that
supersedes the old one — never edit a merged ADR's substance. Typo and
formatting fixes are fine.

## Format

Each ADR is a Markdown file named `NNNN-short-slug.md` where `NNNN` is a
zero-padded sequence number. Use [`0000-template.md`](./0000-template.md)
as the starting point.

## Index

| #    | Title                                                       | Status   |
|------|-------------------------------------------------------------|----------|
| 0001 | [Memory tier model](./0001-memory-tier-model.md)            | Accepted |
| 0002 | [Identity model](./0002-identity-model.md)                  | Accepted |
| 0003 | [Trust & safety doctrine](./0003-trust-and-safety-doctrine.md) | Accepted |
| 0004 | [Connectivity model](./0004-connectivity-model.md)          | Accepted |
| 0005 | [Quality bar](./0005-quality-bar.md)                        | Accepted |
| 0006 | [Convergence canon](./0006-convergence-canon.md)            | Accepted |
| 0007 | [Convergence storage](./0007-convergence-storage.md)        | Accepted |

## Statuses

- **Proposed** — under discussion; not yet binding.
- **Accepted** — binding for all new code; existing code migrates over time.
- **Superseded by NNNN** — replaced by a later ADR; kept for history.
- **Deprecated** — no longer applies; not yet replaced.

## Related

- [`VISION.md`](../../VISION.md) — what Sallie is and the phase roadmap.
- [`MERGE_NOTES.md`](../../MERGE_NOTES.md) — how the eight source repos
  were consolidated and which conflicts these ADRs resolve.

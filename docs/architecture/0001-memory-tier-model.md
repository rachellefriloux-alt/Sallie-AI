# 0001 — Memory tier model

- **Status:** Accepted
- **Date:** 2026-04-24
- **Deciders:** Sallie core team
- **Related:** [`VISION.md`](../../VISION.md) §2 (System #2: Memory),
  [`MERGE_NOTES.md`](../../MERGE_NOTES.md), Phase 1.5 in the build plan.

## Context

Three of the source repos define a memory subsystem and they disagree on
the tier taxonomy:

- **Host repo (`Sallie-AI` root, originally from `before/`)** uses a
  `Working` tier as a runtime cache for the in-flight conversation.
- **`legacy/sallie_1.0/`** uses `Procedural` for long-term skill / habit
  memory (how to do things) alongside Episodic and Semantic.
- **`legacy/sallie-project/services/memory/`** is the most complete
  implementation: AES-256-GCM at rest, importance scoring, decay,
  consolidation, seven retrieval strategies, embedding pipeline. It uses
  a hybrid that includes both Procedural and a transient cache.
- **`legacy/Sallie/`** treats memory as "hierarchical" without naming
  fixed tiers, but operates over Episodic + Semantic + Emotional.

`VISION.md` §2 calls memory "Hierarchical: episodic, semantic, emotional,
procedural" — four tiers, but missing the runtime-cache concept and
naming Emotional as a tier rather than a cross-cutting attribute.

We need one canonical tier model that all clients and the brain can
target without ambiguity.

## Decision

We will adopt **four canonical memory tiers**:

1. **Episodic** — time-stamped events ("on Tuesday Sallie said …"). Append-only event log.
2. **Semantic** — facts and concepts decoupled from when they were learned. Vector store (Qdrant).
3. **Procedural** — skills, heuristics, learned routines ("how Sallie greets the user in the morning").
4. **Working** — transient cache for the active session and short-horizon reasoning. Backed by Redis. Not durable.

**Emotion is not a tier.** Affect is a cross-cutting attribute attached to
records in any of the three durable tiers (Episodic / Semantic / Procedural).
This matches the sallie-project model and avoids storing the same event
twice.

**Working is a cache layer over the three durable tiers**, not a separate
store of truth. Anything in Working that should persist is promoted into
Episodic (and possibly Semantic / Procedural via consolidation) by the
Dream Cycle (Phase 5).

**Replication:** local-first by default. Optional encrypted cloud backup
controlled by a per-user flag. Concrete sync protocol is out of scope for
this ADR — see Phase 1.5 design doc.

## Alternatives considered

- **Three tiers (drop Working).** Rejected: forces every short-lived
  reasoning artifact into durable storage, hurts privacy and latency.
- **Five tiers (Episodic + Semantic + Procedural + Working + Emotional).**
  Rejected: Emotional duplicates data already present in the other tiers
  with an `emotion` attribute and complicates retrieval.
- **Hierarchical without fixed tiers (Sallie repo's model).** Rejected:
  cross-client interop requires a fixed schema in `packages/core`.

## Consequences

- **Positive:**
  - Clear contract for `packages/memory-client` and the brain's memory API.
  - Maps cleanly onto the sallie-project implementation, which is the
    most mature and the intended port target for Phase 1.5.
  - Working as a Redis cache enables sub-100ms in-session recall (per
    ADR 0005 quality bar).
- **Negative:**
  - Code in legacy repos that referenced an `Emotional` tier must be
    migrated to attach `emotion` as an attribute. Most of this is in
    `legacy/Sallie/shared/services/memoryService*.ts` and is deferred
    until those modules are promoted out of `legacy/`.
- **Follow-ups:**
  - Define the canonical record schema in `packages/core/memory.ts`
    (Phase 0.6).
  - Implement the four tiers in `services/brain/memory/` (Phase 1.5,
    item 29 of the build plan).
  - Document the consolidation pipeline (Working → Episodic → Semantic /
    Procedural) in the Phase 5 Dream Cycle design.
  - Open ADR for sync/replication protocol when local-first sync work
    starts.

## References

- `legacy/sallie-project/services/memory/` — reference implementation.
- `legacy/sallie_1.0/` Kotlin memory modules.
- `VISION.md` §2 System #2.
- Build plan items 29–32, 50.

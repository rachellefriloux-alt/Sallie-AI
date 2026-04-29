# `@sallie/memory-client`

Client library for the brain's 4-tier memory subsystem
(Episodic / Semantic / Procedural / Working) per
[ADR 0001](../../docs/architecture/0001-memory-tier-model.md).

Wraps the REST + WebSocket memory API exposed by `services/brain` so
that `apps/*` and other clients never talk to memory primitives directly.

## Status

Scaffolded in Phase 0.6. Real implementation lands in Phase 1.5.

## Sources to merge here

Per the build plan, this package is filled in by porting from the
imported repos in `legacy/`. Nothing in `legacy/` is modified — code
is **promoted** out of it into this package.

| Source                                                  | What to take                                          |
|---------------------------------------------------------|-------------------------------------------------------|
| `legacy/sallie-project/services/memory/` (15 enhancements) | AES-256-GCM at rest, importance scoring, decay, consolidation, 7 retrieval strategies, embedding pipeline |
| `legacy/Sallie/backend/` memory microservice            | REST + WebSocket transport, schemas, pub/sub          |
| `legacy/sallie_1.0/` procedural memory                  | Long-term skill memory tier per ADR 0001              |
| Host repo `Working` cache logic                         | Working-tier in-flight context cache (Redis-backed)   |
| `legacy/Sally/` 2 AM Dream Cycle                        | Consolidation hook surface (called by Phase 5 scheduler) |

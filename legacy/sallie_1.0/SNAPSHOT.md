# legacy/sallie_1.0/ — snapshot metadata

**Source:** https://github.com/rachellefriloux-alt/sallie_1.0
**Snapshotted:** 2026-04-24
**Role:** Earlier Vue + Kotlin Android version ("Sallie 2.0 plan"). Source of the original `MANIFESTO.md`, `IMPLEMENTATION_PLAN.md`, `MERGE_SUMMARY.md`, and the persona/values/tone/identity module split.

This is a *read-only* snapshot. Nothing here runs from this folder. Code and
ideas migrate *out* of `legacy/` into the canonical layout
(`apps/`, `services/`, `packages/`) phase by phase, per
[`../../VISION.md`](../../VISION.md). Until that migration completes for
a given module, this snapshot is the authoritative copy of the original
idea.

### What was excluded from this snapshot
- `.git`, `node_modules`, `__pycache__`, `coverage`, `.gradle/caches`
- Gradle wrapper distribution `gradle/` (52 MB, auto-downloadable)
- Signing key (`sallie.keystore`) — secret, must not be committed
- Lockfiles

See [`../../MERGE_NOTES.md`](../../MERGE_NOTES.md) for the full per-repo
import log and what was promoted vs. preserved.

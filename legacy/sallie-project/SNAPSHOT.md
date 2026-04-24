# legacy/sallie-project/ — snapshot metadata

**Source:** https://github.com/rachellefriloux-alt/sallie-project
**Snapshotted:** 2026-04-24
**Role:** Comprehensive Expo / React Native consolidation ("Sallie v3.0", Sept 2025). Its 410 KB README is the most exhaustive product spec across all 8 repos and explicitly consolidates Sallie-AI + sallie_1.0 + before. Cleanest mobile codebase.

This is a *read-only* snapshot. Nothing here runs from this folder. Code and
ideas migrate *out* of `legacy/` into the canonical layout
(`apps/`, `services/`, `packages/`) phase by phase, per
[`../../VISION.md`](../../VISION.md). Until that migration completes for
a given module, this snapshot is the authoritative copy of the original
idea.

### What was excluded from this snapshot
- `.git`, `node_modules`, `coverage` (5.5 MB), `.expo/`
- Lockfiles (`package-lock.json`), logs

See [`../../MERGE_NOTES.md`](../../MERGE_NOTES.md) for the full per-repo
import log and what was promoted vs. preserved.

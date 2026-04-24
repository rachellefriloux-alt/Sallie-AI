# legacy/before/ — snapshot metadata

**Source:** https://github.com/rachellefriloux-alt/before
**Snapshotted:** 2026-04-24
**Role:** Earlier consolidated repo — Vue/Kotlin Android launcher with personality / memory / skills modules. Largely superseded by the host `Sallie-AI` repo (much of its code was promoted directly into the host root).

This is a *read-only* snapshot. Nothing here runs from this folder. Code and
ideas migrate *out* of `legacy/` into the canonical layout
(`apps/`, `services/`, `packages/`) phase by phase, per
[`../../VISION.md`](../../VISION.md). Until that migration completes for
a given module, this snapshot is the authoritative copy of the original
idea.

### What was excluded from this snapshot
- `.git`, `node_modules`, `coverage`, `__pycache__`, `.gradle/caches`, `.next/cache`
- Massive merge artifact tree: `sallie_Sovereugn_unified_complete/` (incl. 55 MB esbuild binary, 12 MB MERGE_MANIFEST.json)
- Replit state: `.local/state/replit/`, `filesystem_state.json` (13 MB)
- Vendored: `src/vendor/_tsc.js` (6 MB)
- Duplicated assets (kept once in host repo): `assets/` (31 MB), `android/src/main/res/` (11 MB Android XML resources, mostly themed launcher icon variants), `apps/android-launcher/` (5 MB duplicate of `android/`+`app/`), `attached_assets/` (Replit upload mirror)
- Sourcemaps (`*.map`), large snapshot tests

See [`../../MERGE_NOTES.md`](../../MERGE_NOTES.md) for the full per-repo
import log and what was promoted vs. preserved.

# legacy/Sally/ — snapshot metadata

**Source:** https://github.com/rachellefriloux-alt/Sally
**Snapshotted:** 2026-04-24
**Role:** Next.js 15 + Expo + Electron monorepo (newest framing). Supabase auth/Postgres + Prisma + Azure OpenAI. 130+ API routes, Genesis Convergence (30 questions), 64 AI capabilities, 5 dashboard archetypes (Empire/Matriarch/Partner/Confidante/Source) + Sanctuary, Ghost system, Mind Map, CopyMind AI, Meli AI.

This is a *read-only* snapshot. Nothing here runs from this folder. Code and
ideas migrate *out* of `legacy/` into the canonical layout
(`apps/`, `services/`, `packages/`) phase by phase, per
[`../../VISION.md`](../../VISION.md). Until that migration completes for
a given module, this snapshot is the authoritative copy of the original
idea.

### What was excluded from this snapshot
- `.git`, `node_modules`, `.next/cache`, `.metro-cache`, `.local/`
- Build artifacts: `.next/server/vendor-chunks/`, large `.pack` files
- `legacy-app/` (Sally's own internal legacy folder of design mockups + duplicated images)
- Lockfiles (`package-lock.json`)

See [`../../MERGE_NOTES.md`](../../MERGE_NOTES.md) for the full per-repo
import log and what was promoted vs. preserved.

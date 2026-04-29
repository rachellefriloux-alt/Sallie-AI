# legacy/Sallie/ — snapshot metadata

**Source:** https://github.com/rachellefriloux-alt/Sallie
**Snapshotted:** 2026-04-24
**Role:** Python + Ollama brain (v5.4.2). Source of the canonical 9 core systems (Limbic, Memory, Monologue, Synthesis, Agency, Dream Cycle, Degradation, Control, Convergence).

This is a *read-only* snapshot. Nothing here runs from this folder. Code and
ideas migrate *out* of `legacy/` into the canonical layout
(`apps/`, `services/`, `packages/`) phase by phase, per
[`../../VISION.md`](../../VISION.md). Until that migration completes for
a given module, this snapshot is the authoritative copy of the original
idea.

### What was excluded from this snapshot
- `.git`, `node_modules`, `__pycache__`, `coverage`, `.next/cache`, `_internal/`
- Binaries: `git-installer.exe` (60 MB), `node-installer.msi` (26 MB)
- Build artifacts: `web/.next/`, `backend/azure-deployment/web-app.zip` (41 MB)
- Design dump folders: `like/themes/`, `like/ui-mockups/`, `here            {                 echo ___BEGIN___COMMAND_OUTPUT_MARKER___;                 PS1=;PS2=;unset HISTFILE;                 EC=0;                 echo ___BEGIN___COMMAND_DONE_MARKER___0;             }            {                 echo ___BEGIN___COMMAND_OUTPUT_MARKER___;                 PS1=;PS2=;unset HISTFILE;                 EC=0;                 echo ___BEGIN___COMMAND_DONE_MARKER___0;             }            {                 echo ___BEGIN___COMMAND_OUTPUT_MARKER___;                 PS1=;PS2=;unset HISTFILE;                 EC=0;                 echo ___BEGIN___COMMAND_DONE_MARKER___0;             }/`
- Lockfiles (`package-lock.json`), logs

See [`../../MERGE_NOTES.md`](../../MERGE_NOTES.md) for the full per-repo
import log and what was promoted vs. preserved.

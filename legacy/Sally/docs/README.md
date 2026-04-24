# Sallie Studio — Documentation Index

**This repo:** Sallie Creative Platform — **Next.js 15 (App Router) at repo root**, Expo (mobile), Electron (desktop), Supabase (auth + Postgres), Prisma (ORM). Single-user personal AI companion. No separate backend required.

**Canonical reference:** [THIS_REPO.md](THIS_REPO.md) — structure, commands, and quick start.  
**Quick start:** [Root README](../README.md). After clone: `npm install`, `npm run setup`, `npm run dev`.

---

## Core Docs

| Doc | Description |
|-----|-------------|
| [THIS_REPO.md](THIS_REPO.md) | Canonical: repo structure, commands, quick start |
| [RUN_THE_APP.md](RUN_THE_APP.md) | How to run web, mobile, and desktop apps |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Deploy web (Vercel/Replit/Azure), mobile, desktop |
| [CROSS_PLATFORM_SETUP.md](CROSS_PLATFORM_SETUP.md) | Step-by-step setup for every platform |
| [AZURE_SUPABASE_CONNECTION.md](AZURE_SUPABASE_CONNECTION.md) | Env vars and setup for Azure + Supabase integration |
| [GAPS_AND_BUGS.md](GAPS_AND_BUGS.md) | Known gaps, bugs, and fixes applied |
| [DEPRECATIONS_AND_UPDATES.md](DEPRECATIONS_AND_UPDATES.md) | Deprecations, upgrade notes, migration checklist |

---

## API

| Doc | Description |
|-----|-------------|
| [api/API_DOCUMENTATION.md](api/API_DOCUMENTATION.md) | Complete API reference — all 159 Next.js API routes |
| [api/API_REFERENCE.md](api/API_REFERENCE.md) | Quick endpoint listing and data models |

---

## Deprecated / Legacy

The following directories and patterns are **no longer part of the active app**:

- `services/` — Old microservices backend (16 Node.js services). Not used.
- `reference/` — Old backend reference code. Not used.
- `azure/` — Old Azure Container Apps deployment scripts. The web app now deploys as a single Next.js app (Vercel, Replit, or Azure App Service).
- `components/` (root level) — Legacy components. All active components are in `src/components/`.
- `packages/` — Unused packages.
- Any doc that mentions `cd web`, `start-sallie`, `python -m uvicorn`, Docker Compose, or a `web/` folder describes an older layout that does not apply.

For how **this** repo works, see [THIS_REPO.md](THIS_REPO.md) and the [root README](../README.md).

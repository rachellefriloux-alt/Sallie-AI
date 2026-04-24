# This Repo — Canonical Reference

Use this as the single source of truth for how **this** repository is structured and run.

---

## Stack

| Layer | Technology |
|-------|------------|
| **Web** | Next.js 15 (App Router) at **repo root** |
| **Mobile** | Expo (React Native) in `mobile/` |
| **Desktop** | Electron in `desktop/` (loads web app URL) |
| **Auth & DB** | Supabase (auth + Postgres), Prisma 6 (ORM) |
| **AI** | Azure OpenAI / OpenAI / Ollama (local) via `/api/chat` |
| **Voice** | Azure Speech Services (STT/TTS) |
| **Styling** | Tailwind CSS 3, Radix UI, Framer Motion, Lucide icons |

There is **no `web/` subfolder**. The Next.js app lives at the repository root. There is **no Python backend, no FastAPI, no Docker Compose, no microservices** required to run the app.

---

## Structure

```
<repo root>/
├── src/                 # Next.js app source
│   ├── app/             # Routes + 159 API routes
│   │   ├── api/         # All backend endpoints
│   │   ├── dashboard/   # Main dashboard
│   │   ├── growth/      # Personal growth tracking
│   │   ├── life-management/  # Life management
│   │   ├── convergence/ # Genesis convergence flow
│   │   ├── mind-map/    # Visual mind map canvas
│   │   ├── copy-mind/   # AI copywriting
│   │   ├── meli-ai/     # AI content workflows
│   │   ├── integrations/# Service integrations
│   │   ├── settings/    # App settings
│   │   └── ...          # 30+ page routes
│   ├── components/      # All active UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Supabase, Prisma, config, utilities
│   └── types/           # TypeScript type definitions
├── mobile/              # Expo/React Native app
├── desktop/             # Electron wrapper
├── prisma/              # Prisma schema
│   └── schema.prisma
├── supabase/            # Supabase migrations
├── public/              # Static assets
├── docs/                # Documentation
├── scripts/             # Setup and deploy scripts
├── package.json         # Root = Next.js app
├── next.config.mjs      # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── .env.example         # Environment variable template
```

---

## Commands (from repo root)

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run setup` | Create `.env.local` from `.env.example` if missing; generate Prisma client |
| `npm run dev` | Start Next.js dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Run production server (after `build`) |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |
| `npm run check-env` | Verify required env vars |
| `npm run prepare-deploy` | Run `check-env` then `build` |
| `npm run zip-standalone` | Build standalone folder for deployment |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push Prisma schema to DB |
| `npm run prisma:pull` | Pull DB schema into Prisma |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run db:push` | Apply Supabase SQL migrations |
| `npm run mobile:start` | Start Expo from `mobile/` |
| `npm run desktop:dev` | Start desktop app in dev mode |
| `npm run desktop:build` | Build desktop app |
| `npm run desktop:assets` | Generate desktop app icons |

---

## Quick start

1. `cp .env.example .env.local` (or run `npm run setup`).
2. Edit `.env.local`: set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`), `DATABASE_URL`, `DIRECT_URL`.
3. `npm install` then `npm run setup` then `npm run dev`.
4. Open http://localhost:3000.
5. Create **avatars** bucket in Supabase Storage if needed (see root README).

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes* | Supabase anon/public key |
| `DATABASE_URL` | Yes | Prisma connection string (pooled, port 6543) |
| `DIRECT_URL` | Yes | Prisma direct connection (port 5432) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Server-side Supabase admin |
| `AZURE_OPENAI_API_KEY` | No | Azure OpenAI for chat |
| `AZURE_OPENAI_RESOURCE` | No | Azure OpenAI resource name |
| `AZURE_OPENAI_DEPLOYMENT` | No | Azure OpenAI deployment name |
| `OPENAI_API_KEY` | No | OpenAI API key (fallback) |
| `AZURE_SPEECH_SERVICES_KEY` | No | Azure Speech for STT/TTS |
| `OLLAMA_URL` | No | Local Ollama endpoint |

*Or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`.

See `.env.example` for the full list.

---

## What's NOT in this repo (deprecated)

The following exist in the repo tree but are **not used** by the running app:

- `services/` — Old microservices backend (16 services). Replaced by Next.js API routes.
- `reference/` — Old backend reference code.
- `components/` (root level) — Legacy; active components are in `src/components/`.
- `packages/` — Unused npm packages.
- `azure/` — Old Azure Container Apps deployment (replaced by single-app deploy).
- Docker-related files — Not needed; the app runs as a standard Next.js app.

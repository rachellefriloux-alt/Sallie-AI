# Sallie — Production Roadmap

Single-user personal deployment. This document tracks what is done and what remains for a production-ready run.

---

## Completed

### Auth & core
- **Auth**: Supabase Auth (magic link), middleware protection, redirects
- **Database**: Prisma + Supabase Postgres (schema, migrations)
- **Chat**: `/api/chat` — Ollama → Azure OpenAI → OpenAI (priority order)
- **Error handling**: `error.tsx`, `not-found.tsx`, `loading.tsx`
- **Health**: `/api/health` for load balancers and monitoring

### User & profile
- **Profile API**: `/api/user/profile` (GET, PATCH/PUT), `/api/user/stats` (with real session duration)
- **Avatar**: `/api/user/avatar` (POST) — Supabase Storage bucket `avatars`, 5MB, image types
- **Export**: `/api/user/export` (GET) — JSON or TXT (conversations, profile, heritage)
- **Account deletion**: `/api/user/delete` (DELETE) — Prisma + Storage cleanup + Supabase Auth (requires `SUPABASE_SERVICE_ROLE_KEY`)

### Features & API
- **Features**: `/api/features`, `/api/features/[id]/toggle`
- **Heritage**: `/api/heritage/version/current` — versions from `heritage_dna` and profile
- **Omnis**: Knowledge-base and statistics use Prisma; failures logged

### Security
- **Headers** (Next.js): `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- **Service role**: Used only server-side in `src/lib/supabase/admin.ts` for account deletion

### Design & UX
- Lucide icons on web homepage; card hover, spacing, typography
- Peacock/Leopard heritage theme, design tokens, Geist fonts

### Platforms
- **Web**: Next.js 15, App Router, all core pages
- **Mobile**: Expo app — tabs (Home, Chat, Features, Profile), auth, `EXPO_PUBLIC_API_URL` for backend
- **Desktop**: Electron wrapper — dev: localhost:3000; prod: `SALLIE_APP_URL` (deployed web URL)
- **Azure**: OpenAI + Speech provisioned; deploy scripts in `azure/deploy/`

### Scripts & tooling
- **setup**: Create `.env.local` from `.env.example` if missing; Prisma generate
- **check-env**: Validate required env (exits 1 if missing)
- **prepare-deploy**: check-env + build; prints Docker/Azure/Vercel next steps
- **zip-standalone**: Build + prepare standalone folder; prints zip/upload commands for Azure
- **Env validation**: `src/instrumentation.ts` logs missing required vars in production

---

## Before production (single-user)

1. **Database**
   - Set `DATABASE_URL` and `DIRECT_URL` in `.env.local` (Supabase → Settings → Database).
   - Run `npm run prisma:generate` and `npm run prisma:push` (Prisma schema). For Supabase SQL migrations use `npm run db:push`.

2. **Supabase Storage**
   - Create bucket **avatars** (Dashboard → Storage): public, 5MB limit, MIME types `image/jpeg`, `image/png`, `image/gif`, `image/webp`.

3. **Account deletion (optional)**
   - Set `SUPABASE_SERVICE_ROLE_KEY` in env if you want in-app account deletion.

4. **Secrets**
   - Keep secrets in env (or Azure Key Vault / Vercel env); never commit. `SUPABASE_SERVICE_ROLE_KEY` must stay server-only.

---

## Optional enhancements

- **Rate limiting**: e.g. `@upstash/ratelimit` on `/api/chat` and other write APIs.
- **Monitoring**: Application Insights, Vercel Analytics, or error tracking (Sentry).
- **Tests**: Vitest/Jest for `/api/chat` and sallie-chat-core; Playwright for auth and chat flows.
- **Mobile**: Set `EXPO_PUBLIC_API_URL` to your deployed Next.js URL; EAS Build for iOS/Android.
- **Desktop**: Set `SALLIE_APP_URL` when building so the packaged app loads your deployed URL.

---

## Deployment

| Target | Use case |
|--------|----------|
| **Vercel** | Connect repo, set env vars. `/api/*` run as serverless. |
| **Azure App Service** | Node 20 LTS; deploy built Next.js (no static export). See `azure/deploy/` and Dockerfile. |
| **Docker** | `docker build -t sallie-web .` then run; suitable for Azure Container Apps or any host. |

Static Web Apps only serves a static export; this app uses API routes, so use App Service or Docker for full functionality.

---

## Deployment (pro)

**Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** for the full sequence: Azure Web App (standalone zip or GitHub Actions), mobile EAS/build with `EXPO_PUBLIC_API_URL`, desktop build with `SALLIE_APP_URL`, and post-deploy checks.

## Recommended order (local)

1. `npm run setup` — creates `.env.local` from `.env.example` if missing, runs Prisma generate.
2. Set `DATABASE_URL` and `DIRECT_URL` in `.env.local` (Supabase → Settings → Database), then `npm run prisma:push` or `npm run db:push`.
3. Create `avatars` bucket in Supabase (Dashboard → Storage).
4. `npm run check-env` — verify required env; then `npm run build` and `npm run start` locally, or `npm run prepare-deploy` before Docker/Azure/Vercel. For Azure App Service zip deploy: `npm run zip-standalone` then follow the printed zip/upload commands.
5. Set `EXPO_PUBLIC_API_URL` (mobile) and `SALLIE_APP_URL` (desktop build) to the deployed URL.

---

## Completion checklist (this repo)

| Requirement | Status |
|-------------|--------|
| No stubs; avatar required | Done — full Supabase Storage avatar upload, profile update |
| No TODOs / optional code paths | Done — real implementations; optional only in docs (rate limit, tests) |
| User API complete | Done — profile, stats, avatar, export, delete (with service role for delete) |
| Security headers | Done — next.config.mjs (X-Frame-Options, etc.) |
| Env validation | Done — instrumentation.ts (production); check-env.js (CLI) |
| Scripts: setup, check-env, prepare-deploy, zip-standalone | Done — package.json + scripts/ |
| Desktop: production URL, forge fix | Done — SALLIE_APP_URL in main.js; @electron-forge/maker-deb |
| Azure deploy | Done — Dockerfile, standalone output, deploy-web.sh from repo root, docs |
| Docs align with repo | Done — THIS_REPO.md, docs/README index, roadmap, README |
| Single-user / personal | Done — README and roadmap state single-user |
| Container for desktop | Done — Electron (desktop); mobile = Expo (standalone app) |
| Deploy web on Azure | Done — App Service / Docker docs and scripts; zip-standalone for zip deploy |

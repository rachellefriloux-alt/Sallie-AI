# Deprecations and Updates

Tracks deprecated patterns, required updates, and migration notes for Sallie Studio.

---

## Deprecated — Do Not Use

### Old Microservices Backend

The `services/` directory contains 16 old Node.js microservices (agency-service, ai-service, analytics-service, auth-service, chat-service, communication-service, convergence-service, file-service, genesis-flow-service, heritage-service, limbic-engine, memory-service, notification-service, omnis-service, sensor-array-service, websocket-service). These are **fully replaced** by 159 Next.js API routes under `src/app/api/`. Do not use, reference, or maintain the old services.

### Old Backend Reference Code

The `reference/` directory contains old backend reference implementations. These are not used by the running app.

### Old Azure Container Apps Deployment

The `azure/` directory contains scripts for deploying as Azure Container Apps with Docker Compose. The app now deploys as a **single Next.js application** (Vercel, Replit, or Azure App Service). Docker Compose is not needed.

### Root-level `components/`

Legacy components directory. All active components are in `src/components/`. The root `components/` directory is excluded from TypeScript checking.

### FastAPI / Python Backend

No Python backend exists or is needed. All API routes are Next.js App Router routes.

### Docker / Docker Compose

`Dockerfile` and `docker-compose.yml` at root level are not needed for standard deployment. The app runs as a standard Next.js app.

### Old Deployment Scripts

Scripts like `deploy.sh`, `deploy-vercel.bat`, `setup-deployment.bat`, `setup-sallie.sh`, `setup-azure.sh`, `startup.sh`, and PowerShell scripts at root level are legacy. Use `npm run build` and your platform's deploy method.

---

## Current Stack (Up to Date)

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 15 | App Router |
| React | 19 | |
| TypeScript | 5 | |
| Tailwind CSS | 3 | |
| Prisma | 6 | ORM for Supabase Postgres |
| Supabase SSR | 0.5.x | `createServerClient` / `createBrowserClient` with `getAll` / `setAll` cookie API |
| Supabase JS | 2.x | |
| Vitest | 2.x | Testing |
| Lucide React | Latest | Primary icon set |

### Patterns in Use

- **Supabase SSR**: `createServerClient` / `createBrowserClient` with `getAll` / `setAll` cookie API.
- **Next.js 15**: Async `cookies()` from `next/headers` in routes and server components.
- **Prisma**: Scripts use `node node_modules/prisma/build/index.js` for cross-platform compatibility.
- **Lucide React**: Primary icon set; some Heroicons remain where components predate migration.

### Notes

- **Supabase `getUser()` vs `getClaims()`**: Middleware uses `getUser()`. Consider `getClaims()` for fewer round-trips when Supabase recommends it.
- **Supabase `getSession()`**: Do not use in server code; not guaranteed to revalidate. Use `getUser()`.

---

## Recommended Upgrades (Non-urgent)

| Package | Current | Notes |
|---------|---------|-------|
| Prisma | 6.x | 7.x is a major upgrade; follow official migration guide |
| eslint-config-next | 15.x | Keep in sync with Next.js major version |
| @heroicons/react | 2.x | Migrate remaining uses to Lucide React |

---

## Migration Checklist

- [ ] Run `npm audit` and address critical/high issues
- [ ] Consider migrating middleware to `getClaims()` when supported
- [ ] Standardize on Lucide; migrate remaining Heroicons
- [ ] Move deprecated directories to `remove/` (see T005 in session plan)

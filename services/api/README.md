# services/api/ — Node / TypeScript backend

**Canonical home for:** the API gateway / backend that the apps talk to
(JWT auth, REST routes, integrations).

**Current implementation:** lives at the repo root in `server/` (Express +
TypeScript). Migration into this folder happens phase-by-phase.

### Sources to merge here
| Source                              | What to take                                  |
|-------------------------------------|-----------------------------------------------|
| Root `server/`                      | Existing host Express/TS API                  |
| `legacy/Sally/src/app/api/`         | 130+ Next.js API routes, Supabase + Prisma    |
| `legacy/app/backend/`               | FastAPI route shapes (translate to Node)      |
| `legacy/Sallie/server/`             | Brain-facing endpoints                        |

### Build (today)
Use the existing root scripts.

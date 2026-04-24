# apps/web/ — Web app (PWA / desktop browser surface)

**Canonical home for:** Sallie's web body. Per VISION.md, this is the
desktop-first browser PWA companion to `apps/mobile/`.

**Current implementation:** the existing root-level Vue/Vite app
(`App.vue`, `vite.config.ts`, `index.html`, `ui/`) and the React frontend
that lives in `legacy/app/frontend/`. Migration into this folder happens
phase-by-phase.

### Sources to merge here (in priority order)
| Source                              | What to take                                   |
|-------------------------------------|------------------------------------------------|
| Root `App.vue`, `ui/`, `vite.*`     | Existing Vue/Vite implementation               |
| `legacy/Sally/src/app/`             | Next.js 15 App Router, 130+ API routes, dashboard archetypes |
| `legacy/app/frontend/`              | React UI patterns                              |
| `legacy/Sallie/web/`                | Web client to the Python brain                 |

### Build (today)
Use the existing root scripts (`npm run dev` for Vite).

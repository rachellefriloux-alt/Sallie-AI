# apps/mobile/ — Expo / React Native phone app

**Canonical home for:** Sallie's mobile body (the phone surface).

**Current implementation:** lives at the repo root (`App.tsx`, `app.json`,
`metro.config.js`, `app/`, `screens/`, `hooks/`, `contexts/`, `components/`)
plus the legacy/ snapshots below. Migration into this folder happens
phase-by-phase per [`../../VISION.md`](../../VISION.md) §4.

### Sources to merge here (in priority order)
| Source                                              | What to take                                    |
|-----------------------------------------------------|-------------------------------------------------|
| `legacy/sallie-project/`                            | Cleanest RN/Expo screens, navigation, theming   |
| `legacy/app/frontend/`                              | Life Partner role dashboards, Decider, Reflections, Shoulder Taps |
| `legacy/Sallie/mobile/`                             | Mobile-side hooks into the Python brain         |
| Root `App.tsx`, `screens/`, `app/`                  | Existing host implementation                    |

### Build (today)
Use the existing root scripts (`npm start`, `npm run android`, `expo start`)
until physical migration completes.

# apps/mobile

Sallie's "body" — the Expo React Native phone app.

## Where the code actually lives

The canonical mobile app **lives at the repo root** (not in this folder)
because it uses `expo-router`, which resolves screens by absolute path
from the project root. Moving everything under `apps/mobile/` would
require rewriting every relative import and reconfiguring native iOS /
Android projects for no functional gain.

So the mobile app is:

| What | Where |
|---|---|
| Entry & config | `/package.json`, `/App.tsx`, `/app.json`, `/tsconfig.json` |
| Routes (Expo Router) | `/app/_layout.tsx`, `/app/(drawer)/`, `/app/(tabs)/`, `/app/(onboarding)/` |
| UI components | `/components/` |
| State | `/store/`, `/contexts/` |
| Brain HTTP client | `/lib/brain.ts` |
| Native shells | `/android/`, `/ios/` |

## Phase 2 additions (this PR)

- **`/lib/brain.ts`** — typed HTTP client for `services/brain`. Defaults
  to `http://10.0.2.2:8000` on Android emulator (host loopback) and
  `http://localhost:8000` elsewhere. Override with the
  `EXPO_PUBLIC_BRAIN_URL` env var or `setBrainBaseUrl()` at runtime.
- **`/app/(drawer)/brain-status.tsx`** — drawer screen showing live
  brain liveness, readiness, and per-system status. First real
  phone↔brain round-trip.

## What's still here

This folder will collect things that are *truly* mobile-app-specific
but don't belong in the root tree — for example:
- Native module configuration helpers
- Mobile-only build scripts
- Migration guides for the eventual root → `apps/mobile/` move (only
  worthwhile once the legacy Sallie-AI tree is fully cleaned up)

## Predecessor

A snapshot of the old `sallie-project/` (separate React Native repo
that explored the carousel/AppDrawer UI) lives at
`legacy/sallie-project/`. Pieces from it merge into the root tree
opportunistically as the UI evolves.

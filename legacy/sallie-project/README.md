# legacy/sallie-project/

**Source:** https://github.com/rachellefriloux-alt/sallie-project (branch `main`)
**Snapshotted:** 2026-04-22

Read-only snapshot of the predecessor `sallie-project/` (React Native +
react-native-web). Excluded: `coverage/` (5.5 MB), `node_modules/`,
`package-lock.json`, logs.

### Where its pieces are going
| Source | Destination | Phase |
|---|---|---|
| `App.tsx` (CircularCarousel, AIAssistantBar, AppDrawer) | merged into existing `apps/mobile/` (repo root) | 2 / future UI polish |
| `src/core/` | merged into `packages/personality/`, `packages/memory/` | 4 |
| `app/index.tsx`, `app/_layout.tsx` (Expo Router) | reference for `apps/mobile/` routing | 2 |
| `android/`, `ios/` native shells | reference; current root project owns native builds | — |
| `docs/` | promoted to `docs/legacy_specs/sallie-project/` | 2 |

### Why the body lives at the repo root, not `apps/mobile/`
The Sallie-AI repo root *is* the canonical Expo React Native app
(`expo-router`, full `package.json`, `app/(drawer)`, `app/(tabs)`,
`app/(onboarding)`). Moving it would require rewriting every relative
import and breaking expo-router's path resolution for no functional
gain. `apps/mobile/` documents this and points back to the root.

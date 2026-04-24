# packages/ui/ — Shared UI components

**Canonical home for:** UI components that work across mobile, web, and
desktop surfaces.

**Current implementation:** mixed across root `components/`, `ui/`, and the
existing files in this folder. Migration happens phase-by-phase.

### Sources to merge here
| Source                              | What to take                                  |
|-------------------------------------|-----------------------------------------------|
| Root `ui/components/`, `components/`| Existing host UI                              |
| `legacy/sallie-project/src/components/` | Cleanest RN component set                 |
| `legacy/Sally/src/components/`      | Tailwind + Radix + Framer Motion components   |
| `legacy/sallie_1.0/ui/`             | Original Vue 3 visual layer                   |

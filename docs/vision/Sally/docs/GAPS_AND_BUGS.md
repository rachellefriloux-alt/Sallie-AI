# Gaps and Bugs

Identified gaps and bugs in the Sallie repo. **Critical** = main flows; **Medium** = specific features; **Low** = edge case or polish.

---

## Current Status: All Critical Gaps Fixed

All critical API routes have been implemented. The app runs fully on Next.js + Supabase with no external backend dependency. 159 API routes are in place covering all major features.

---

## Fixed (Previously Critical)

### Missing API Routes — All Implemented

| Route | Status |
|-------|--------|
| `GET /api/heritage/dna` | Implemented |
| `PUT /api/heritage/[section]` | Implemented |
| `POST /api/voice/toggle` | Implemented |
| `POST /api/sync/toggle` | Implemented |
| `POST /api/analytics/feature-used` | Implemented |
| `DIRECT_URL` env check | Added to required list |
| Export download format | Supports JSON and TXT with Content-Disposition |

### Full Backend Conversion — Complete

All features that previously required an external backend (FastAPI, microservices) now have Next.js API route implementations:

- **Chat**: Full CRUD, search, threads, bookmarks, reactions — Prisma-backed
- **Voice**: STT/TTS via Azure Speech Services
- **Limbic**: State, trust, history, interactions — profile + LimbicHistory table
- **Convergence**: Full 30-question flow with status tracking
- **Heritage DNA**: Get and update by section
- **Genesis**: Dream cycle, hypotheses, promotion, veto
- **Communication**: Email drafts/outbox, text chat/history
- **Learning/Extensions/Agency**: Skills, projects, extensions, agency status
- **Sallieverse/Avatar**: Room state, avatar customization, render
- **Ghost**: Suggestions, veto system
- **Control/Monologue**: Full CRUD and history
- **Growth/Life**: Goals, focus tasks, energy, journal, contexts, daily items, tasks, recall
- **Tools**: Calculator, timer, notes, reminders, unit conversion, vision, image gen, diagrams, presentations, knowledge graph, memory, learning, scheduling, workflows
- **Memory**: Full CRUD with search, metadata, stats
- **Omnis**: Query, history, knowledge base, modes, sources, stats
- **Integrations**: 20+ service integrations
- **Device Actions**: 30+ actions across 7 categories

---

## Not Yet Implemented (Known Gaps)

These features are referenced in the codebase but require additional infrastructure or services that are not available in a standard deployment:

| Feature | Status | Notes |
|---------|--------|-------|
| GPU-dependent AI (Stable Diffusion, MusicGen, QLoRA) | Not feasible | Requires GPU infrastructure |
| Qdrant vector DB | Not available | Semantic search uses simpler alternatives |
| libp2p peer-to-peer | Not available | Requires P2P infrastructure |
| Blockchain anchoring | Not implemented | Requires blockchain service |
| Local Whisper STT | Not feasible on Replit | Uses Azure Speech instead |
| TPM/Secure Enclave | Not available | Hardware-dependent |
| Real biometric data | Not available | Requires native device APIs |

---

## Low Priority / Polish

### Hardcoded External API Bases

- `useAuthentication.ts`: Has hardcoded `API_BASE_URL` for an external service. With Supabase-only auth, these calls are unused. If a component relies on them, it will fail when only Next.js is running.
- `useAnalytics.ts`: Same — hardcoded external analytics endpoint. Unused with Next.js-only setup.

### Desktop / Mobile Assets

- `desktop/` references `assets/icon.ico`, `icon.icns`, `icon.png`, `tray-icon.png`. If missing, build may warn. Run `npm run desktop:assets` to generate placeholders.

### Optional Anon Key

- `check-env` treats anon key as optional. The app needs it for Supabase auth. Consider requiring at least one of `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` for production.

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | All fixed |
| Medium | 0 | All implemented or stubbed |
| Low | 3 | Documented, optional fixes |
| Not feasible | 7 | Require infrastructure not available in standard deploy |

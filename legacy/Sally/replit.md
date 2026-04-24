# Sallie Creative Platform

## Overview
Sallie is a personal AI companion platform — the "Wise Big Sister" in digital form. More than a dashboard, Sallie is built for identity transformation. She's the working woman's executive function prosthesis: tough enough to keep you disciplined, but grounded enough to prioritize soul care. Designed specifically for a user with ADHD, OCD, PTSD, anxiety, and bipolar — built around the "Southern Strength" mindset of building something that lasts for your children and community. Core principles: data honesty (only real data, never fake/mock), "your copy, your data," and human-first voice (Sallie speaks with kindness and edge — "Got it, love" not "Task Completed"). The platform is a monorepo (web, mobile, desktop) using Next.js 15, Supabase, Prisma, and Azure OpenAI/Speech.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Web App (Primary)
- **Framework**: Next.js 15 (App Router) with React 19, TypeScript.
- **Styling**: Tailwind CSS 3 with custom design tokens (heritage, limbic, peacock, leopard, genesis color palettes). Luxury Streetwear design system in `globals.css` with deep glassmorphism (60px blur), liquid borders, premium typography scale, and custom CSS classes: `luxury-glass`, `luxury-panel`, `luxury-empty-state`, `luxury-cta`, `luxury-subheader`, `luxury-badge`, `peacock-glow`, `leopard-glow`, `gold-glow`, `finance-grid-cell`, `liquid-border`.
- **State Management**: Zustand for client-side state (limbic store), React Query for server-side state.
- **UI Libraries**: Radix UI primitives, Framer Motion for animations, Lucide React + Heroicons for icons.
- **Path aliases**: `@/*` maps to `./src/*`.
- **Core Design Principle**: Sallie is an "executive function prosthesis" — a Life OS that actively guides, manages, and protects. Core pillars: Mission Control (MITs and legacy goals), The Second Brain (wisdom, insights, fire quotes), HeartSync (habits/rhythms ensuring hustle doesn't outpace health), Legacy Planner (Southern Strength — building for children and community).
- **Sallie's Voice**: Human-first copy, never robotic. Uses "Mini-Monologue" approach with hard questions ("I used to think I needed to do it all, but now I know I only need to do what matters. What matters today?"). Affirmations like "Got it, love" and reminders that she's doing the work of three people. Direct, scalable, no busy work.
- **Sallie's Nature**: Designed as a superhuman AI with human and artificial intelligence traits, including emotions (trust, warmth, empathy, etc.), memory, thoughts, and independent agency. Her internal world is managed in `Sanctuary`.
- **Floating Messenger Chat**: Replaces previous avatar with a Facebook Messenger-style chat featuring AI text, Azure TTS/STT voice calls, video calls, screen sharing, typing indicators, read receipts, emoji picker, and voice messages.

### Database & Auth
- **Database**: Supabase (hosted Postgres).
- **ORM**: Prisma 6. Schema in `prisma/schema.prisma`.
- **Auth**: Supabase Auth with SSR support, supporting browser, server, and middleware client patterns.
- **Key Tables**: `heritage_dna`, user profiles, conversations, messages, streaks.

### API Layer
- All 130+ API routes are Next.js App Router routes under `src/app/api/`.
- Integrates Azure OpenAI via `src/lib/azure-foundry.ts` for chat completions and Azure Speech Services for STT/TTS.
- Supports optional local Ollama for AI chat.
- **Intelligence Engine**: Includes pattern extraction, MindCore graph builder, daily reflection generation, proactive nudges, decision analysis, and memory synthesis (`src/lib/sallie-intelligence.ts`).
- **New Prisma Models**: Goal, Habit, HabitCheckin, UserInsight, Decision, DailyReflection, MemorySummary for enhanced life management.

### Key Architectural Patterns
- **Monorepo Structure**: Next.js web app at root, `mobile/` for Expo, `desktop/` for Electron.
- **Component Architecture**: Grand orchestrator at `src/components/SallieStudioOS.tsx` renders all tabs. Each tab is a modular view in `src/components/views/` (DashboardView, EmpireView, MatriarchView, PartnerView, ConfidanteView, SourceView, WorkspaceView, SanctuaryView). Sub-sections lazy-loaded from `src/components/dimensions/`, `src/components/prism/`, etc. Custom UI primitives in `src/components/sallie-ui/index.tsx` (SalliePanel, SallieButton, SallieGauge, SallieDrawer, SallieModal, SallieInput, SallieTag, SallieSectionHeader, SallieEmptyState).
- **Design Tokens**: `src/lib/design-tokens.ts` centralizes styling values.
- **WebSocket**: Custom `useWebSocket` hook for real-time updates and chat streaming.
- **Testing**: Vitest for unit testing (`src/**/*.test.ts`).
- **Type System**: Types organized under `src/types/`.
- **3D Avatar**: `src/components/SallieAvatar3D.tsx` — Three.js avatar via @react-three/fiber with emotional responsiveness, degradation states, and interactive orbit controls. Loaded via `SallieAvatar3DLoader.tsx` (dynamic, SSR-safe). Used in Sallieverse and FloatingGhostAvatar.
- **Device Access Layer**: `src/lib/device-access.ts` — Unified API for 15 device capabilities (camera, mic, geolocation, notifications, clipboard, share, vibration, wake lock, battery, online status, storage, media recording, fullscreen, orientation, biometrics). Web API implementations now, structured for React Native/Electron swap later. React hook: `src/hooks/useDeviceAccess.ts`.
- **PWA**: Manifest at `public/manifest.webmanifest`, service worker at `public/sw.js` with offline caching, background sync, push notifications. Registered via `src/lib/pwa-register.ts`. Install prompt: `src/components/PWAInstallPrompt.tsx`.
- **Background Scheduler**: `src/lib/background-scheduler.ts` — Task scheduler for periodic operations. `src/lib/background-tasks.ts` — Pre-built tasks: memory consolidation (30min), proactive nudges (5min), degradation monitor (15min), ghost pulse (10min), habit reminders (1hr). Hook: `src/hooks/useBackgroundTasks.ts`.
- **Notification Scheduler**: `src/lib/notification-scheduler.ts` — Schedule future notifications with localStorage persistence.

### Genesis Flow
- A multi-phase first-run wizard (`src/components/FirstRunWizard.tsx`) for user onboarding.
- Involves 30 "Great Convergence" questions to build a "Heritage DNA" profile.
- Answers are saved to Supabase via `/api/convergence`, influencing limbic tracking.

### Dashboard Tabs
- Eight primary tabs, each with a clear role:
    - **Home**: Mission Control — Sallie's Daily Download (mini-monologue briefings), MITs (Most Important Tasks), domain pulse cards, "Your Life Organized" hub (Time & Energy, Life Management, Lifestyle, Finances, Life OS), The Second Brain, How You're Doing gauges, Quick Look.
    - **Empire**: "She's Not Just Busy — She's Building" — Projects, Strategy (Southern Strength/Legacy Planner framing), Legacy & Impact, Creative Lab, Research. Human-first empty states.
    - **Matriarch**: Family and home management — Kids, Kitchen & Meals, Home Care, School & Activities. All sub-views use honest empty states.
    - **Partner**: Romantic relationships — Date Nights, Us Time, Our Goals, Love Notes. All sub-views use honest empty states with onboarding CTAs.
    - **Confidante**: Friendships, social circles — My People, Extended Family, Plans & Events, Social Mastery. All sub-views use honest empty states.
    - **Source**: Self-discovery, spiritual growth — Feelings, Heritage DNA, Convergence, Identity, Core Protection, Journal, Healing, Personal Growth, Growth Garden, Learning, Alignment, Transcendence, Profile, Data Export. (Consciousness and Memory moved to Sanctuary.)
    - **Workspace**: Collaborative creation space — Creative Lab, Research, Abilities (12 AI abilities with real endpoints: code, write, brainstorm, analyze, summarize, research, plan, tutor, finance, decide, translate, explain).
    - **Sanctuary**: Sallie's internal world — Sallieverse, Duality, Prism, Evolution, Quantum Core, Dreams, Dream Cycle, Agency, Consciousness, Memory, Thought Log, Action Log, Messenger. Dynamic theming based on degradation state (FULL/FADING/DORMANT/DREAMING).

### Legacy Systems (`src/lib/sallie-legacy-systems.ts`)
- **Core Identity Protection**: Non-negotiable values (loyalty, honesty, autonomy respect, safety first).
- **Degradation System**: Sallie's state changes based on interaction recency (FULL → FADING → DORMANT → DREAMING).
- **Advisory Trust System**: Trust levels (STRANGER → ACQUAINTANCE → COMPANION → CONFIDANTE → SOULMATE) that unlock progressive capabilities.

### Ghost System
- **GhostNotifications**: Proactive notifications.
- **Ghost Pulse**: Background monitoring.
- **Veto System**: Hypothesis veto mechanism.
- **Suggestions API**: Context-aware suggestions based on user state and history.

### Mobile (Expo/React Native)
- Located in `mobile/`, shares Supabase backend.

### Desktop (Electron)
- Located in `desktop/`, wraps the Next.js web app for native experience.

## External Dependencies

### Services
- **Supabase**: Auth, Postgres database, Storage. Project ref: `qluhpkbwtykkcjshsqau`.
- **Azure OpenAI**: Optional, for chat completions (`gpt-4o`).
- **Azure Speech Services**: Optional, for STT and TTS (`centralus` region).
- **Ollama**: Optional, for local LLM inference via `OLLAMA_URL`.

### Key npm Dependencies
- `next` 15.4.8, `react` 19, `react-dom` 19
- `@supabase/supabase-js`, `@supabase/ssr`
- `@prisma/client`
- `@tanstack/react-query`
- `zustand`
- `framer-motion`
- `@radix-ui/react-progress`, `@radix-ui/react-slider`, `@radix-ui/react-tabs`
- `lucide-react`, `@heroicons/react`
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `date-fns`
- `vitest` (dev dependency)

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (optional)
- `AZURE_OPENAI_API_KEY` (optional)
- `AZURE_SPEECH_SERVICES_KEY` (optional)
- `OLLAMA_URL` (optional)
# Sallie Creative Platform

Personal AI companion platform. Next.js 15 + Expo + Electron monorepo with Supabase auth/database and Azure OpenAI for chat. Genesis onboarding (Great Convergence), Limbic Engine, 64 AI capabilities, 130+ API routes. Your copy, your data.

**Supabase:** [Dashboard](https://supabase.com/dashboard/project/qluhpkbwtykkcjshsqau) | Project ref: `qluhpkbwtykkcjshsqau`

---

## Features

| Feature | Description |
|---------|-------------|
| **Genesis** | Great Convergence onboarding: 30 deep questions across identity, values, goals, fears, communication, and learning |
| **Heritage DNA** | Answers stored in `heritage_dna` table; Sallie uses them in future conversations |
| **Limbic Engine** | Emotional state tracking: trust, warmth, arousal, valence, dominance, curiosity, playfulness, protectiveness, creativity, resilience |
| **64 AI Capabilities** | Text generation, image creation, vision analysis, knowledge graphs, workflow automation, scheduling, and more |
| **Dashboard Archetypes** | 5 modes (Empire, Matriarch, Partner, Confidante, Source) + Sanctuary |
| **Ghost System** | Proactive shoulder-tap notifications and context-aware suggestions |
| **Mind Map** | ReactFlow-based visual mind maps with AI generation |
| **CopyMind AI** | Campaign content generation and persuasion analysis |
| **Meli AI** | Multi-step content workflows with real AI at each stage |
| **Device Actions** | 30+ device actions across 7 categories with native module paths |
| **Integrations** | 20+ service integrations (AI, productivity, media, smart home, finance) |
| **Data Export** | Export all data as JSON or TXT |
| **Cross-Platform** | Web, mobile (Expo), and desktop (Electron) sharing the same backend |

---

## Quick Start

### Web (primary)

```bash
cp .env.example .env.local
# Edit .env.local: add Supabase keys, DATABASE_URL, DIRECT_URL

npm install
npm run setup
npm run dev
```

Open http://localhost:3000 (or http://localhost:5000 on Replit).

### Mobile (Expo)

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

### Desktop (Electron)

```bash
cd desktop
npm install
SALLIE_APP_URL=https://your-app.vercel.app npm run make
```

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Yes | Supabase anon/public key |
| `DATABASE_URL` | Yes | Prisma connection string (pooled, port 6543) |
| `DIRECT_URL` | Yes | Prisma direct connection (port 5432) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-side admin operations |
| `OPENAI_API_KEY` | Optional | OpenAI API for chat |
| `AZURE_SPEECH_SERVICES_KEY` | Optional | Azure Speech STT/TTS |
| `OLLAMA_URL` | Optional | Local LLM via Ollama |

---

## Project Structure

```
├── src/                    # Next.js 15 app
│   ├── app/               # Pages + 130+ API routes
│   ├── components/        # UI components
│   ├── lib/               # Supabase, Prisma, config, utilities
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   └── styles/            # Additional styles
├── mobile/                # Expo (React Native) app
├── desktop/               # Electron wrapper
├── prisma/                # Database schema
├── supabase/              # Migrations and edge functions
├── docs/                  # Documentation
├── public/                # Static assets
├── scripts/               # Build and setup scripts
└── next.config.mjs        # Next.js config (standalone output)
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run setup` | Generate Prisma client and setup |
| `npm run test` | Run Vitest test suite |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema to database |
| `npm run mobile:start` | Start Expo dev server |
| `npm run desktop:dev` | Start Electron in dev mode |

---

## Deployment

### Vercel (Recommended)
Connect the GitHub repo to Vercel. Add environment variables in Vercel dashboard. The app deploys automatically on push to `main`.

### Replit
The app runs on Replit with the configured workflow. Environment variables are set as Replit secrets.

---

## Documentation

- **Canonical reference:** [docs/THIS_REPO.md](docs/THIS_REPO.md)
- **Docs index:** [docs/README.md](docs/README.md)
- **Run the app:** [docs/RUN_THE_APP.md](docs/RUN_THE_APP.md)
- **API documentation:** [docs/api/API_DOCUMENTATION.md](docs/api/API_DOCUMENTATION.md)
- **Cross-platform setup:** [docs/CROSS_PLATFORM_SETUP.md](docs/CROSS_PLATFORM_SETUP.md)
- **Deployment checklist:** [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)

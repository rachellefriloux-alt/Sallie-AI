# Sallie — Azure & Supabase Connection Guide

How to connect the Next.js app to Supabase (auth + database) and Azure services (OpenAI, Speech).

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Web/Mobile  │────▶│ Next.js /api/*   │────▶│ Azure OpenAI    │
│  Client      │     │ (all 159 routes) │     │ (chat, tools)   │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                     │
       │                     ▼
       │              ┌─────────────────┐
       └─────────────▶│ Supabase        │
                      │ (auth, Postgres)│
                      └─────────────────┘

Voice: Web Client ──▶ Azure Speech (STT/TTS)
```

There is **no separate backend server**. The Next.js app handles everything — API routes call Azure/Supabase directly.

---

## Environment Variables

### Web (`.env.local`)

```env
# ========== SUPABASE (Required) ==========
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Prisma database connection
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Optional: service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ========== AZURE OPENAI (Optional — for AI chat) ==========
AZURE_OPENAI_RESOURCE=your-resource-name
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_KEY=your-key

# ========== OPENAI (Optional — fallback for AI chat) ==========
OPENAI_API_KEY=your-openai-key

# ========== AZURE SPEECH (Optional — for voice) ==========
NEXT_PUBLIC_AZURE_SPEECH_REGION=centralus
AZURE_SPEECH_SERVICES_KEY=your-speech-key
```

### Mobile (`mobile/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://your-web-app-url:3000
```

### Production (Vercel/Azure/Replit)

Set the same variables in your platform's environment settings. Never commit secrets to git.

---

## AI Chat Flow

The `/api/chat` route uses this fallback chain:

1. **Ollama** (if `OLLAMA_URL` is set) — local LLM, free
2. **Azure OpenAI** (if `AZURE_OPENAI_*` vars are set) — cloud, paid
3. **OpenAI** (if `OPENAI_API_KEY` is set) — cloud, paid
4. **No AI configured** — returns a message saying AI is not available

You only need ONE of these configured for chat to work.

---

## Where to Find Keys

| Service | Where |
|---------|-------|
| Supabase URL + anon key | Supabase Dashboard → Settings → API |
| Supabase DB connection strings | Supabase Dashboard → Settings → Database → Connection string |
| Azure OpenAI key | Azure Portal → your OpenAI resource → Keys and Endpoint |
| Azure Speech key | Azure Portal → your Speech resource → Keys and Endpoint |
| OpenAI key | platform.openai.com → API keys |

---

## Quick Setup

1. Get Supabase URL and anon key from the Supabase Dashboard.
2. Get database connection strings (pooler + direct) from Supabase.
3. Copy `.env.example` to `.env.local` and fill in the values.
4. Optionally set Azure or OpenAI keys for AI chat.
5. Run `npm run dev` — the app works with just Supabase configured.

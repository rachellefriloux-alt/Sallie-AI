# How to Run the Sallie App

One guide to run the web app, mobile app, and desktop app.

---

## Prerequisites

- **Node.js** 20+ (LTS). Download from [nodejs.org](https://nodejs.org).
- **Git**. Download from [git-scm.com](https://git-scm.com).
- **npm** comes with Node.js.

---

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd Sally
npm install
npm run setup
```

`npm run setup` creates `.env.local` from `.env.example` (if missing) and generates the Prisma client. Run it after first clone and after pulling changes that touch the database schema.

---

## 2. Environment Variables

### Web (Next.js)

Copy `.env.example` to `.env.local` in the project root. You **must** set:

| Variable | Where to get it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same → Project API keys → `anon` / publishable key |
| `DATABASE_URL` | Supabase Dashboard → Project Settings → Database → Connection string (URI, pooler, port 6543) |
| `DIRECT_URL` | Same (use "Direct connection", port 5432) |

Optional for AI chat:

- `OLLAMA_URL` — e.g. `http://localhost:11434` for local Ollama
- `OPENAI_API_KEY` — for OpenAI
- `AZURE_OPENAI_API_KEY` + `AZURE_OPENAI_RESOURCE` + `AZURE_OPENAI_DEPLOYMENT` — for Azure OpenAI

Optional for voice:

- `AZURE_SPEECH_SERVICES_KEY` + `NEXT_PUBLIC_AZURE_SPEECH_REGION` — for STT/TTS

See `.env.example` for the full list.

### Mobile (Expo)

```bash
cd mobile
cp .env.example .env
```

Edit `mobile/.env`:

| Variable | Value |
|----------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | Same as `NEXT_PUBLIC_SUPABASE_URL` |
| `EXPO_PUBLIC_SUPABASE_KEY` | Same as your Supabase anon key |
| `EXPO_PUBLIC_API_URL` | Your web app URL — `http://<your-ip>:3000` for local dev, or your deployed URL |

---

## 3. Run the Web App

From the **project root**:

```bash
npm run dev
```

Open **http://localhost:3000**.

- First time: sign in via Supabase auth (magic link or email/password).
- If prompted, complete the Genesis convergence (or skip).
- Visit `/growth` and `/life-management` for growth/life tracking.
- Visit `/mind-map`, `/copy-mind`, `/meli-ai` for AI tools.

---

## 4. Run the Mobile App

```bash
cd mobile
npm install
npx expo start
```

Or from root: `npm run mobile:start`.

- Set `EXPO_PUBLIC_API_URL` to your running web app URL.
- Scan the QR code with Expo Go (Android) or Camera app (iOS).
- Sign in with the same Supabase account — data syncs with web.

**Build standalone:**

```bash
cd mobile
npx eas-cli build --platform all --profile production
```

---

## 5. Run the Desktop App

The desktop app is an Electron wrapper that loads your web app URL.

1. Set `SALLIE_APP_URL` to your web app URL (e.g. `http://localhost:3000` or your deployed URL).
2. Build:

```bash
cd desktop
npm install
npm run make
```

Open the built app from `out/`.

---

## 6. Data Syncing

Data syncs across all platforms when you:

1. Sign in with the same Supabase account on all platforms.
2. Use the same backend (all platforms point to the same Next.js app / Supabase project).
3. Growth, life management, chat, and profile data are all stored in Supabase.

---

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| Sign-in fails | Check Supabase URL and anon key in `.env.local`. Add redirect URL (e.g. `sallie://`) in Supabase Auth settings. |
| Chat not working | Check AI keys (`OLLAMA_URL`, `OPENAI_API_KEY`, or `AZURE_OPENAI_*`). Chat works without keys but returns a message saying AI is not configured. |
| Mobile can't reach API | Ensure `EXPO_PUBLIC_API_URL` is reachable (same Wi-Fi, correct IP). |
| Database errors | Run `npm run prisma:generate` and `npm run prisma:push`. |
| Desktop shows blank | Set `SALLIE_APP_URL` to your web app URL and rebuild. |
| Missing mobile icons | Run `cd mobile && npx expo install --fix`. |

---

## Quick Reference

- **Web:** `npm run dev` → http://localhost:3000
- **Mobile:** `cd mobile && npx expo start` (set `EXPO_PUBLIC_API_URL` first)
- **Desktop:** `cd desktop && npm run make` (set `SALLIE_APP_URL` first)
- **Tests:** `npm run test`
- **Env:** See `.env.example` (root) and `mobile/.env.example`

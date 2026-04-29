# Sallie — Deployment Checklist

Deploy the web app (Vercel, Replit, or Azure), mobile app (Expo/EAS), and desktop app (Electron). Run all commands from the repo root unless stated otherwise.

---

## 0. Before You Start

- [ ] **Node.js 20+** installed (`node -v`).
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `DIRECT_URL`.
- [ ] Run: `npm install`, `npm run setup`, `npm run check-env`, `npm run build` — all succeed.
- [ ] No secrets committed to git (check `.env.production`, `.env.vercel` are in `.gitignore`).

---

## Prerequisites

- [ ] **Supabase project** — Dashboard → Project Settings → API: copy Project URL and anon key. Database → Connection string: URI (pooler, port 6543) and Direct (port 5432).
- [ ] **Supabase Storage** — Create `avatars` bucket (Public, 5 MB limit, image MIME types).
- [ ] **Secrets** — Never commit. Use `.env.local` for local dev, platform env vars for production.

---

## 1. Web App (Next.js)

### Option A: Vercel (Recommended)

1. Connect your GitHub repo to Vercel.
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`)
   - `DATABASE_URL`
   - `DIRECT_URL`
   - Optional: `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_RESOURCE`, `AZURE_OPENAI_DEPLOYMENT`, `OPENAI_API_KEY`, `AZURE_SPEECH_SERVICES_KEY`
3. Deploy. Vercel auto-builds on push to `main`.

- [ ] Vercel deploy succeeds.
- [ ] Visit your Vercel URL — app loads.

### Option B: Replit

The app runs on Replit with the dev server or build + start:

```bash
npm run dev
```

Set environment variables in Replit Secrets.

- [ ] App runs on Replit.

### Option C: Azure App Service

1. Create Azure Web App:
```bash
az login
az group create --name SallieStudioRG --location "Central US"
az appservice plan create --name SallieStudioPlan --resource-group SallieStudioRG --sku B1 --is-linux
az webapp create --name your-app-name --resource-group SallieStudioRG --plan SallieStudioPlan --runtime "NODE:20-lts"
```

2. Set env vars in Azure Portal → App Service → Configuration → Application settings.

3. Deploy standalone build:
```bash
npm run build
npm run zip-standalone
az webapp deploy --resource-group SallieStudioRG --name your-app-name --src-path deploy.zip --type zip
az webapp config set --resource-group SallieStudioRG --name your-app-name --startup-file "node server.js"
```

- [ ] Azure deploy succeeds.
- [ ] Visit Azure URL — app loads.

### Verify Web

- [ ] `GET /api/health` returns `{ "status": "ok" }`.
- [ ] Sign in works.
- [ ] Chat works (if AI keys are set).
- [ ] Profile and avatar work.

---

## 2. Database & Migrations

Do this before or right after first deploy:

```bash
npm run prisma:generate
npm run prisma:push
```

Or use Supabase migrations:
```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

- [ ] Database schema applied.

---

## 3. Mobile App (Expo)

1. Set `mobile/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
EXPO_PUBLIC_API_URL=https://your-deployed-web-url
```

2. Add redirect URLs in Supabase Auth settings: `sallie://`

3. Build:
```bash
cd mobile
npm install
npx eas-cli build --platform all --profile production
```

- [ ] Mobile build succeeds.
- [ ] App opens, sign in works, chat and features work.

---

## 4. Desktop App (Electron)

1. Generate assets: `npm run desktop:assets`
2. Build:
```bash
cd desktop
SALLIE_APP_URL=https://your-deployed-web-url npm run build
```

- [ ] Desktop build succeeds.
- [ ] App loads production URL, auth and features work.

---

## 5. Pre-deploy Checks

```bash
npm run lint
npm run test
npm run check-env
npm run build
```

- [ ] All pass.

---

## 6. Post-deploy Checks

| Check | Web | Mobile | Desktop |
|-------|-----|--------|---------|
| Health (`/api/health`) | Yes | — | — |
| Auth | Yes | Yes | Yes |
| Chat | Yes | Yes | Yes |
| Profile/avatar | Yes | Yes | Yes |
| Growth/life data | Yes | Yes | Yes |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 503 or app won't load | Check env vars are set. Check logs for missing vars. |
| `Cannot find module 'server.js'` | Use standalone zip deploy with `node server.js` startup. |
| 500 on every page | Check Supabase URL and anon key. |
| Redirect loop | Supabase env vars missing or wrong key name. |
| Static assets 404 | Redeploy — standalone build includes `.next/static` and `public`. |

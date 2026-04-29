# Sallie — Mobile (Expo)

Expo app for Sallie Studio: Home, Chat, Features, Profile. Auth via Supabase (magic link). Single-user deployment.

---

## Quick start

```bash
npm install
npx expo start
```

Configure env (copy from `.env.example` or create `.env`):

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` — Supabase anon key
- `EXPO_PUBLIC_API_URL` — **Required for full features.** Your deployed Next.js web app URL (e.g. `https://your-app.vercel.app` or `https://your-app.azurewebsites.net`). Chat, profile, avatar, and export use this API.

Add `sallie://` to Supabase Auth → URL Configuration → Redirect URLs for magic-link deep linking.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npx expo start` | Start dev server |
| `npx expo start --android` | Open Android emulator |
| `npx expo start --ios` | Open iOS simulator |
| `npm run build` | Web export (production build for web) |

---

## Production

1. Deploy the Next.js web app (Vercel, Azure App Service, or Docker).
2. Set `EXPO_PUBLIC_API_URL` in the mobile app env to that deployed URL (e.g. in EAS secrets or your build env).
3. Use EAS Build for iOS/Android binaries when ready.

---

## Structure

- `app/` — Expo Router (file-based routes, tabs)
- `app/(tabs)/` — Main tabs: index (Home), chat, features, profile
- `app/lib/` — Supabase client, API config

See root [README](../README.md) and [docs/PRODUCTION_ROADMAP.md](../docs/PRODUCTION_ROADMAP.md) for full setup and deployment.

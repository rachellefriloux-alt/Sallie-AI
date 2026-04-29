# Sallie Studio — Desktop (Electron)

Electron wrapper for the Sallie web app. Opens the app in a native window with tray, shortcuts, and notifications.

---

## Development

Start the Next.js app first (from repo root: `npm run dev`), then run the desktop client:

```bash
npm install
npm run dev
```

This loads `http://localhost:3000` in the Electron window. All API routes and auth work against your local server.

---

## Production build

For a packaged app that opens your **deployed** web app (so API and auth work without running Next.js locally), set **SALLIE_APP_URL** when building:

```bash
# Windows
set SALLIE_APP_URL=https://your-app.azurewebsites.net
npm run build

# macOS / Linux
SALLIE_APP_URL=https://your-app.azurewebsites.net npm run build
```

Then build per platform:

```bash
npm run build:win    # Windows (Squirrel/NSIS)
npm run build:mac    # macOS (dmg)
npm run build:linux  # Linux (AppImage)
```

Without `SALLIE_APP_URL`, the packaged app falls back to `http://localhost:3000` (for local use only).

---

## Config

- **forge.config.js** — Electron Forge (makers: Squirrel, zip, deb, rpm). Maker name: `@electron-forge/maker-deb`.
- **main.js** — Window, tray, shortcuts; production URL from `SALLIE_APP_URL`.
- **preload.js** — Safe bridge for renderer.
- **assets/** — Add `icon.ico` (Windows), `icon.icns` (mac), `icon.png` (Linux), `tray-icon.png` (optional) for installers; otherwise build may warn.

See root [README](../README.md), [docs/THIS_REPO.md](../docs/THIS_REPO.md), and [docs/PRODUCTION_ROADMAP.md](../docs/PRODUCTION_ROADMAP.md).

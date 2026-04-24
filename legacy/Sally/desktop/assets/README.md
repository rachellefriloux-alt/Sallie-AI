# Desktop assets

Place these files here to avoid build warnings:

- **icon.ico** — Windows app icon (e.g. 256x256 PNG converted to ICO)
- **icon.icns** — macOS app icon
- **icon.png** — Used by some makers (created by ensure-assets.js if missing)
- **tray-icon.png** — Tray icon (created by ensure-assets.js if missing)

Generate icon.ico from a PNG: `npx electron-icon-builder --input=icon.png --output=.`
Or use an online converter. Then run from repo root: `npm run build` in desktop/.

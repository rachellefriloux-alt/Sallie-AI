#!/usr/bin/env node
/**
 * Ensures desktop/assets has placeholder icons so Electron Forge build does not warn.
 * Run from repo root: node desktop/scripts/ensure-assets.js
 * Or from desktop: node scripts/ensure-assets.js
 */
const fs = require('fs');
const path = require('path');

const desktopDir = path.resolve(__dirname, '..');
const assetsDir = path.join(desktopDir, 'assets');

const MIN_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created', dir);
  }
}

function writeIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log('Created', filePath);
  }
}

ensureDir(assetsDir);

// 1x1 transparent PNG (valid for icon.ico, icon.png, tray-icon.png on some platforms)
writeIfMissing(path.join(assetsDir, 'icon.png'), MIN_PNG);
writeIfMissing(path.join(assetsDir, 'tray-icon.png'), MIN_PNG);

// .ico and .icns require proper format; document instead of generating binary
const readmePath = path.join(assetsDir, 'README.md');
if (!fs.existsSync(readmePath)) {
  fs.writeFileSync(
    readmePath,
    `# Desktop assets

Place these files here to avoid build warnings:

- **icon.ico** — Windows app icon (e.g. 256x256 PNG converted to ICO)
- **icon.icns** — macOS app icon
- **icon.png** — Used by some makers (created by ensure-assets.js if missing)
- **tray-icon.png** — Tray icon (created by ensure-assets.js if missing)

Generate icon.ico from a PNG: \`npx electron-icon-builder --input=icon.png --output=.\`
Or use an online converter. Then run from repo root: \`npm run build\` in desktop/.
`
  );
  console.log('Created', readmePath);
}

console.log('Desktop assets OK. Add icon.ico and icon.icns for full installers.');

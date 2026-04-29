#!/usr/bin/env node
/**
 * Build then zip the Next.js standalone output for Azure App Service (or any Node host).
 * Run from repo root: node scripts/zip-standalone.js
 * Output: sallie-standalone.zip in repo root. Upload to App Service and set startup: node server.js
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standaloneDir = path.join(root, '.next', 'standalone');

// 1. Build
console.log('Building...');
const build = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) {
  console.error('Build failed.');
  process.exit(1);
}

if (!fs.existsSync(standaloneDir)) {
  console.error('.next/standalone not found. Ensure next.config.mjs has output: "standalone".');
  process.exit(1);
}

// 2. Copy .next/static and public into standalone (same as Dockerfile)
const staticSrc = path.join(root, '.next', 'static');
const staticDst = path.join(standaloneDir, '.next', 'static');
const publicSrc = path.join(root, 'public');
const publicDst = path.join(standaloneDir, 'public');

if (fs.existsSync(staticSrc)) {
  fs.mkdirSync(path.dirname(staticDst), { recursive: true });
  copyRecursive(staticSrc, staticDst);
}
if (fs.existsSync(publicSrc)) {
  copyRecursive(publicSrc, publicDst);
}

// 3. Instructions to zip and deploy
console.log('Standalone ready at:', standaloneDir);
console.log('');
console.log('Create zip (then upload to Azure App Service):');
console.log('  PowerShell: Compress-Archive -Path .next\\standalone\\* -DestinationPath sallie-standalone.zip');
console.log('  Bash:       (cd .next/standalone && zip -r ../../sallie-standalone.zip .)');
console.log('');
console.log('Upload: az webapp deploy --resource-group <RG> --name <APP> --src-path sallie-standalone.zip --type zip');
console.log('Set startup command: node server.js. Set env vars in App Service → Configuration.');

function copyRecursive(src, dst) {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dst, name);
    if (fs.statSync(s).isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

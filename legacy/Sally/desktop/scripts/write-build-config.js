#!/usr/bin/env node
/**
 * Writes build-config.json from SALLIE_APP_URL so the packaged app loads the right URL.
 * Run before build: SALLIE_APP_URL=https://your-app.azurewebsites.net node desktop/scripts/write-build-config.js
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_URL = 'https://sallie-studio.replit.app';

const desktopDir = path.resolve(__dirname, '..');
const outPath = path.join(desktopDir, 'build-config.json');
const appUrl = (process.env.SALLIE_APP_URL || DEFAULT_URL).trim();

fs.writeFileSync(outPath, JSON.stringify({ appUrl }, null, 2), 'utf8');
console.log('Wrote build-config.json with appUrl:', appUrl);

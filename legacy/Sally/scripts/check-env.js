#!/usr/bin/env node
/**
 * Check required env for build/run. Exits 1 if required vars missing (for CI/pre-deploy).
 * Loads .env.local when present (Node does not load it automatically; we read for display only).
 * Usage: node scripts/check-env.js   or   npm run check-env
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env.local');
const envExample = path.join(root, '.env.example');

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'DATABASE_URL',
  'DIRECT_URL',
];

const optionalButRecommended = [
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
];

// Simple parse of .env.local (no dots in values)
function loadEnv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach((line) => {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  });
  return out;
}

const fileEnv = loadEnv(envPath);
const env = { ...process.env, ...fileEnv };
const missing = required.filter((k) => !env[k] || String(env[k]).trim().length === 0);
const missingOptional = optionalButRecommended.filter((k) => !env[k] || String(env[k]).trim().length === 0);

if (missing.length) {
  console.error('Missing required env (set in .env.local or environment):');
  missing.forEach((k) => console.error('  -', k));
  console.error('\nCopy .env.example to .env.local and fill values, or run: npm run setup');
  process.exit(1);
}

if (missingOptional.length) {
  console.warn('Optional env not set (app may have reduced functionality):');
  missingOptional.forEach((k) => console.warn('  -', k));
}

console.log('Required env OK. Run npm run build or npm run dev.');
process.exit(0);

#!/usr/bin/env node
/**
 * Prepare for deployment: check env, run build. Use before Docker build or uploading to App Service.
 * Usage: node scripts/prepare-deploy.js   or   npm run prepare-deploy
 * Exits 1 if check-env or build fails.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(name, cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', ...opts });
  if (r.status !== 0) {
    console.error(`${name} failed (exit ${r.status})`);
    process.exit(1);
  }
}

console.log('Checking environment...');
run('check-env', 'node', ['scripts/check-env.js']);

console.log('Building application...');
run('build', 'npm', ['run', 'build']);

console.log('Done. Next steps:');
console.log('  Docker:  docker build -t sallie-web . && docker run -p 3000:3000 --env-file .env.local sallie-web');
console.log('  Azure:   Deploy this folder (or the Docker image) to App Service / Container Apps. Set env in Configuration.');
console.log('  Vercel:  Connect repo and set env vars in project settings.');
process.exit(0);

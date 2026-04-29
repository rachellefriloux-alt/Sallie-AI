/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Runtime fingerprint utilities for deployment tracking.
 * Got it, love.
 */

import { fingerprint } from './fingerprint.js';

export const currentFingerprintSegments = {
  major: fingerprint.version.split('.')[0],
  minor: fingerprint.version.split('.')[1],
  patch: fingerprint.version.split('.')[2],
  build: fingerprint.gitHash,
  timestamp: fingerprint.timestamp,
  displayVersion: `${fingerprint.version}-${fingerprint.gitHash}`,
  isProduction: fingerprint.gitHash !== 'dev' && fingerprint.gitHash !== 'local'
};

export function getFingerprintDisplay() {
  return `Sallie ${currentFingerprintSegments.displayVersion}`;
}

export function getDetailedBuildInfo() {
  return `Build: ${fingerprint.buildId} | Version: ${fingerprint.version} | Hash: ${fingerprint.gitHash}`;
}
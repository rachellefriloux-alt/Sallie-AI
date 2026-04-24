/**
 * Centralized API configuration for mobile app.
 * - EXPO_PUBLIC_API_URL: Next.js web app (chat, health, avatar, export). Required for full features.
 * - EXPO_PUBLIC_BACKEND_URL: Python backend (avatar, resources, sync) when used; falls back when not set.
 */

const NEXT_API = process.env.EXPO_PUBLIC_API_URL?.trim() || '';
const BACKEND = process.env.EXPO_PUBLIC_BACKEND_URL?.trim() || '';

/** Next.js API base (chat, health, avatar, profile). Set for production. */
export const getNextApiUrl = () => NEXT_API || '';

/** Python backend base when using separate backend for avatar, resources, sync. */
export const getBackendUrl = () => BACKEND;

/** Health check URL: Next.js when set, else backend when set. */
export const getHealthUrl = () =>
  NEXT_API ? `${NEXT_API.replace(/\/$/, '')}/api/health` : BACKEND ? `${BACKEND.replace(/\/$/, '')}/health` : '';

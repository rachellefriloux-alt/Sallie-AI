/**
 * Next.js instrumentation: runs once at server startup.
 * Validates required env and logs warnings so you fail fast in production.
 */

export async function register() {
  if (process.env.NODE_ENV !== 'production') return;

  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
  }
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.DIRECT_URL) missing.push('DIRECT_URL');

  if (missing.length) {
    console.error('[Sallie] Missing required env in production:', missing.join(', '));
    console.error('[Sallie] Set these in your host (Vercel, Azure App Service, etc.) or the app may fail.');
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Health check endpoint for load balancers, monitoring, and production readiness.
 * Returns 200 with minimal JSON when the app is healthy.
 */
export async function GET() {
  try {
    const ollamaUrl = (process.env.OLLAMA_URL || 'http://localhost:11434').trim();
    let ollama: 'healthy' | 'unhealthy' | 'skipped' = 'skipped';
    if (ollamaUrl && !ollamaUrl.includes('localhost')) {
      try {
        const r = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/tags`, { signal: AbortSignal.timeout(2000) });
        ollama = r.ok ? 'healthy' : 'unhealthy';
      } catch {
        ollama = 'unhealthy';
      }
    }

    let supabase: 'healthy' | 'unhealthy' = 'unhealthy';
    try {
      const cookieStore = await cookies();
      const supabaseClient = createClient(cookieStore);
      const { error } = await supabaseClient.from('profiles').select('id').limit(1).maybeSingle();
      supabase = error == null ? 'healthy' : 'unhealthy';
    } catch {
      supabase = 'unhealthy';
    }

    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.SALLIE_VERSION ?? process.env.npm_package_version ?? '3.0.0',
        services: {
          ollama,
          qdrant: 'skipped' as const,
          supabase,
          database: supabase,
          auth: supabase,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}

/**
 * POST /api/auth/login — useAuthentication login().
 * Stub: Auth is handled by Supabase. Returns 501 when custom auth backend is not configured.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Auth via Supabase',
      message: 'Use Supabase Auth (signInWithPassword, OAuth) for login. This route is a stub for custom auth backend.',
    },
    { status: 501 }
  );
}

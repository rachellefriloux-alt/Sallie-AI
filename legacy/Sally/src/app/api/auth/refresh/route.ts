/**
 * POST /api/auth/refresh - useAuthentication refreshAccessToken().
 * Stub: Auth is handled by Supabase. Returns 501.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Auth via Supabase',
      message: 'Use Supabase Auth refreshSession for token refresh.',
    },
    { status: 501 }
  );
}

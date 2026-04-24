/**
 * POST /api/auth/enable-2fa — useAuthentication enable2FA().
 * Stub: Returns 501 when custom auth backend is not configured.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Auth via Supabase',
      message: 'Use Supabase MFA for 2FA. This route is a stub for custom auth backend.',
    },
    { status: 501 }
  );
}

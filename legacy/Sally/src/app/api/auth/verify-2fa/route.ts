/**
 * POST /api/auth/verify-2fa — useAuthentication handleTwoFactorAuth().
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

/**
 * POST /api/auth/last-login — useAuthentication updateLastLogin().
 * Stub: No-op. Returns 200.
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: true });
}

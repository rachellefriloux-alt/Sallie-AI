/**
 * POST /api/auth/logout — useAuthentication logout().
 * Stub: Auth is handled by Supabase. Returns 200 (client clears tokens).
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ success: true });
}

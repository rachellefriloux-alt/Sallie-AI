/**
 * GET /api/discover — Discovery: health and user info for first-run.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    const services: { name: string; status: string }[] = [
      { name: 'api', status: 'ok' },
      { name: 'auth', status: user ? 'authenticated' : 'anonymous' },
    ];
    return NextResponse.json({
      services,
      user: user ? { id: user.id, email: user.email ?? undefined } : null,
    });
  } catch (e) {
    console.error('api/discover:', e);
    return NextResponse.json({ services: [], user: null });
  }
}

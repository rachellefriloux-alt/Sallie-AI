/**
 * POST /api/lifeos/sync — Set last sync time in UserPreference.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, setPreference } from '@/lib/api-helpers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const now = new Date().toISOString();
    await setPreference(user.id, 'lifeos_synced_at', now);
    return NextResponse.json({ ok: true, lastSyncAt: now });
  } catch (e) {
    console.error('api/lifeos/sync:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

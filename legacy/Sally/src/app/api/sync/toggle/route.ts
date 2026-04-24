/**
 * POST /api/sync/toggle — Toggle cloud sync. Persisted in UserPreference.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, setPreference, getPreference } from '@/lib/api-helpers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const current = await getPreference<boolean>(user.id, 'sync_enabled');
    const enabled = !current;
    await setPreference(user.id, 'sync_enabled', enabled);
    return NextResponse.json({ enabled });
  } catch (e) {
    console.error('api/sync/toggle:', e);
    return NextResponse.json({ error: 'Failed to toggle' }, { status: 500 });
  }
}

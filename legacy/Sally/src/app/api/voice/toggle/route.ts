/**
 * POST /api/voice/toggle — Toggle voice interface. Persisted in UserPreference.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, setPreference, getPreference } from '@/lib/api-helpers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const current = await getPreference<boolean>(user.id, 'voice_enabled');
    const enabled = !current;
    await setPreference(user.id, 'voice_enabled', enabled);
    return NextResponse.json({ enabled });
  } catch (e) {
    console.error('api/voice/toggle:', e);
    return NextResponse.json({ error: 'Failed to toggle' }, { status: 500 });
  }
}

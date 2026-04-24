/**
 * POST /api/messenger/call/end — Clear active call from UserPreference.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, setPreference } from '@/lib/api-helpers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await setPreference(user.id, 'messenger_active_call', {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('api/messenger/call/end:', e);
    return NextResponse.json({ ok: true });
  }
}

/**
 * POST /api/messenger/call/start — Record call start in UserPreference; return callId.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, setPreference } from '@/lib/api-helpers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await setPreference(user.id, 'messenger_active_call', { callId, startedAt: new Date().toISOString() });
    return NextResponse.json({ callId, ok: true });
  } catch (e) {
    console.error('api/messenger/call/start:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

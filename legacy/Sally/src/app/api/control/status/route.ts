import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { getControlState } from '@/lib/control-system';

export async function GET() {
  try {
    let userId = 'anonymous';
    try {
      const cookieStore = await cookies();
      const user = await getAuthUser(cookieStore);
      if (user) userId = user.id;
    } catch {}

    const state = getControlState(userId);
    return NextResponse.json(state);
  } catch (e) {
    console.error('api/control/status:', e);
    return NextResponse.json({
      paused: false,
      autonomyLevel: 0.7,
      overrides: {},
      allowedActions: [],
      pausedAt: null,
      resumedAt: null,
    });
  }
}

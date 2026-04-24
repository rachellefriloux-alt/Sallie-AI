/**
 * POST /api/sallieverse/change-room — Persist room in UserPreference.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, setPreference } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const room = (body.room ?? body.room_id ?? 'lobby') as string;
    await setPreference(user.id, 'sallieverse_room', room);
    return NextResponse.json({ room, ok: true });
  } catch (e) {
    console.error('api/sallieverse/change-room:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

/**
 * POST /api/sallieverse/interact — Log interaction; return updated state.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, getPreference } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await req.json();
    const room = (await getPreference<string>(user.id, 'sallieverse_room')) ?? 'lobby';
    return NextResponse.json({
      room,
      current_room: room,
      connected: true,
      environment_state: 'calm',
      mood_lighting: 'warm',
      ambient_sounds: 'none',
      decorations: [],
      evolution_progress: 0,
      memories_count: 0,
      activities_log: [],
    });
  } catch (e) {
    console.error('api/sallieverse/interact:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

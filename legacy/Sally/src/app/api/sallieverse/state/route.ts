/**
 * GET /api/sallieverse/state — Room and state from UserPreference.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, getPreference } from '@/lib/api-helpers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    const room = (user ? await getPreference<string>(user.id, 'sallieverse_room') : null) ?? 'lobby';
    return NextResponse.json({
      room,
      current_room: room,
      connected: !!user,
      environment_state: 'calm',
      mood_lighting: 'warm',
      ambient_sounds: 'none',
      decorations: [],
      evolution_progress: 0,
      memories_count: 0,
      activities_log: [],
    });
  } catch (e) {
    console.error('api/sallieverse/state:', e);
    return NextResponse.json({ room: 'lobby', connected: false });
  }
}

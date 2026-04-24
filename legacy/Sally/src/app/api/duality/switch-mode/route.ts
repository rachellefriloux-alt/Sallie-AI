import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, getPreference, setPreference } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const targetMode = (body?.target_mode ?? body?.mode ?? 'infj') as string;
    const prev = await getPreference<string>(user.id, 'duality_mode');
    const state = (await getPreference<{ mode_history?: unknown[] }>(user.id, 'duality_state')) ?? {};
    const modeHistory = Array.isArray(state.mode_history) ? state.mode_history : [];
    const newHistory = [...modeHistory.slice(-19), {
      mode: prev ?? 'infj',
      timestamp: new Date().toISOString(),
      duration: 0,
      effectiveness: 80,
    }];
    await setPreference(user.id, 'duality_mode', targetMode);
    await setPreference(user.id, 'duality_state', {
      last_transition: new Date().toISOString(),
      mode_history: newHistory,
    });
    return NextResponse.json({
      active_mode: targetMode,
      transition_progress: 0,
      energy_reserves: 70,
      cognitive_load: 30,
      emotional_stability: 80,
      last_transition: new Date().toISOString(),
      mode_history: newHistory,
    });
  } catch (e) {
    console.error('api/duality/switch-mode:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

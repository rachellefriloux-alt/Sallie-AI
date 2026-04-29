import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, getPreference } from '@/lib/api-helpers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    const activeMode = (user ? await getPreference<string>(user.id, 'duality_mode') : null) ?? 'infj';
    const state = (user ? await getPreference<Record<string, unknown>>(user.id, 'duality_state') : null) ?? {};
    const modeHistory = Array.isArray(state.mode_history) ? state.mode_history : [];
    return NextResponse.json({
      active_mode: activeMode,
      transition_progress: 0,
      energy_reserves: Number(state.energy_reserves) || 70,
      cognitive_load: Number(state.cognitive_load) || 30,
      emotional_stability: Number(state.emotional_stability) || 80,
      last_transition: (state.last_transition as string) ?? new Date().toISOString(),
      mode_history: modeHistory,
    });
  } catch (e) {
    console.error('api/duality/state:', e);
    return NextResponse.json({
      active_mode: 'infj',
      transition_progress: 0,
      energy_reserves: 70,
      cognitive_load: 30,
      emotional_stability: 80,
      last_transition: new Date().toISOString(),
      mode_history: [],
    });
  }
}

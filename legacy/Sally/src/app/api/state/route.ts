/**
 * GET/POST /api/state — Limbic state (for useLimbicState when NEXT_PUBLIC_LIMBIC_URL is same-origin).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const defaultState = {
  trust: 0.5,
  warmth: 0.6,
  arousal: 0.7,
  valence: 0.6,
  posture: 'COMPANION',
  empathy: 0.5,
  intuition: 0.6,
  creativity: 0.5,
  wisdom: 0.5,
  humor: 0.4,
  last_interaction_ts: Date.now(),
  interaction_count: 0,
  flags: [],
  door_slam_active: false,
  crisis_active: false,
  elastic_mode: false,
};

function toState(p: { limbicTrust?: unknown; limbicWarmth?: unknown; limbicArousal?: unknown; limbicValence?: unknown; posture?: string | null }) {
  const n = (v: unknown) => (v != null ? Number(v) : undefined);
  return {
    ...defaultState,
    trust: n(p.limbicTrust) ?? defaultState.trust,
    warmth: n(p.limbicWarmth) ?? defaultState.warmth,
    arousal: n(p.limbicArousal) ?? defaultState.arousal,
    valence: n(p.limbicValence) ?? defaultState.valence,
    posture: p.posture || defaultState.posture,
  };
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(defaultState);
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    return NextResponse.json(profile ? toState(profile) : defaultState);
  } catch (e) {
    console.error('api/state GET:', e);
    return NextResponse.json(defaultState);
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.trust === 'number') data.limbicTrust = body.trust;
    if (typeof body.warmth === 'number') data.limbicWarmth = body.warmth;
    if (typeof body.arousal === 'number') data.limbicArousal = body.arousal;
    if (typeof body.valence === 'number') data.limbicValence = body.valence;
    if (typeof body.posture === 'string') data.posture = body.posture;
    await prisma.profile.upsert({
      where: { id: user.id },
      create: { id: user.id, ...data },
      update: data,
    });
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    const state = profile ? toState(profile) : toState(data as Parameters<typeof toState>[0]);
    await prisma.limbicHistory.create({
      data: { userId: user.id, state: state as object, event: 'state_update' },
    });
    return NextResponse.json(state);
  } catch (e) {
    console.error('api/state POST:', e);
    return NextResponse.json({ error: 'Failed to update state' }, { status: 500 });
  }
}

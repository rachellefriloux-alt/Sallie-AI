import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const defaultState = {
  trust: 0.5,
  warmth: 0.6,
  arousal: 0.5,
  valence: 0.6,
  curiosity: 0.7,
  focus: 0.6,
  creativity: 0.6,
  empathy: 0.7,
  resilience: 0.5,
  intuition: 0.5,
  posture: 'COMPANION',
  loyalty: 1.0,
  energy: 0.8,
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ state: defaultState });

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });

    if (!profile || !profile.limbicState) {
      return NextResponse.json({ state: defaultState });
    }

    const stored = profile.limbicState as Record<string, unknown>;
    const state = { ...defaultState, ...stored };

    return NextResponse.json({ state });
  } catch (e) {
    console.error('api/limbic/state GET:', e);
    return NextResponse.json({ state: defaultState });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    const existing = (profile?.limbicState as Record<string, unknown>) || {};
    const merged = { ...defaultState, ...existing, ...body };

    await prisma.profile.upsert({
      where: { id: user.id },
      update: { limbicState: merged as object },
      create: {
        id: user.id,
        limbicState: merged as object,
      },
    });

    await prisma.limbicHistory.create({
      data: {
        userId: user.id,
        state: merged as object,
        event: body.event || 'state_update',
      },
    });

    return NextResponse.json({ state: merged });
  } catch (e) {
    console.error('api/limbic/state POST:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

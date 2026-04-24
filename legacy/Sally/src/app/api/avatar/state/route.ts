import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const DEFAULT_AVATAR_STATE = {
  expression: 'neutral',
  form: 'default',
  customization: {
    species: 'fox',
    colors: { primary: '#6C63FF', secondary: '#FF6584' },
    accessories: [],
    animations: 'gentle',
    background: 'sanctuary',
  },
  energy_level: 0.7,
  evolution_stage: 1,
};

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { avatarState: true, emotionalState: true },
    });

    const avatarState = (profile?.avatarState as Record<string, unknown>) ?? {};
    const merged = { ...DEFAULT_AVATAR_STATE, ...avatarState };

    return NextResponse.json({
      ...merged,
      emotional_state: profile?.emotionalState ?? 'neutral',
      last_change: new Date().toISOString(),
    });
  } catch (e) {
    console.error('api/avatar/state GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { expression, form, customization } = body;

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { avatarState: true },
    });

    const current = (profile?.avatarState as Record<string, unknown>) ?? {};
    const updated = {
      ...current,
      ...(expression !== undefined && { expression }),
      ...(form !== undefined && { form }),
      ...(customization !== undefined && { customization: { ...(current.customization as object ?? {}), ...customization } }),
    };

    await prisma.profile.update({
      where: { id: user.id },
      data: { avatarState: updated },
    });

    return NextResponse.json({ ...DEFAULT_AVATAR_STATE, ...updated });
  } catch (e) {
    console.error('api/avatar/state POST:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

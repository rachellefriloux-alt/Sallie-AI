/**
 * POST /api/interact — Limbic interaction: update profile and append to LimbicHistory.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

const defaultState = { trust: 0.5, warmth: 0.6, arousal: 0.7, valence: 0.6, posture: 'COMPANION' as const };

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const type = (body?.type as string) || 'neutral';
    const intensity = Math.min(1, Math.max(0, Number(body?.intensity) ?? 0.1));
    const delta = type === 'positive' ? intensity : type === 'negative' ? -intensity : 0;

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    const trust = Math.min(1, Math.max(0, Number(profile?.limbicTrust ?? 0.5) + delta * 0.1));
    const warmth = Math.min(1, Math.max(0, Number(profile?.limbicWarmth ?? 0.6) + delta * 0.05));

    await prisma.profile.upsert({
      where: { id: user.id },
      create: { id: user.id, limbicTrust: trust, limbicWarmth: warmth },
      update: { limbicTrust: trust, limbicWarmth: warmth },
    });

    const state = {
      trust,
      warmth,
      arousal: Number(profile?.limbicArousal ?? 0.7),
      valence: Number(profile?.limbicValence ?? 0.6),
      posture: profile?.posture || 'COMPANION',
    };

    await prisma.limbicHistory.create({
      data: { userId: user.id, state, event: `interact_${type}` },
    });

    return NextResponse.json(state);
  } catch (e) {
    console.error('api/interact:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

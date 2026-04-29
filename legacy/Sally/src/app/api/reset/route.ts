/**
 * POST /api/reset — Reset limbic state to baseline.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const defaultState = {
  trust: 0.5,
  warmth: 0.6,
  arousal: 0.7,
  valence: 0.6,
  posture: 'COMPANION',
};

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json(defaultState);

    await prisma.profile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        limbicTrust: defaultState.trust,
        limbicWarmth: defaultState.warmth,
        limbicArousal: defaultState.arousal,
        limbicValence: defaultState.valence,
        posture: defaultState.posture,
      },
      update: {
        limbicTrust: defaultState.trust,
        limbicWarmth: defaultState.warmth,
        limbicArousal: defaultState.arousal,
        limbicValence: defaultState.valence,
        posture: defaultState.posture,
      },
    });
    await prisma.limbicHistory.create({
      data: { userId: user.id, state: defaultState, event: 'reset_to_baseline' },
    });

    return NextResponse.json(defaultState);
  } catch (e) {
    console.error('api/reset:', e);
    return NextResponse.json(defaultState);
  }
}

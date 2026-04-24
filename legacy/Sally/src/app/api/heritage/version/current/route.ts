/**
 * Heritage version/current: returns versions derived from user's heritage_dna and profile.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [heritage, profile] = await Promise.all([
      prisma.heritageDna.findUnique({
        where: { userId: user.id },
        select: { completedAt: true, updatedAt: true, answers: true },
      }),
      prisma.profile.findUnique({
        where: { id: user.id },
        select: { updatedAt: true },
      }),
    ]);

    const versions = [];
    if (heritage?.completedAt) {
      versions.push({
        id: 'heritage',
        label: 'Heritage DNA',
        completedAt: heritage.completedAt.toISOString(),
        updatedAt: heritage.updatedAt.toISOString(),
      });
    }
    if (profile?.updatedAt) {
      versions.push({
        id: 'profile',
        label: 'Profile',
        updatedAt: profile.updatedAt.toISOString(),
      });
    }
    if (versions.length === 0) {
      versions.push({
        id: 'core',
        label: 'Core',
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ versions });
  } catch (e) {
    console.error('api/heritage/version/current:', e);
    return NextResponse.json({ error: 'Failed to load versions' }, { status: 500 });
  }
}

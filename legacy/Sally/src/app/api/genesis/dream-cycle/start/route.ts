/**
 * POST /api/genesis/dream-cycle/start
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.profile.upsert({
      where: { id: user.id },
      create: { id: user.id, dreamCycleLastAt: new Date() },
      update: { dreamCycleLastAt: new Date() },
    });

    return NextResponse.json({ active: true, lastRun: new Date().toISOString() });
  } catch (e) {
    console.error('api/genesis/dream-cycle/start:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

/**
 * GET /api/genesis/dream-cycle/status
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ active: false, lastRun: null });

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    return NextResponse.json({
      active: false,
      lastRun: profile?.dreamCycleLastAt?.toISOString() ?? null,
    });
  } catch (e) {
    console.error('api/genesis/dream-cycle/status:', e);
    return NextResponse.json({ active: false, lastRun: null });
  }
}

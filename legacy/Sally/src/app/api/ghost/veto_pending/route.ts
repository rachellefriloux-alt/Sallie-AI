/**
 * GET /api/ghost/veto_pending — Pending vetoes from GenesisVeto (recent, not resolved).
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ hypotheses: [] });
    const rows = await prisma.genesisVeto.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const hypotheses = rows.map((r) => ({
      id: r.id,
      pattern: r.reason,
      evidence: [{ timestamp: Math.floor(r.createdAt.getTime() / 1000), observation: r.context ?? r.reason }],
      weight: 0.5,
      status: 'pending_veto' as const,
      category: r.context?.includes('scheduling') ? 'Scheduling' : r.context?.includes('preference') ? 'Preference' : 'Genesis Veto',
      conditional: r.action ? { base_belief: r.reason, exception: r.action } : undefined,
    }));
    return NextResponse.json({ hypotheses });
  } catch (e) {
    console.error('api/ghost/veto_pending:', e);
    return NextResponse.json({ hypotheses: [] });
  }
}

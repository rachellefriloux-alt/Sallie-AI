/**
 * POST /api/genesis/promotion/promote — Set hypothesis status to 'promoted', optionally merge into heritage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const hypothesisId = body.hypothesisId ?? body.hypothesis_id;
    const reasoning = body.reasoning ?? body.reason ?? '';
    if (!hypothesisId) return NextResponse.json({ error: 'hypothesisId required' }, { status: 400 });

    const hypothesis = await prisma.genesisHypothesis.findFirst({
      where: { id: hypothesisId, userId: user.id },
    });
    if (!hypothesis) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.genesisHypothesis.update({
      where: { id: hypothesisId },
      data: { status: 'promoted' },
    });

    return NextResponse.json({ ok: true, hypothesisId, reasoning });
  } catch (e) {
    console.error('api/genesis/promotion/promote:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

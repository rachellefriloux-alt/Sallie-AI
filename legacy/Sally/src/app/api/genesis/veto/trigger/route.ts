/**
 * POST /api/genesis/veto/trigger — Create GenesisVeto.
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
    const reason = typeof body.reason === 'string' ? body.reason : '';
    const context = typeof body.context === 'string' ? body.context : null;
    const action = typeof body.action === 'string' ? body.action : null;
    const veto = await prisma.genesisVeto.create({
      data: { userId: user.id, reason, context, action },
    });
    return NextResponse.json({
      id: veto.id,
      reason: veto.reason,
      context: veto.context,
      action: veto.action,
      createdAt: veto.createdAt,
    });
  } catch (e) {
    console.error('api/genesis/veto/trigger:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

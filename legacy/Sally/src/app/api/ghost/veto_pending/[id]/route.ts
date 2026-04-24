/**
 * PATCH /api/ghost/veto_pending/[id] — Resolve a pending veto (confirm, deny, add_context).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = (body.action ?? 'deny') as 'confirm' | 'deny' | 'add_context';
    const extraContext = typeof body.context === 'string' ? body.context : undefined;

    const veto = await prisma.genesisVeto.findFirst({
      where: { id, userId: user.id },
    });
    if (!veto) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'confirm') {
      await prisma.genesisHypothesis.create({
        data: {
          userId: user.id,
          title: veto.reason,
          content: veto.context ?? veto.reason,
          status: 'active',
        },
      });
      await prisma.genesisVeto.delete({ where: { id } });
      return NextResponse.json({ success: true, resolved: 'promoted' });
    }

    if (action === 'deny') {
      await prisma.genesisVeto.delete({ where: { id } });
      return NextResponse.json({ success: true, resolved: 'denied' });
    }

    if (action === 'add_context') {
      if (!extraContext) return NextResponse.json({ success: true, resolved: 'no_change' });
      await prisma.genesisVeto.update({
        where: { id },
        data: { context: veto.context ? `${veto.context}\n${extraContext}` : extraContext },
      });
      return NextResponse.json({ success: true, resolved: 'context_added' });
    }

    return NextResponse.json({ error: 'Invalid action or missing context' }, { status: 400 });
  } catch (e) {
    console.error('api/ghost/veto_pending/[id]:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

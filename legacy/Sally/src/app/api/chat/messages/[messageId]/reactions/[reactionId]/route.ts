/**
 * DELETE /api/chat/messages/[messageId]/reactions/[reactionId] — Remove reaction.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ messageId: string; reactionId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { messageId, reactionId } = await params;

    const reaction = await prisma.messageReaction.findFirst({
      where: { id: reactionId, messageId, userId: user.id },
    });
    if (!reaction) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.messageReaction.delete({ where: { id: reactionId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('api/chat/messages/.../reactions DELETE:', e);
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}

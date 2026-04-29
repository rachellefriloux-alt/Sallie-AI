/**
 * POST /api/chat/messages/[messageId]/reactions — Add reaction. Persisted in MessageReaction.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { messageId } = await params;
    const body = await req.json();
    const emoji = typeof body.emoji === 'string' ? body.emoji : '👍';

    const message = await prisma.message.findFirst({
      where: { id: messageId, conversation: { userId: user.id } },
    });
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const reaction = await prisma.messageReaction.create({
      data: { messageId, userId: user.id, emoji },
    });
    return NextResponse.json({
      id: reaction.id,
      emoji: reaction.emoji,
      userId: reaction.userId,
      timestamp: reaction.createdAt,
    });
  } catch (e) {
    console.error('api/chat/messages/.../reactions POST:', e);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

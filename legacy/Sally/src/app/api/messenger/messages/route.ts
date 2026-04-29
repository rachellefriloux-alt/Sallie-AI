/**
 * GET /api/messenger/messages — Messages from conversations with mode 'messenger'.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json([]);

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id, mode: 'messenger' },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 200 } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
    const items = conversations.flatMap((c) =>
      c.messages.map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role,
        conversationId: c.id,
        createdAt: m.createdAt,
      }))
    );
    return NextResponse.json(items);
  } catch (e) {
    console.error('api/messenger/messages:', e);
    return NextResponse.json([]);
  }
}

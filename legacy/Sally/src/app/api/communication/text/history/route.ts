/**
 * GET /api/communication/text/history — Conversations with mode 'communication' and messages.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ items: [] });

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id, mode: 'communication' },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 100 } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    const items = conversations.flatMap((c) =>
      c.messages.map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role,
        createdAt: m.createdAt,
        conversationId: c.id,
      }))
    );
    return NextResponse.json({ items });
  } catch (e) {
    console.error('api/communication/text/history:', e);
    return NextResponse.json({ items: [] });
  }
}

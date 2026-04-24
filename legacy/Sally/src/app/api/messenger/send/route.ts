/**
 * POST /api/messenger/send — Append message to messenger conversation.
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
    const content = (body?.content ?? body?.message ?? body?.text ?? '') as string;

    let conv = await prisma.conversation.findFirst({
      where: { userId: user.id, mode: 'messenger' },
      orderBy: { updatedAt: 'desc' },
    });
    if (!conv) {
      conv = await prisma.conversation.create({
        data: { userId: user.id, mode: 'messenger', title: 'Messenger' },
      });
    }
    const msg = await prisma.message.create({
      data: { conversationId: conv.id, role: 'user', content },
    });
    return NextResponse.json({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      conversationId: conv.id,
      createdAt: msg.createdAt,
    });
  } catch (e) {
    console.error('api/messenger/send:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

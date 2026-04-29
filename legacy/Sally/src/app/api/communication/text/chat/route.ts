/**
 * POST /api/communication/text/chat — Append message to communication conversation.
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
    const message = typeof body.message === 'string' ? body.message : '';

    let conv = await prisma.conversation.findFirst({
      where: { userId: user.id, mode: 'communication' },
      orderBy: { updatedAt: 'desc' },
    });
    if (!conv) {
      conv = await prisma.conversation.create({
        data: { userId: user.id, mode: 'communication', title: 'Communication' },
      });
    }
    const msg = await prisma.message.create({
      data: { conversationId: conv.id, role: 'user', content: message },
    });
    return NextResponse.json({
      id: msg.id,
      content: msg.content,
      message: msg.content,
      role: 'user',
      sender: 'user',
      timestamp: msg.createdAt,
      createdAt: msg.createdAt,
      conversationId: conv.id,
    });
  } catch (e) {
    console.error('api/communication/text/chat:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

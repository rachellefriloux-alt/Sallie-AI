/**
 * POST /api/chat/messages — Add a message (creates or uses conversation).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const content = typeof body.content === 'string' ? body.content : '';
    const threadId = typeof body.threadId === 'string' ? body.threadId : null;

    let conversationId = threadId;
    if (!conversationId) {
      const conv = await prisma.conversation.create({
        data: { userId: user.id, title: 'Chat' },
      });
      conversationId = conv.id;
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        role: body.sender === 'user' ? 'user' : 'assistant',
        content: content || body.message || '',
      },
    });

    return NextResponse.json({
      id: message.id,
      content: message.content,
      sender: message.role === 'user' ? 'user' : 'sallie',
      timestamp: message.createdAt,
      type: 'text',
      threadId: conversationId,
      metadata: {},
    });
  } catch (e) {
    console.error('api/chat/messages POST:', e);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}

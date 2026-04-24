/**
 * GET /api/chat/history — Conversations and messages for current user (from Prisma).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 50 },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    const messages = conversations.flatMap((c) =>
      c.messages.map((m) => ({
        id: m.id,
        content: m.content,
        sender: m.role === 'user' ? ('user' as const) : ('sallie' as const),
        timestamp: m.createdAt,
        type: 'text' as const,
        threadId: c.id,
        metadata: {},
      }))
    );

    const threads = conversations.map((c) => ({
      id: c.id,
      title: c.title || 'Conversation',
      participants: [],
      messageCount: c.messages.length,
      lastMessage: c.updatedAt,
      tags: [],
      isArchived: false,
    }));

    return NextResponse.json({
      messages,
      threads,
      searchResults: [],
      bookmarks: [],
    });
  } catch (e) {
    console.error('api/chat/history:', e);
    return NextResponse.json(
      { messages: [], threads: [], searchResults: [], bookmarks: [] },
      { status: 200 }
    );
  }
}

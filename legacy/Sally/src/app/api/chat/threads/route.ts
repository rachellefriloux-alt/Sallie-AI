/**
 * GET /api/chat/threads — List threads. POST — Create thread (conversation).
 * GET uses Next.js unstable_cache for 30s revalidate to reduce DB load (App Router best practice).
 */

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function getThreadsForUser(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    include: { _count: { select: { messages: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });
  return conversations.map((c) => ({
    id: c.id,
    title: c.title || 'Conversation',
    participants: [] as string[],
    messageCount: c._count.messages,
    lastMessage: c.updatedAt,
    tags: [] as string[],
    isArchived: false,
  }));
}

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

    const threads = await unstable_cache(
      () => getThreadsForUser(user.id),
      ['chat-threads', user.id],
      { revalidate: 30 }
    )();

    return NextResponse.json(threads);
  } catch (e) {
    console.error('api/chat/threads:', e);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title : 'Conversation';

    const conversation = await prisma.conversation.create({
      data: { userId: user.id, title },
    });

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title || title,
      participants: [],
      messageCount: 0,
      lastMessage: conversation.updatedAt,
      tags: Array.isArray(body.tags) ? body.tags : [],
      isArchived: false,
    });
  } catch (e) {
    console.error('api/chat/threads POST:', e);
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
  }
}

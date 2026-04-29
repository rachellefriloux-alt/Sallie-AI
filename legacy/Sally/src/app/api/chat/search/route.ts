/**
 * GET /api/chat/search?q= — Search messages by content (Prisma).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get('q') || '';
    if (!q.trim()) {
      return NextResponse.json([]);
    }

    const messages = await prisma.message.findMany({
      where: {
        conversation: { userId: user.id },
        content: { contains: q, mode: 'insensitive' },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    const results = messages.map((m) => ({
      id: m.id,
      content: m.content,
      sender: m.role === 'user' ? 'user' : 'sallie',
      timestamp: m.createdAt,
      type: 'text',
      threadId: m.conversationId,
      metadata: {},
    }));

    return NextResponse.json(results);
  } catch (e) {
    console.error('api/chat/search:', e);
    return NextResponse.json([]);
  }
}

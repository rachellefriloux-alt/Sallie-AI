import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { synthesizeMemorySummary } from '@/lib/sallie-intelligence';

export async function POST(req: NextRequest) {
  try {
    let userId: string | undefined;
    try {
      const body = await req.json();
      userId = body.userId as string | undefined;
    } catch {
    }

    if (!userId) {
      const { createClient } = await import('@/lib/supabase/server');
      const { cookies } = await import('next/headers');
      try {
        const supabase = createClient(await cookies());
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      } catch {
      }
    }

    if (!userId) {
      return NextResponse.json({ message: 'No user context for memory consolidation' });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentConversations = await prisma.conversation.findMany({
      where: {
        userId,
        updatedAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { id: true, updatedAt: true, createdAt: true },
    });

    if (!recentConversations || recentConversations.length === 0) {
      return NextResponse.json({ message: 'No recent conversations to summarize' });
    }

    const result = await synthesizeMemorySummary(userId);

    const periodStart = recentConversations[recentConversations.length - 1].createdAt;
    const periodEnd = recentConversations[0].updatedAt;

    const memorySummary = await prisma.memorySummary.create({
      data: {
        userId,
        periodStart,
        periodEnd,
        summary: result.summary,
        keyEvents: result.keyEvents,
        topics: result.topics,
        emotions: [],
      },
    });

    return NextResponse.json({
      success: true,
      memorySummary: {
        id: memorySummary.id,
        summary: memorySummary.summary,
        keyEvents: memorySummary.keyEvents,
        topics: memorySummary.topics,
        periodStart: memorySummary.periodStart,
        periodEnd: memorySummary.periodEnd,
      },
    });
  } catch (error) {
    console.error('Memory summarization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to summarize memory' },
      { status: 500 }
    );
  }
}

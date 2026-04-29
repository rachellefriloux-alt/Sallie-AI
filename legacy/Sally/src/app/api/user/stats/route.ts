/**
 * User stats for dashboard: interactions, conversations, session data.
 * Uses Supabase auth + Prisma for DB. Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [conversationCount, messageCount, heritage] = await Promise.all([
      prisma.conversation.count({ where: { userId: user.id } }),
      prisma.message.count({
        where: { conversation: { userId: user.id } },
      }),
      prisma.heritageDna.findUnique({
        where: { userId: user.id },
        select: { completedAt: true },
      }),
    ]);

    const lastConv = await prisma.conversation.findFirst({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true, createdAt: true },
    });
    const lastActive = lastConv?.updatedAt?.toISOString() ?? null;

    const recentConvs = await prisma.conversation.findMany({
      where: { userId: user.id },
      select: { createdAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    let sessionDuration = 0;
    for (const c of recentConvs) {
      const ms = (c.updatedAt.getTime() - c.createdAt.getTime());
      sessionDuration += Math.min(ms, 24 * 60 * 60 * 1000);
    }
    sessionDuration = Math.round(sessionDuration / 1000);

    return NextResponse.json({
      totalInteractions: messageCount,
      conversationCount,
      sessionDuration,
      featuresUsed: [],
      lastActive,
      convergenceCompleted: !!heritage?.completedAt,
    });
  } catch (e) {
    console.error('api/user/stats:', e);
    return NextResponse.json(
      { error: 'Failed to load stats' },
      { status: 500 }
    );
  }
}

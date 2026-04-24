import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    const body = await req.json();

    const {
      sessionId,
      totalClicks = 0,
      totalKeystrokes = 0,
      totalScrolls = 0,
      pageViews = 0,
      idleTime = 0,
      activeTime = 0,
      currentPage = '/',
      pagesVisited = [],
      interactionRate = 0,
      events = [],
    } = body;

    const userId = user?.id ?? 'anonymous';

    if (user) {
      await prisma.controlLog.create({
        data: {
          userId: user.id,
          action: 'activity_sensor',
          metadata: {
            sessionId,
            totalClicks,
            totalKeystrokes,
            totalScrolls,
            pageViews,
            idleTime,
            activeTime,
            currentPage,
            pagesVisited,
            interactionRate,
            eventCount: events.length,
          },
        },
      });
    }

    return NextResponse.json({
      ok: true,
      sessionId,
      userId,
      received: events.length,
    });
  } catch (e) {
    console.error('api/sensors/activity POST:', e);
    return NextResponse.json({ ok: true, received: 0 }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

    const logs = await prisma.controlLog.findMany({
      where: {
        userId: user.id,
        action: 'activity_sensor',
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const entries = logs.map(log => ({
      id: log.id,
      createdAt: log.createdAt,
      ...((log.metadata ?? {}) as Record<string, unknown>),
    })) as Array<Record<string, unknown> & { id: string; createdAt: Date }>;

    let totalClicks = 0;
    let totalKeystrokes = 0;
    let totalScrolls = 0;
    let totalPageViews = 0;
    let totalIdleTime = 0;
    let totalActiveTime = 0;
    const allPages = new Set<string>();

    for (const entry of entries) {
      totalClicks += (entry.totalClicks as number) || 0;
      totalKeystrokes += (entry.totalKeystrokes as number) || 0;
      totalScrolls += (entry.totalScrolls as number) || 0;
      totalPageViews += (entry.pageViews as number) || 0;
      totalIdleTime += (entry.idleTime as number) || 0;
      totalActiveTime += (entry.activeTime as number) || 0;
      const visited = entry.pagesVisited as string[] | undefined;
      if (visited) visited.forEach(p => allPages.add(p));
    }

    return NextResponse.json({
      userId: user.id,
      entries,
      summary: {
        totalSessions: entries.length,
        totalClicks,
        totalKeystrokes,
        totalScrolls,
        totalPageViews,
        totalIdleTimeMs: totalIdleTime,
        totalActiveTimeMs: totalActiveTime,
        uniquePages: Array.from(allPages),
      },
    });
  } catch (e) {
    console.error('api/sensors/activity GET:', e);
    return NextResponse.json({ error: 'Failed to fetch activity data' }, { status: 500 });
  }
}

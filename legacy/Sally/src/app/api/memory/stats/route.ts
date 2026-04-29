/**
 * GET /api/memory/stats — MemoryServiceImpl getStats().
 * Production implementation with Prisma aggregation.
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-helpers';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);

    const where = user?.id ? { actorId: user.id } : {};

    const [count, aggregate] = await Promise.all([
      prisma.memory.count({ where }),
      prisma.memory.aggregate({
        where,
        _avg: { salience: true },
        _max: { createdAt: true },
        _min: { createdAt: true },
      }),
    ]);

    const memories = await prisma.memory.findMany({
      where,
      select: { metadata: true },
    });

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    for (const m of memories) {
      const meta = m.metadata as Record<string, string> | null;
      if (meta?.type) {
        byType[meta.type] = (byType[meta.type] ?? 0) + 1;
      }
      if (meta?.source) {
        bySource[meta.source] = (bySource[meta.source] ?? 0) + 1;
      }
    }

    const stats = {
      total_memories: count,
      by_type: byType,
      by_source: bySource,
      average_salience: aggregate._avg.salience
        ? Number(aggregate._avg.salience)
        : 0,
      most_recent_memory: aggregate._max.createdAt?.getTime() ?? 0,
      oldest_memory: aggregate._min.createdAt?.getTime() ?? 0,
      storage_size_mb: 0,
    };

    return NextResponse.json({ success: true, stats });
  } catch (e) {
    console.error('api/memory/stats GET:', e);
    return NextResponse.json(
      { success: false, error: 'Failed to get memory stats' },
      { status: 500 }
    );
  }
}

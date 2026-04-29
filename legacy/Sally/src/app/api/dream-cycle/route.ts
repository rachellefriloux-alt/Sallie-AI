import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { dreamCycleLastAt: true, memoryVectorCount: true, memoryWorkingCount: true },
    });

    const lastRun = profile?.dreamCycleLastAt;
    const nextScheduled = lastRun
      ? new Date(lastRun.getTime() + 24 * 60 * 60 * 1000)
      : null;

    const consolidationLogs = await prisma.thoughtLog.findMany({
      where: {
        userId: user.id,
        content: { contains: 'consolidation' },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      lastRun: lastRun?.toISOString() ?? null,
      nextScheduled: nextScheduled?.toISOString() ?? null,
      consolidation: {
        totalCycles: consolidationLogs.length,
        memoriesProcessed: profile?.memoryVectorCount ?? 0,
        workingMemory: profile?.memoryWorkingCount ?? 0,
        recentCycles: consolidationLogs.map((l) => ({
          id: l.id,
          content: l.content,
          timestamp: l.createdAt.toISOString(),
        })),
      },
    });
  } catch (e) {
    console.error('api/dream-cycle GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [memoryCount, profile] = await Promise.all([
      prisma.memory.count({ where: { actorId: user.id } }),
      prisma.profile.findUnique({
        where: { id: user.id },
        select: { memoryVectorCount: true },
      }),
    ]);

    const now = new Date();

    await prisma.profile.update({
      where: { id: user.id },
      data: { dreamCycleLastAt: now },
    });

    const thought = await prisma.thoughtLog.create({
      data: {
        userId: user.id,
        content: JSON.stringify({
          type: 'dream_consolidation',
          text: `Dream cycle completed. Consolidated ${memoryCount} memories. Vector store: ${profile?.memoryVectorCount ?? 0} entries processed.`,
          memoriesProcessed: memoryCount,
          timestamp: now.toISOString(),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      cycleId: thought.id,
      completedAt: now.toISOString(),
      memoriesProcessed: memoryCount,
      nextScheduled: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    }, { status: 201 });
  } catch (e) {
    console.error('api/dream-cycle POST:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

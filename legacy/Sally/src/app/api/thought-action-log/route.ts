/**
 * GET /api/thought-action-log — Unified entries from thought_logs and control_logs for the Thought & Action Log page.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ entries: [] });

    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 50, 200);

    const [thoughts, controls] = await Promise.all([
      prisma.thoughtLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.controlLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    ]);

    type Unified = { id: string; type: string; content: string; timestamp: string; metadata?: Record<string, unknown> };
    const unified: Unified[] = [
      ...thoughts.map((r) => ({
        id: r.id,
        type: 'monologue' as const,
        content: r.content,
        timestamp: r.createdAt.toISOString(),
        metadata: {} as Record<string, unknown>,
      })),
      ...controls.map((r) => ({
        id: r.id,
        type: 'action' as const,
        content: r.action,
        timestamp: r.createdAt.toISOString(),
        metadata: (r.metadata as Record<string, unknown>) ?? {},
      })),
    ];

    unified.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const entries = unified.slice(0, limit);

    return NextResponse.json({ entries });
  } catch (e) {
    console.error('api/thought-action-log:', e);
    return NextResponse.json({ entries: [] });
  }
}

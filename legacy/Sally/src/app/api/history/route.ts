/**
 * GET /api/history?limit= — Limbic history from LimbicHistory table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json([]);

    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 100, 500);
    const rows = await prisma.limbicHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return NextResponse.json(
      rows.map((r) => ({
        timestamp: r.createdAt.getTime(),
        state: r.state as object,
        event: r.event ?? undefined,
      }))
    );
  } catch (e) {
    console.error('api/history:', e);
    return NextResponse.json([]);
  }
}

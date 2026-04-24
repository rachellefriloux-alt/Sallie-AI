/**
 * GET /api/control/history — Control action history from ControlLog.
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

    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 10, 100);
    const rows = await prisma.controlLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        action: r.action,
        metadata: r.metadata as object | null,
        createdAt: r.createdAt,
      }))
    );
  } catch (e) {
    console.error('api/control/history:', e);
    return NextResponse.json([]);
  }
}

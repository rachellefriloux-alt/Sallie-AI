/**
 * GET /api/genesis/promotion/candidates — Hypotheses with status 'candidate'.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json([]);

    const rows = await prisma.genesisHypothesis.findMany({
      where: { userId: user.id, status: 'candidate' },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        status: r.status,
        createdAt: r.createdAt,
      }))
    );
  } catch (e) {
    console.error('api/genesis/promotion/candidates:', e);
    return NextResponse.json([]);
  }
}

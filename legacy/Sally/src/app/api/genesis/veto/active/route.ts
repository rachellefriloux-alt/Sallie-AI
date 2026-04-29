/**
 * GET /api/genesis/veto/active — Active vetoes from GenesisVeto (recent).
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

    const rows = await prisma.genesisVeto.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        reason: r.reason,
        context: r.context,
        action: r.action,
        createdAt: r.createdAt,
      }))
    );
  } catch (e) {
    console.error('api/genesis/veto/active:', e);
    return NextResponse.json([]);
  }
}

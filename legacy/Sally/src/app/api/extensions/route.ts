/**
 * GET /api/extensions — From Extension table.
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

    const rows = await prisma.extension.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(
      rows.map((r) => ({ id: r.id, name: r.name, proposed: r.proposed, status: r.status, createdAt: r.createdAt }))
    );
  } catch (e) {
    console.error('api/extensions:', e);
    return NextResponse.json([]);
  }
}

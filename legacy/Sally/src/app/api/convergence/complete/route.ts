/**
 * POST /api/convergence/complete — Mark convergence complete (idempotent).
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.profile.upsert({
      where: { id: user.id },
      create: { id: user.id, convergenceCompleted: true },
      update: { convergenceCompleted: true },
    });
    const session = await prisma.convergenceSession.findUnique({ where: { userId: user.id } });
    if (session && !session.completedAt) {
      await prisma.convergenceSession.update({
        where: { userId: user.id },
        data: { completedAt: new Date() },
      });
    }
    return NextResponse.json({ completed: true });
  } catch (e) {
    console.error('api/convergence/complete:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

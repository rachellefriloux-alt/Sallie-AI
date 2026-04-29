import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await prisma.convergenceSession.upsert({
      where: { userId: user.id },
      create: { userId: user.id, currentIndex: 0, answers: [] },
      update: { currentIndex: 0, answers: [], completedAt: null },
    });
    return NextResponse.json({ started: true });
  } catch (e) {
    console.error('api/convergence/start:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

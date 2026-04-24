import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const status = req.nextUrl.searchParams.get('status') || undefined;

    const habits = await prisma.habit.findMany({
      where: { userId: authUser.id, ...(status && { status }) },
      include: {
        checkins: { orderBy: { createdAt: 'desc' }, take: 7 },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ habits });
  } catch (error) {
    console.error('Habits GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, description, frequency, category, targetTime } = body;

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const habit = await prisma.habit.create({
      data: {
        userId: authUser.id,
        name,
        description: description || null,
        frequency: frequency || 'daily',
        category: category || 'general',
        targetTime: targetTime || null,
      },
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error('Habits POST error:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}

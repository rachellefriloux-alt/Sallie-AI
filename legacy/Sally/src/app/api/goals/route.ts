import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const status = req.nextUrl.searchParams.get('status') || undefined;
    const domain = req.nextUrl.searchParams.get('domain') || undefined;

    const goals = await prisma.goal.findMany({
      where: { userId: authUser.id, ...(status && { status }), ...(domain && { domain }) },
      orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }],
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Goals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, category, priority, targetDate, steps, domain } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const goal = await prisma.goal.create({
      data: {
        userId: authUser.id,
        title,
        description: description || null,
        category: category || 'general',
        priority: priority || 'medium',
        targetDate: targetDate ? new Date(targetDate) : null,
        steps: steps || [],
        domain: domain || 'home',
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Goals POST error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

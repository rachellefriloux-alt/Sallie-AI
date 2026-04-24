import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { title, description, category, priority, status, progress, targetDate, steps, domain, stuckSince } = body;

    const existing = await prisma.goal.findFirst({ where: { id, userId: authUser.id } });
    if (!existing) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

    const wasStuck = existing.progress === (progress ?? existing.progress);
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) {
      updateData.progress = progress;
      if (progress > existing.progress) updateData.stuckSince = null;
    }
    if (targetDate !== undefined) updateData.targetDate = targetDate ? new Date(targetDate) : null;
    if (steps !== undefined) updateData.steps = steps;
    if (domain !== undefined) updateData.domain = domain;
    if (stuckSince !== undefined) updateData.stuckSince = stuckSince ? new Date(stuckSince) : null;

    if (wasStuck && !existing.stuckSince && progress === undefined) {
      updateData.stuckSince = new Date();
    }

    const goal = await prisma.goal.update({ where: { id }, data: updateData });
    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Goal PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.goal.findFirst({ where: { id, userId: authUser.id } });
    if (!existing) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

    await prisma.goal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Goal DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}

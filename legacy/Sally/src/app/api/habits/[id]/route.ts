import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.habit.findFirst({ where: { id, userId: authUser.id } });
    if (!existing) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.targetTime !== undefined) updateData.targetTime = body.targetTime;
    if (body.status !== undefined) updateData.status = body.status;

    const habit = await prisma.habit.update({ where: { id }, data: updateData });
    return NextResponse.json({ habit });
  } catch (error) {
    console.error('Habit PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.habit.findFirst({ where: { id, userId: authUser.id } });
    if (!existing) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });

    await prisma.habit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Habit DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { note, mood } = body as { note?: string; mood?: string };

    const habit = await prisma.habit.findFirst({ where: { id, userId: authUser.id } });
    if (!habit) return NextResponse.json({ error: 'Habit not found' }, { status: 404 });

    const now = new Date();
    let newStreak = habit.currentStreak;

    if (habit.lastCheckin) {
      const hoursSince = (now.getTime() - habit.lastCheckin.getTime()) / (1000 * 60 * 60);
      const isDaily = habit.frequency === 'daily';
      const isWeekly = habit.frequency === 'weekly';

      if ((isDaily && hoursSince < 48) || (isWeekly && hoursSince < 24 * 8)) {
        newStreak = habit.currentStreak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const [checkin, updatedHabit] = await prisma.$transaction([
      prisma.habitCheckin.create({
        data: {
          habitId: id,
          userId: authUser.id,
          note: note || null,
          mood: mood || null,
        },
      }),
      prisma.habit.update({
        where: { id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(habit.longestStreak, newStreak),
          totalCheckins: habit.totalCheckins + 1,
          lastCheckin: now,
        },
      }),
    ]);

    return NextResponse.json({ checkin, habit: updatedHabit, streak: newStreak });
  } catch (error) {
    console.error('Habit checkin error:', error);
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';
import { generateDailyReflections } from '@/lib/sallie-intelligence';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let reflection = await prisma.dailyReflection.findUnique({
      where: { userId_date: { userId: authUser.id, date: today } },
    });

    if (!reflection) {
      const prompts = await generateDailyReflections(authUser.id);
      reflection = await prisma.dailyReflection.create({
        data: {
          userId: authUser.id,
          date: today,
          prompts: prompts as unknown as Record<string, unknown>[],
        },
      });
    }

    return NextResponse.json({ reflection });
  } catch (error) {
    console.error('Reflections GET error:', error);
    return NextResponse.json({ error: 'Failed to get reflections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { promptId, response, mood, energy } = body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let reflection = await prisma.dailyReflection.findUnique({
      where: { userId_date: { userId: authUser.id, date: today } },
    });

    if (!reflection) {
      const prompts = await generateDailyReflections(authUser.id);
      reflection = await prisma.dailyReflection.create({
        data: {
          userId: authUser.id,
          date: today,
          prompts: prompts as unknown as Record<string, unknown>[],
        },
      });
    }

    const responses = (reflection.responses as Record<string, string>) || {};
    if (promptId && response) {
      responses[promptId] = response;
    }

    const updated = await prisma.dailyReflection.update({
      where: { id: reflection.id },
      data: {
        responses,
        ...(mood && { mood }),
        ...(energy && { energy }),
      },
    });

    return NextResponse.json({ reflection: updated });
  } catch (error) {
    console.error('Reflections POST error:', error);
    return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 });
  }
}

/**
 * POST /api/convergence/answer — Submit answer and return next state / completion.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { CONVERGENCE_QUESTIONS, CATEGORY_LABELS } from '@/lib/convergence-questions';

const TOTAL = CONVERGENCE_QUESTIONS.length;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const answerText = (body?.answer ?? body?.answerText ?? '') as string;

    const session = await prisma.convergenceSession.findUnique({ where: { userId: user.id } });
    const currentIndex = session?.currentIndex ?? 0;
    if (currentIndex >= TOTAL) {
      return NextResponse.json({ status: 'completed', conversational_response: "I already have everything I need." });
    }

    const q = CONVERGENCE_QUESTIONS[currentIndex];
    const answers = (session?.answers as { questionId: string; answer: string }[]) ?? [];
    const newAnswers = [...answers, { questionId: q.id, answer: answerText }];
    const nextIndex = currentIndex + 1;
    const isComplete = nextIndex >= TOTAL;

    if (isComplete) {
      await prisma.convergenceSession.upsert({
        where: { userId: user.id },
        create: { userId: user.id, currentIndex: nextIndex, answers: newAnswers, completedAt: new Date() },
        update: { currentIndex: nextIndex, answers: newAnswers, completedAt: new Date() },
      });
      await prisma.profile.upsert({
        where: { id: user.id },
        create: { id: user.id, convergenceCompleted: true },
        update: { convergenceCompleted: true },
      });
      return NextResponse.json({
        status: 'completed',
        conversational_response: "Thank you. I'm taking this in... I think I see you now.",
        transition: "Our story starts now.",
      });
    }

    await prisma.convergenceSession.upsert({
      where: { userId: user.id },
      create: { userId: user.id, currentIndex: nextIndex, answers: newAnswers },
      update: { currentIndex: nextIndex, answers: newAnswers },
    });

    const phase = CATEGORY_LABELS[q.category] ?? q.category;
    const transition = nextIndex < TOTAL
      ? `Moving to ${CATEGORY_LABELS[CONVERGENCE_QUESTIONS[nextIndex].category] ?? 'the next'}...`
      : undefined;
    return NextResponse.json({
      status: 'active',
      conversational_response: "I'm taking this in. It matters.",
      transition,
    });
  } catch (e) {
    console.error('api/convergence/answer:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

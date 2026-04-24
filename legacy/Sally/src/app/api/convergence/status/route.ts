import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { CONVERGENCE_QUESTIONS } from '@/lib/convergence-questions';

const TOTAL = CONVERGENCE_QUESTIONS.length;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) {
      return NextResponse.json({ completed: false, current_index: 0, total_questions: TOTAL }, { status: 200 });
    }
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    if (profile?.convergenceCompleted) {
      return NextResponse.json({
        completed: true,
        current_index: TOTAL,
        total_questions: TOTAL,
        currentQuestion: TOTAL,
        totalQuestions: TOTAL,
        answeredQuestions: TOTAL,
        elasticMode: false,
      });
    }
    const session = await prisma.convergenceSession.findUnique({ where: { userId: user.id } });
    const currentIndex = session?.currentIndex ?? 0;
    const answers = (session?.answers as { questionId: string; answer: string }[]) ?? [];
    const completed = !!session?.completedAt || currentIndex >= TOTAL;
    return NextResponse.json({
      completed,
      current_index: currentIndex,
      total_questions: TOTAL,
      currentQuestion: currentIndex + 1,
      totalQuestions: TOTAL,
      answeredQuestions: answers.length,
      elasticMode: false,
    });
  } catch (e) {
    console.error('api/convergence/status:', e);
    return NextResponse.json({ completed: false, current_index: 0, total_questions: CONVERGENCE_QUESTIONS.length }, { status: 200 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { CONVERGENCE_QUESTIONS, CATEGORY_LABELS } from '@/lib/convergence-questions';

const TOTAL = CONVERGENCE_QUESTIONS.length;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ status: 'completed' }, { status: 200 });
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    if (profile?.convergenceCompleted) return NextResponse.json({ status: 'completed' }, { status: 200 });
    const session = await prisma.convergenceSession.findUnique({ where: { userId: user.id } });
    const currentIndex = session?.currentIndex ?? 0;
    if (currentIndex >= TOTAL) return NextResponse.json({ status: 'completed' }, { status: 200 });
    const q = CONVERGENCE_QUESTIONS[currentIndex];
    const phase = CATEGORY_LABELS[q.category] ?? q.category;
    return NextResponse.json({
      status: 'active',
      id: q.id,
      text: q.question,
      phase,
      category: q.category,
      type: q.type,
      placeholder: q.placeholder,
      options: q.options,
      index: currentIndex,
      total: TOTAL,
    });
  } catch (e) {
    console.error('api/convergence/question:', e);
    return NextResponse.json({ status: 'completed' }, { status: 200 });
  }
}

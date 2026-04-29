import { NextResponse } from 'next/server';
import { CONVERGENCE_QUESTIONS, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/convergence-questions';

export async function GET() {
  try {
    return NextResponse.json({
      questions: CONVERGENCE_QUESTIONS,
      categories: CATEGORY_ORDER.map(category => ({
        id: category,
        label: CATEGORY_LABELS[category]
      })),
      total: CONVERGENCE_QUESTIONS.length,
    });
  } catch (error) {
    console.error('Convergence questions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch convergence questions' },
      { status: 500 }
    );
  }
}

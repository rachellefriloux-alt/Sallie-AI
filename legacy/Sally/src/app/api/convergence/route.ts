import { NextRequest, NextResponse } from 'next/server';
import { CONVERGENCE_QUESTIONS, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/convergence-questions';

export async function GET() {
  try {
    return NextResponse.json({
      questions: CONVERGENCE_QUESTIONS,
      categories: CATEGORY_ORDER.map(category => ({
        id: category,
        label: CATEGORY_LABELS[category]
      }))
    });
  } catch (error) {
    console.error('Convergence API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch convergence questions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { answers } = body;

    if (!answers) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Here we would typically save the answers to a database
    // For now, we'll just return a success response
    console.log('Convergence answers received:', answers);
    
    return NextResponse.json({
      success: true,
      message: 'Convergence answers received successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Convergence API error:', error);
    return NextResponse.json(
      { error: 'Failed to process convergence answers' },
      { status: 500 }
    );
  }
}
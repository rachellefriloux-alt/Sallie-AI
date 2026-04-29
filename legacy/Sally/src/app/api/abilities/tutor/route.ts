import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';
import { callAI } from '@/lib/ai-call';

export async function POST(req: NextRequest) {
  const id = getIdentifier(req);
  const { allowed, resetAt } = checkRateLimit(id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    const { prompt, level } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const levelInstructions: Record<string, string> = {
      'beginner': 'Explain at a beginner level. Assume no prior knowledge. Use simple language, analogies, and real-world examples.',
      'intermediate': 'Explain at an intermediate level. Assume basic familiarity with the subject. Go deeper into concepts and include practical applications.',
      'advanced': 'Explain at an advanced level. Assume strong foundational knowledge. Focus on nuances, edge cases, advanced techniques, and expert-level insights.',
    };

    const systemPrompt = `You are a patient, encouraging, and expert tutor. ${levelInstructions[level] || levelInstructions['beginner']}

Structure your teaching with:
1. **Concept** — Clear explanation of the topic
2. **How It Works** — Step-by-step breakdown
3. **Example** — A concrete, relatable example
4. **Practice** — A simple exercise or question for the learner
5. **Key Takeaway** — One sentence to remember

Be warm and supportive. Celebrate the learner's curiosity. Make complex things feel accessible.`;

    const result = await callAI(systemPrompt, prompt, { temperature: 0.4, maxTokens: 1536 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'tutor' });
  } catch (error) {
    console.error('abilities/tutor error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

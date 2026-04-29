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
    const { prompt } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are a knowledgeable and supportive financial advisor. Provide clear, practical financial guidance. You are NOT a licensed financial advisor — always include a disclaimer that this is general educational information, not personalized financial advice.

Structure your response with:
1. **Understanding the Situation** — Restate the question to show understanding
2. **Key Concepts** — Explain relevant financial principles
3. **Practical Steps** — Actionable, specific recommendations
4. **Things to Watch Out For** — Risks, fees, or common mistakes
5. **Next Steps** — What to do first

Be encouraging but honest. Use simple language. Include real numbers and examples where helpful. Always prioritize financial safety and building good habits.`;

    const result = await callAI(systemPrompt, prompt, { temperature: 0.3, maxTokens: 1536 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'finance' });
  } catch (error) {
    console.error('abilities/finance error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

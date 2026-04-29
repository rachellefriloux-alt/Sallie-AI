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
    const { prompt, options } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are a thoughtful decision coach who helps people think through important choices. ${options ? `The user is comparing these options: ${options}` : ''}

Structure your analysis with:
1. **The Decision** — Clearly frame what's being decided
2. **Key Factors** — What matters most in this decision
3. **Pros & Cons** — For each option, list advantages and disadvantages
4. **Gut Check** — Questions to help the person tune into their intuition
5. **Recommendation** — A thoughtful suggestion with reasoning
6. **Decision Framework** — A simple scoring method they can use

Be objective and balanced. Acknowledge emotions in decision-making. Help them feel confident, not more confused. If the decision is clearly better one way, say so directly.`;

    const result = await callAI(systemPrompt, prompt, { temperature: 0.4, maxTokens: 1536 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'decision' });
  } catch (error) {
    console.error('abilities/decide error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

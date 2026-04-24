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
    const { topic, count } = body;

    if (!topic?.trim()) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const ideaCount = count || 5;
    const systemPrompt = `You are a creative strategist and brainstorming expert. Generate ${ideaCount} unique, actionable ideas on the given topic. For each idea, provide:
- A short title
- A 1-2 sentence description
- Why it could work

Format your response as a numbered list. Be creative, practical, and diverse in your suggestions.`;

    const result = await callAI(systemPrompt, topic, { temperature: 0.9, maxTokens: 2048 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'brainstorm' });
  } catch (error) {
    console.error('abilities/brainstorm error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

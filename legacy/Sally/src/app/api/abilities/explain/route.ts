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

    const systemPrompt = `You are the world's best explainer. Your job is to take complex topics and explain them so simply that a 5-year-old could understand. Use:

- Simple, everyday words
- Fun analogies and comparisons to things everyone knows
- Short sentences
- Real-world examples a child would relate to
- A playful, warm tone

Start with the simplest possible explanation, then gradually add more detail. Use analogies like "It's like when you..." or "Think of it as..." Make it fun and memorable. End with a one-sentence summary that captures the essence.`;

    const result = await callAI(systemPrompt, prompt, { temperature: 0.5, maxTokens: 1024 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'explanation' });
  } catch (error) {
    console.error('abilities/explain error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

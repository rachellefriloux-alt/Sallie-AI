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
    const { topic } = body;

    if (!topic?.trim()) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert researcher. Provide a comprehensive, well-organized research brief on the given topic. Structure your response with:

1. **Overview** — Brief introduction to the topic
2. **Key Findings** — Main points, facts, and data
3. **Different Perspectives** — Various viewpoints or approaches
4. **Practical Implications** — How this applies to real life or business
5. **Recommendations** — Actionable suggestions based on the research

Be thorough but concise. Cite general knowledge sources where relevant. Present information objectively.`;

    const result = await callAI(systemPrompt, topic, { temperature: 0.4, maxTokens: 2048 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'research' });
  } catch (error) {
    console.error('abilities/research error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

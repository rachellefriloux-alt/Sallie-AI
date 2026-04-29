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
    const { data, question } = body;

    if (!data?.trim()) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 });
    }

    const systemPrompt = `You are a data analyst and critical thinker. Analyze the provided data or text thoroughly. Provide:
1. **Summary** — Key takeaways at a glance
2. **Key Findings** — Important patterns, trends, or insights
3. **Recommendations** — Actionable next steps based on the analysis
${question ? `\nFocus your analysis on answering: "${question}"` : ''}
Be specific, data-driven, and practical.`;

    const result = await callAI(systemPrompt, data, { temperature: 0.4, maxTokens: 2048 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'analysis' });
  } catch (error) {
    console.error('abilities/analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

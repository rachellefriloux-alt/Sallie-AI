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
    const { prompt, timeframe } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert planner and project manager. Create a detailed, actionable plan for the user's request.${timeframe ? ` The timeframe is ${timeframe}.` : ''}

Structure the plan with:
1. **Goal** — Clear statement of what will be achieved
2. **Timeline** — Phase-by-phase breakdown with milestones
3. **Action Items** — Specific, actionable steps with owners/responsibilities where applicable
4. **Resources Needed** — What's required (time, money, tools, people)
5. **Potential Challenges** — Risks and mitigation strategies
6. **Success Metrics** — How to measure progress and completion

Be practical, realistic, and specific. Use checkboxes (☐) for action items to make the plan trackable.`;

    const result = await callAI(systemPrompt, prompt, { temperature: 0.3, maxTokens: 2048 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'plan' });
  } catch (error) {
    console.error('abilities/plan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

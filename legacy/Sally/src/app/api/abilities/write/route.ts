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
    const { prompt, type } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const contentType = type || 'general';
    const typeGuide: Record<string, string> = {
      email: 'Write a professional, clear email.',
      essay: 'Write a well-structured essay with introduction, body paragraphs, and conclusion.',
      story: 'Write an engaging creative story with vivid descriptions and compelling narrative.',
      'social-post': 'Write a concise, engaging social media post optimized for engagement.',
      blog: 'Write a well-structured blog post with a hook, clear sections, and a conclusion.',
      letter: 'Write a well-formatted letter with appropriate tone and structure.',
      general: 'Write clear, well-structured content based on the request.',
    };

    const guide = typeGuide[contentType] || typeGuide.general;
    const systemPrompt = `You are an expert writer and content creator. ${guide} Produce polished, ready-to-use content.`;

    const result = await callAI(systemPrompt, prompt, { temperature: 0.7, maxTokens: 2048 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'writing' });
  } catch (error) {
    console.error('abilities/write error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

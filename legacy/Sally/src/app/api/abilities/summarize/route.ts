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
    const { prompt, format } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const formatInstructions: Record<string, string> = {
      'bullets': 'Format as clear bullet points.',
      'executive-summary': 'Format as a professional executive summary with key findings, recommendations, and next steps.',
      'tldr': 'Give an extremely brief TL;DR — 1-2 sentences maximum.',
      'paragraph': 'Write a concise paragraph summary.',
    };

    const systemPrompt = `You are an expert summarizer. Condense the provided text into a clear, accurate summary that captures all key points. ${formatInstructions[format] || formatInstructions['paragraph']} Preserve important details, names, numbers, and dates. Do not add information not present in the original text.`;

    const result = await callAI(systemPrompt, prompt, { temperature: 0.2, maxTokens: 1024 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'summary' });
  } catch (error) {
    console.error('abilities/summarize error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

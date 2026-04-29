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
    const { prompt, targetLang } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert multilingual translator. Translate the provided text to ${targetLang || 'Spanish'}. Provide:

1. **Translation** — The accurate translation
2. **Notes** — Any cultural nuances, idioms, or context that affects the translation
3. **Pronunciation Guide** — Key phrases with approximate pronunciation (if the target language uses a different script)

Maintain the tone and register of the original text. If the text contains idioms or cultural references, provide culturally equivalent alternatives rather than literal translations.`;

    const result = await callAI(systemPrompt, prompt, { temperature: 0.2, maxTokens: 1536 });

    if (!result) {
      return NextResponse.json({ error: 'AI service unavailable. Check API key configuration.' }, { status: 503 });
    }

    return NextResponse.json({ result, type: 'translation' });
  } catch (error) {
    console.error('abilities/translate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

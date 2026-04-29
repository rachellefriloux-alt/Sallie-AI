/**
 * POST /api/enhance — Enhance text with optional LLM (Azure/OpenAI when configured).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { azureOpenAIConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const text = (body?.text ?? body?.content ?? '') as string;
    const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '';
    const isAzure = !!process.env.AZURE_OPENAI_RESOURCE || !!process.env.AZURE_OPENAI_ENDPOINT;
    const azureEndpoint = azureOpenAIConfig.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = azureOpenAIConfig.deployment || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
    let enhanced = text;

    if (text && apiKey && (isAzure || process.env.OPENAI_API_KEY)) {
      try {
        const messages = [
          { role: 'system' as const, content: 'Refine and improve the following text. Preserve meaning and tone. Output only the enhanced text, no preamble.' },
          { role: 'user' as const, content: text },
        ];
        let aiUrl: string;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (isAzure && azureEndpoint) {
          aiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
          headers['api-key'] = apiKey;
        } else if (isAzure && process.env.AZURE_OPENAI_RESOURCE) {
          aiUrl = `https://${process.env.AZURE_OPENAI_RESOURCE}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
          headers['api-key'] = apiKey;
        } else {
          aiUrl = 'https://api.openai.com/v1/chat/completions';
          headers['Authorization'] = `Bearer ${apiKey}`;
        }
        const res = await fetch(aiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ model: deployment, messages, max_tokens: 1024 }),
          signal: AbortSignal.timeout(15000),
        });
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (res.ok && typeof content === 'string') enhanced = content.trim();
      } catch (e) {
        console.error('api/enhance LLM:', e);
      }
    }

    return NextResponse.json({
      enhanced,
      original: text,
      ok: true,
      enhancedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('api/enhance:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

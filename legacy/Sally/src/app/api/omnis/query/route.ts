import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { azureOpenAIConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { query, context } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: 'query required' }, { status: 400 });
    }

    const ollamaUrl = (process.env.OLLAMA_URL || 'http://localhost:11434').trim();
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
    const apiKey = process.env.OPENAI_API_KEY || azureOpenAIConfig.apiKey;
    const systemPrompt = `You are Sallie OMNIS, a universal knowledge architect. Your knowledge draws from all Wikimedia Foundation products: Wikipedia (encyclopedia), Wikiquote (quotations), Wiktionary (dictionary), Wikibooks (textbooks), Wikisource (source texts), Wikiversity (learning), Wikinews (news), Wikivoyage (travel), Wikimedia Commons (media), Wikidata (structured data), Wikispecies (species), and MediaWiki (documentation). Use this wiki-based knowledge alongside cognitive science, productivity, psychology, and philosophy. Answer with depth, clarity, and actionable insights. If context is provided, incorporate it. Format responses with clear structure. Include predictions or recommendations when relevant.`;

    const aiUrl = process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY
      ? `${process.env.AZURE_OPENAI_ENDPOINT.replace(/\/$/, '')}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o'}/chat/completions?api-version=2024-02-15-preview`
      : 'https://api.openai.com/v1/chat/completions';

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.AZURE_OPENAI_API_KEY) {
      headers['api-key'] = apiKey;
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const body: Record<string, unknown> = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: context ? `${query}\n\nContext: ${context}` : query },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    };
    if (!process.env.AZURE_OPENAI_ENDPOINT) {
      (body as Record<string, string>).model = process.env.AI_MODEL || 'gpt-4o';
    }

    // 1. Try Ollama first (local, no API key)
    if (ollamaUrl) {
      try {
        const ollamaRes = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: context ? `${query}\n\nContext: ${context}` : query },
            ],
            stream: false,
          }),
          signal: AbortSignal.timeout(30000),
        });
        const ollamaData = await ollamaRes.json();
        if (ollamaRes.ok && ollamaData.message?.content) {
          return NextResponse.json({
            content: ollamaData.message.content,
            mode: 'architect',
            synthesis: { confidence: 0.92, predictions: [], recommendations: [] },
          });
        }
      } catch {
        // Fall through to cloud
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'AI not configured. Set OLLAMA_URL (local) or OPENAI_API_KEY.' }, { status: 503 });
    }

    const res = await fetch(aiUrl, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? 'Unable to generate response.';

    return NextResponse.json({
      content,
      mode: 'architect',
      synthesis: {
        confidence: 0.92,
        predictions: [],
        recommendations: [],
      },
    });
  } catch (e) {
    console.error('omnis/query error:', e);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}

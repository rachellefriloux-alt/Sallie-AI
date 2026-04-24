import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAIConfig } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, size, quality, style, n } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "prompt" field' },
        { status: 400 }
      );
    }

    const apiKey =
      azureOpenAIConfig.apiKey ||
      process.env.AZURE_OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No AI API key configured. Set OPENAI_API_KEY or AZURE_OPENAI_*.' },
        { status: 503 }
      );
    }

    const isAzure = !!(
      azureOpenAIConfig.endpoint ||
      process.env.AZURE_OPENAI_ENDPOINT ||
      process.env.AZURE_OPENAI_RESOURCE
    );

    let url: string;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (isAzure) {
      const azureEndpoint = azureOpenAIConfig.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
      const azureResource = azureOpenAIConfig.resource || process.env.AZURE_OPENAI_RESOURCE;
      const endpoint = azureEndpoint || `https://${azureResource}.openai.azure.com`;
      url = `${endpoint.replace(/\/$/, '')}/openai/deployments/dall-e-3/images/generations?api-version=2024-02-15-preview`;
      headers['api-key'] = apiKey;
    } else {
      url = `${process.env.AI_BASE_URL || 'https://api.openai.com'}/v1/images/generations`;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const validSizes = ['1024x1024', '1792x1024', '1024x1792'];
    const imageSize = validSizes.includes(size) ? size : '1024x1024';

    const aiResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: isAzure ? undefined : 'dall-e-3',
        prompt: `Sallie AI generates: ${prompt}`,
        n: Math.min(n || 1, 4),
        size: imageSize,
        quality: quality === 'hd' ? 'hd' : 'standard',
        style: style === 'natural' ? 'natural' : 'vivid',
        response_format: 'url',
      }),
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: aiData.error?.message || aiResponse.statusText },
        { status: aiResponse.status >= 500 ? 502 : 400 }
      );
    }

    const images = (aiData.data || []).map((img: { url?: string; revised_prompt?: string; b64_json?: string }) => ({
      url: img.url || null,
      revised_prompt: img.revised_prompt || null,
    }));

    return NextResponse.json({
      images,
      prompt,
      size: imageSize,
      quality: quality === 'hd' ? 'hd' : 'standard',
      style: style === 'natural' ? 'natural' : 'vivid',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

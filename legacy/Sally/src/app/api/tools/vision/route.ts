import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAIConfig } from '@/lib/config';

function getAIConfig() {
  const apiKey =
    azureOpenAIConfig.apiKey ||
    process.env.AZURE_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY;
  const isAzure = !!(
    azureOpenAIConfig.endpoint ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.AZURE_OPENAI_RESOURCE
  );
  const azureResource = azureOpenAIConfig.resource || process.env.AZURE_OPENAI_RESOURCE;
  const azureEndpoint = azureOpenAIConfig.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
  const deployment =
    azureOpenAIConfig.deployment ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.AI_MODEL ||
    'gpt-4o';

  let url: string;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (isAzure && azureEndpoint) {
    url = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey!;
  } else if (isAzure && azureResource) {
    url = `https://${azureResource}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey!;
  } else {
    url = `${process.env.AI_BASE_URL || 'https://api.openai.com'}/v1/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return { url, headers, apiKey, isAzure, deployment };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image_url, image_base64, prompt } = body;

    if (!image_url && !image_base64) {
      return NextResponse.json(
        { error: 'Provide "image_url" or "image_base64"' },
        { status: 400 }
      );
    }

    const { url, headers, apiKey, isAzure, deployment } = getAIConfig();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No AI API key configured. Set OPENAI_API_KEY or AZURE_OPENAI_*.' },
        { status: 503 }
      );
    }

    const imageContent = image_url
      ? { type: 'image_url' as const, image_url: { url: image_url } }
      : { type: 'image_url' as const, image_url: { url: `data:image/png;base64,${image_base64}` } };

    const userContent = [
      { type: 'text' as const, content: prompt || 'Describe this image in detail. Include any text visible (OCR), objects, colors, and context.' },
      imageContent,
    ];

    const messages = [
      {
        role: 'system',
        content: 'You are Sallie\'s vision module. Analyze images with precision: identify objects, read text (OCR), describe scenes, answer visual questions. Be thorough but concise.',
      },
      {
        role: 'user',
        content: userContent,
      },
    ];

    const aiResponse = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: isAzure ? undefined : (deployment || 'gpt-4o'),
        messages,
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    const aiData = await aiResponse.json();

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: aiData.error?.message || aiResponse.statusText },
        { status: aiResponse.status >= 500 ? 502 : 400 }
      );
    }

    const description = aiData.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({
      description,
      model: aiData.model || deployment,
      usage: aiData.usage || null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Vision analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

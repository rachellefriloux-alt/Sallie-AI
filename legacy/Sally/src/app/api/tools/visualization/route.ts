import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAIConfig } from '@/lib/config';

async function callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  const ollamaUrl = (process.env.OLLAMA_URL || 'http://localhost:11434').trim();
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
  const apiKey =
    azureOpenAIConfig.apiKey ||
    process.env.AZURE_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY;
  const isAzure = !!(
    azureOpenAIConfig.endpoint ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.AZURE_OPENAI_RESOURCE
  );

  if (ollamaUrl) {
    try {
      const res = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ollamaModel, messages, stream: false, options: { temperature: 0.7, num_predict: 4096 } }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await res.json();
      if (res.ok && data.message?.content) return data.message.content;
    } catch {}
  }

  if (!apiKey) throw new Error('No AI provider configured');

  const azureResource = azureOpenAIConfig.resource || process.env.AZURE_OPENAI_RESOURCE;
  const azureEndpoint = azureOpenAIConfig.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = azureOpenAIConfig.deployment || process.env.AZURE_OPENAI_DEPLOYMENT || process.env.AI_MODEL || 'gpt-4o';

  let aiUrl: string;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (isAzure && azureEndpoint) {
    aiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey;
  } else if (isAzure && azureResource) {
    aiUrl = `https://${azureResource}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey;
  } else {
    aiUrl = `${process.env.AI_BASE_URL || 'https://api.openai.com'}/v1/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await fetch(aiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: isAzure ? undefined : (process.env.AI_MODEL || 'gpt-4o'),
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || res.statusText);
  return data.choices?.[0]?.message?.content ?? '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, chartType, data: inputData } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "prompt" field' }, { status: 400 });
    }

    const systemPrompt = `You are a data visualization assistant. Generate a valid Chart.js configuration object as JSON.
Rules:
- Output ONLY valid JSON (no markdown fences, no explanation)
- The JSON must be a valid Chart.js config with: type, data (labels, datasets), and options
- Supported chart types: bar, line, pie, doughnut, radar, polarArea, scatter, bubble
- Use meaningful colors (use rgba format for transparency)
- Include proper axis labels and legend
- If the user provides data, use it; otherwise generate sample data that matches the description
${chartType ? `- Preferred chart type: ${chartType}` : '- Choose the best chart type for the data'}
${inputData ? `- User provided data: ${JSON.stringify(inputData)}` : ''}`;

    const result = await callAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ]);

    let chartConfig;
    try {
      const cleaned = result
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      chartConfig = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid Chart.js configuration', raw: result }, { status: 502 });
    }

    return NextResponse.json({
      config: chartConfig,
      chartType: chartConfig.type || chartType || 'bar',
      prompt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Visualization generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

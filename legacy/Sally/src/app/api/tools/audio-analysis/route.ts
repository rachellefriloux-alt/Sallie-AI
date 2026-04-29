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

  let chatUrl: string;
  let transcriptionUrl: string;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (isAzure && azureEndpoint) {
    chatUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    transcriptionUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/whisper-1/audio/transcriptions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey!;
  } else if (isAzure && azureResource) {
    const base = `https://${azureResource}.openai.azure.com`;
    chatUrl = `${base}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    transcriptionUrl = `${base}/openai/deployments/whisper-1/audio/transcriptions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey!;
  } else {
    const base = process.env.AI_BASE_URL || 'https://api.openai.com';
    chatUrl = `${base}/v1/chat/completions`;
    transcriptionUrl = `${base}/v1/audio/transcriptions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return { chatUrl, transcriptionUrl, headers, apiKey, isAzure, deployment };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    const { chatUrl, transcriptionUrl, headers, apiKey, isAzure, deployment } = getAIConfig();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No AI API key configured. Set OPENAI_API_KEY or AZURE_OPENAI_*.' },
        { status: 503 }
      );
    }

    let transcription = '';
    let analysisPrompt = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File | null;
      analysisPrompt = (formData.get('prompt') as string) || '';

      if (!audioFile) {
        return NextResponse.json(
          { error: 'Missing "audio" file in form data' },
          { status: 400 }
        );
      }

      const whisperForm = new FormData();
      whisperForm.append('file', audioFile);
      whisperForm.append('model', 'whisper-1');
      whisperForm.append('response_format', 'verbose_json');

      const whisperHeaders: Record<string, string> = {};
      if (isAzure) {
        whisperHeaders['api-key'] = apiKey;
      } else {
        whisperHeaders['Authorization'] = `Bearer ${apiKey}`;
      }

      const whisperRes = await fetch(transcriptionUrl, {
        method: 'POST',
        headers: whisperHeaders,
        body: whisperForm,
      });

      const whisperData = await whisperRes.json();

      if (!whisperRes.ok) {
        return NextResponse.json(
          { error: whisperData.error?.message || 'Transcription failed' },
          { status: whisperRes.status >= 500 ? 502 : 400 }
        );
      }

      transcription = whisperData.text || '';

      const analysis = await analyzeWithAI(
        chatUrl,
        headers,
        isAzure,
        deployment,
        transcription,
        whisperData,
        analysisPrompt
      );

      return NextResponse.json({
        transcription,
        language: whisperData.language || null,
        duration: whisperData.duration || null,
        segments: whisperData.segments || [],
        analysis,
      });
    } else {
      const body = await req.json();
      transcription = body.transcription || '';
      analysisPrompt = body.prompt || '';

      if (!transcription) {
        return NextResponse.json(
          { error: 'Provide audio file (multipart) or "transcription" text (JSON)' },
          { status: 400 }
        );
      }

      const analysis = await analyzeWithAI(
        chatUrl,
        headers,
        isAzure,
        deployment,
        transcription,
        null,
        analysisPrompt
      );

      return NextResponse.json({
        transcription,
        analysis,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Audio analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function analyzeWithAI(
  chatUrl: string,
  headers: Record<string, string>,
  isAzure: boolean,
  deployment: string,
  transcription: string,
  whisperMeta: { language?: string; duration?: number; segments?: unknown[] } | null,
  userPrompt: string
): Promise<string> {
  const metaInfo = whisperMeta
    ? `\nLanguage: ${whisperMeta.language || 'unknown'}\nDuration: ${whisperMeta.duration || 'unknown'}s\nSegments: ${(whisperMeta.segments || []).length}`
    : '';

  const defaultPrompt = 'Analyze this audio transcription. Identify key topics, sentiment, speaker intent, and any actionable items.';

  const messages = [
    {
      role: 'system',
      content: 'You are Sallie\'s audio analysis module. Analyze transcribed audio content for sentiment, topics, key points, speaker intent, and actionable items. Be thorough and structured.',
    },
    {
      role: 'user',
      content: `${userPrompt || defaultPrompt}\n\nTranscription:\n"${transcription}"${metaInfo}`,
    },
  ];

  const aiResponse = await fetch(chatUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: isAzure ? undefined : (deployment || 'gpt-4o'),
      messages,
      max_tokens: 1024,
      temperature: 0.4,
    }),
  });

  const aiData = await aiResponse.json();
  return aiData.choices?.[0]?.message?.content ?? 'Analysis unavailable.';
}

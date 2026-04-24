import { NextRequest, NextResponse } from 'next/server';

const AZURE_TTS_ENDPOINT = 'https://centralus.tts.speech.microsoft.com/cognitiveservices/v1';
const DEFAULT_VOICE = 'en-US-JennyNeural';
const ALLOWED_VOICES = ['en-US-JennyNeural', 'en-US-AriaNeural'];

function buildSSML(text: string, voice: string): string {
  const safeText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
  <voice name='${voice}'>
    <prosody rate='0.95' pitch='-2%'>
      ${safeText}
    </prosody>
  </voice>
</speak>`;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.AZURE_SPEECH_SERVICES_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Azure Speech Services key is not configured. Please add AZURE_SPEECH_SERVICES_KEY to your environment variables.',
        },
        { status: 503 },
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.text) {
      return NextResponse.json({ error: 'Missing "text" in request body' }, { status: 400 });
    }

    const text = String(body.text).slice(0, 5000);
    const voiceName =
      body.voice && ALLOWED_VOICES.includes(body.voice) ? body.voice : DEFAULT_VOICE;

    const ssml = buildSSML(text, voiceName);

    const response = await fetch(AZURE_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'SallieStudio',
      },
      body: ssml,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('Azure TTS error:', response.status, errorText);
      return NextResponse.json(
        { error: `Text-to-speech synthesis failed: ${response.status}` },
        { status: 502 },
      );
    }

    const audioData = await response.arrayBuffer();

    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioData.byteLength),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e) {
    console.error('api/text-to-speech error:', e);
    return NextResponse.json(
      { error: 'Internal server error during speech synthesis' },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const speechKey = process.env.AZURE_SPEECH_SERVICES_KEY;
  const region = process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || 'centralus';

  if (!speechKey) {
    return NextResponse.json(
      { error: 'Azure Speech Services not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { text, voice, style, rate, pitch } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const selectedVoice = voice || 'en-US-JennyNeural';
    const selectedStyle = style || 'gentle';
    const selectedRate = rate || '0.95';
    const selectedPitch = pitch || 'medium';

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
        <voice name="${selectedVoice}">
          <mstts:express-as style="${selectedStyle}" styledegree="1.5">
            <prosody rate="${selectedRate}" pitch="${selectedPitch}">
              ${text.replace(/[<>&'"]/g, (c: string) => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c] || c))}
            </prosody>
          </mstts:express-as>
        </voice>
      </speak>
    `.trim();

    const ttsUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'SallieStudio',
      },
      body: ssml,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure TTS error:', response.status, errorText);
      return NextResponse.json(
        { error: `Speech synthesis failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Speech synthesis failed' },
      { status: 500 }
    );
  }
}

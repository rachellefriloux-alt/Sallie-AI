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
    const audioData = await req.arrayBuffer();

    if (!audioData || audioData.byteLength === 0) {
      return NextResponse.json({ error: 'No audio data provided' }, { status: 400 });
    }

    const sttUrl = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;

    const response = await fetch(sttUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'audio/wav',
        'Accept': 'application/json',
      },
      body: audioData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure STT error:', response.status, errorText);
      return NextResponse.json(
        { error: `Speech recognition failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      text: result.DisplayText || result.Text || '',
      confidence: result.NBest?.[0]?.Confidence || 0,
      status: result.RecognitionStatus,
    });
  } catch (error) {
    console.error('STT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Speech recognition failed' },
      { status: 500 }
    );
  }
}

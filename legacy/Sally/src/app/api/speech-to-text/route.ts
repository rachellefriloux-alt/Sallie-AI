import { NextRequest, NextResponse } from 'next/server';

const AZURE_STT_ENDPOINT =
  'https://centralus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1';

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

    const contentType = req.headers.get('content-type') || '';
    let audioBuffer: ArrayBuffer | null = null;
    let audioContentType = 'audio/wav';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audioFile = formData.get('audio') as Blob | null;
      if (!audioFile) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
      }
      audioBuffer = await audioFile.arrayBuffer();
      const blobType = audioFile.type || '';
      if (blobType.includes('webm')) {
        audioContentType = 'audio/webm; codec=opus';
      } else if (blobType.includes('ogg')) {
        audioContentType = 'audio/ogg; codec=opus';
      } else if (blobType.includes('wav')) {
        audioContentType = 'audio/wav';
      } else if (blobType) {
        audioContentType = blobType;
      }
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (body.audioBase64) {
        audioBuffer = Buffer.from(body.audioBase64, 'base64').buffer;
        audioContentType = body.contentType || 'audio/wav';
      } else {
        return NextResponse.json({ error: 'No audio data provided' }, { status: 400 });
      }
    } else {
      audioBuffer = await req.arrayBuffer();
      if (contentType.includes('webm')) {
        audioContentType = 'audio/webm; codec=opus';
      } else if (contentType.includes('ogg')) {
        audioContentType = 'audio/ogg; codec=opus';
      } else if (contentType) {
        audioContentType = contentType;
      }
    }

    if (!audioBuffer || audioBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Empty audio data' }, { status: 400 });
    }

    const url = `${AZURE_STT_ENDPOINT}?language=en-US`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': audioContentType,
      },
      body: audioBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error('Azure STT error:', response.status, errorText);
      return NextResponse.json(
        { error: `Speech recognition failed: ${response.status}`, text: '', confidence: 0 },
        { status: 502 },
      );
    }

    const result = await response.json();

    return NextResponse.json({
      text: result.DisplayText || result.Display || result.Text || '',
      confidence:
        result.NBest && result.NBest.length > 0 ? result.NBest[0].Confidence : result.Confidence || 0,
    });
  } catch (e) {
    console.error('api/speech-to-text error:', e);
    return NextResponse.json(
      { error: 'Internal server error during speech recognition', text: '', confidence: 0 },
      { status: 500 },
    );
  }
}

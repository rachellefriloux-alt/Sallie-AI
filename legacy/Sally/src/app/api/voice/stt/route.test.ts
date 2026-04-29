import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('POST /api/voice/stt', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...origEnv };
    vi.unstubAllGlobals();
  });

  it('returns 503 when speech key is not configured', async () => {
    delete process.env.AZURE_SPEECH_SERVICES_KEY;
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/voice/stt', {
      method: 'POST',
      body: new ArrayBuffer(100),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain('not configured');
  });

  it('returns 400 when no audio data', async () => {
    process.env.AZURE_SPEECH_SERVICES_KEY = 'test-key';
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/voice/stt', {
      method: 'POST',
      body: new ArrayBuffer(0),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('calls Azure STT endpoint when configured', async () => {
    process.env.AZURE_SPEECH_SERVICES_KEY = 'test-key';
    process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION = 'eastus';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        DisplayText: 'Hello world',
        RecognitionStatus: 'Success',
        NBest: [{ Confidence: 0.95 }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { POST } = await import('./route');
    const audioBuffer = new ArrayBuffer(100);
    new Uint8Array(audioBuffer).fill(1);
    const req = new Request('http://localhost/api/voice/stt', {
      method: 'POST',
      body: audioBuffer,
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.text).toBe('Hello world');
    expect(body.confidence).toBe(0.95);
  });
});

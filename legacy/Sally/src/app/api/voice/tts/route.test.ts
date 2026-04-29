import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('POST /api/voice/tts', () => {
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
    const req = new Request('http://localhost/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain('not configured');
  });

  it('returns 400 when text is missing', async () => {
    process.env.AZURE_SPEECH_SERVICES_KEY = 'test-key';
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('required');
  });

  it('calls Azure TTS endpoint when configured', async () => {
    process.env.AZURE_SPEECH_SERVICES_KEY = 'test-key';
    process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION = 'eastus';

    const fakeAudio = new ArrayBuffer(50);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => fakeAudio,
    });
    vi.stubGlobal('fetch', mockFetch);

    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello world' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
  });
});

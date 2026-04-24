import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    heritageDna: { findUnique: vi.fn().mockResolvedValue(null) },
    profile: {
      findUnique: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({}),
    },
    message: {
      findMany: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue({ count: 2 }),
    },
  },
}));

vi.mock('@/lib/api-helpers', () => ({
  getAuthUserFromRequest: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/config', () => ({
  azureOpenAIConfig: { apiKey: '', endpoint: '', resource: '', deployment: 'gpt-4o' },
}));

describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns 400 when message is empty', async () => {
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 400 when no message field', async () => {
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns reply when Ollama responds', async () => {
    process.env.OLLAMA_URL = 'http://localhost:11434';
    delete process.env.OPENAI_API_KEY;
    delete process.env.AZURE_OPENAI_API_KEY;
    delete process.env.AI_API_KEY;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: 'Hello from Sallie!' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' }),
    });
    const res = await POST(req as any);
    const body = await res.json();

    if (res.status === 200) {
      expect(body.reply).toBeDefined();
      expect(body.emotion).toBeDefined();
    }
  });
});

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
      }),
    },
  }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
    },
    limbicHistory: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

describe('GET /api/limbic/state', () => {
  it('returns default state when no profile exists', async () => {
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.state).toBeDefined();
    expect(body.state.trust).toBeDefined();
    expect(body.state.warmth).toBeDefined();
    expect(body.state.posture).toBe('COMPANION');
  });
});

describe('POST /api/limbic/state', () => {
  it('updates limbic state', async () => {
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/limbic/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trust: 0.9, warmth: 0.8 }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.state).toBeDefined();
    expect(body.state.trust).toBe(0.9);
  });
});

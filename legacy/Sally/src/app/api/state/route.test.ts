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
      findUnique: vi.fn().mockResolvedValue({
        limbicTrust: 0.7,
        limbicWarmth: 0.65,
        limbicArousal: 0.5,
        limbicValence: 0.55,
        posture: 'PEER',
      }),
      upsert: vi.fn().mockResolvedValue({}),
    },
    limbicHistory: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

describe('GET /api/state', () => {
  it('returns limbic state from profile', async () => {
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.trust).toBe(0.7);
    expect(body.warmth).toBe(0.65);
    expect(body.posture).toBe('PEER');
  });
});

describe('POST /api/state', () => {
  it('updates limbic state', async () => {
    const { prisma } = await import('@/lib/prisma');
    (prisma.profile.findUnique as any).mockResolvedValue({
      limbicTrust: 0.9,
      limbicWarmth: 0.85,
      limbicArousal: 0.6,
      limbicValence: 0.7,
      posture: 'MENTOR',
    });

    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trust: 0.9, warmth: 0.85, posture: 'MENTOR' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.trust).toBe(0.9);
    expect(body.posture).toBe('MENTOR');
  });
});

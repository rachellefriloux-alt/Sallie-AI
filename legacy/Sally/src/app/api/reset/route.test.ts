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
      upsert: vi.fn().mockResolvedValue({}),
    },
    limbicHistory: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

describe('POST /api/reset', () => {
  it('returns default limbic state', async () => {
    const { POST } = await import('./route');
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.trust).toBe(0.5);
    expect(body.warmth).toBe(0.6);
    expect(body.posture).toBe('COMPANION');
  });
});

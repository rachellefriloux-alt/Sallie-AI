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
        id: 'user-123',
        limbicTrust: 0.85,
        limbicWarmth: 0.75,
        limbicArousal: 0.6,
        limbicValence: 0.8,
      }),
    },
  },
}));

describe('GET /api/cognitive', () => {
  it('returns thoughts, emotion, cognition, and system data', async () => {
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.thoughts).toBeDefined();
    expect(Array.isArray(body.thoughts)).toBe(true);
    expect(body.thoughts.length).toBeGreaterThan(0);

    expect(body.emotion).toBeDefined();
    expect(body.emotion.trust).toBeDefined();
    expect(body.emotion.primary_emotion).toBeDefined();

    expect(body.cognition).toBeDefined();
    expect(body.cognition.active_processes).toBeDefined();
    expect(Array.isArray(body.cognition.active_processes)).toBe(true);

    expect(body.system).toBeDefined();
    expect(body.system.health_status).toBe('optimal');
  });
});

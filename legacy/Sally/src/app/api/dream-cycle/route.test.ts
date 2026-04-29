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
        dreamCycleLastAt: new Date('2024-01-01'),
        memoryVectorCount: 42,
        memoryWorkingCount: 10,
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    thoughtLog: {
      findMany: vi.fn().mockResolvedValue([
        { id: '1', content: 'consolidation test', createdAt: new Date() },
      ]),
      create: vi.fn().mockResolvedValue({ id: 'new-thought' }),
    },
    memory: {
      count: vi.fn().mockResolvedValue(100),
    },
  },
}));

describe('GET /api/dream-cycle', () => {
  it('returns dream cycle status', async () => {
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.lastRun).toBeDefined();
    expect(body.nextScheduled).toBeDefined();
    expect(body.consolidation).toBeDefined();
    expect(body.consolidation.totalCycles).toBeGreaterThanOrEqual(0);
    expect(body.consolidation.memoriesProcessed).toBeDefined();
  });
});

describe('POST /api/dream-cycle', () => {
  it('triggers a dream cycle', async () => {
    const { POST } = await import('./route');
    const res = await POST();
    expect(res.status).toBe(201);
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.cycleId).toBeDefined();
    expect(body.completedAt).toBeDefined();
    expect(body.memoriesProcessed).toBeDefined();
    expect(body.nextScheduled).toBeDefined();
  });
});

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
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
        id: 'test-user-id',
        limbicTrust: 0.85,
        limbicState: {},
      }),
    },
    controlLog: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: '1', action: 'test', metadata: {}, createdAt: new Date() }),
    },
  },
}));

describe('GET /api/agency/status', () => {
  it('returns trust tier and capabilities', async () => {
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.trustTier).toBeDefined();
    expect(body.trustLevel).toBeDefined();
    expect(body.capabilities).toBeDefined();
    expect(Array.isArray(body.capabilities)).toBe(true);
  });
});

describe('POST /api/agency/status', () => {
  it('returns 400 when action is missing', async () => {
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/agency/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('creates control log entry', async () => {
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/agency/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'schedule_meeting', metadata: { time: '10am' } }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.log).toBeDefined();
  });
});

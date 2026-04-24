import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetAuthUser } = vi.hoisted(() => ({
  mockGetAuthUser: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/api-helpers', () => ({
  getAuthUser: (...args: unknown[]) => mockGetAuthUser(...args),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    controlLog: {
      create: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as unknown as {
  controlLog: {
    create: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/sensors/activity', () => {
  it('accepts activity data without auth', async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/sensors/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'sess-1', events: [] }),
    });
    const res = await POST(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.userId).toBe('anonymous');
  });

  it('stores activity data for authenticated user', async () => {
    mockGetAuthUser.mockResolvedValue({ id: 'user-1' });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/sensors/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'sess-1',
        totalClicks: 10,
        totalKeystrokes: 50,
        events: [{ type: 'click' }],
      }),
    });
    const res = await POST(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.userId).toBe('user-1');
    expect(body.received).toBe(1);
    expect(mockPrisma.controlLog.create).toHaveBeenCalled();
  });
});

describe('GET /api/sensors/activity', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetAuthUser.mockResolvedValue(null);
    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/sensors/activity');
    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it('returns activity data for authenticated user', async () => {
    mockGetAuthUser.mockResolvedValue({ id: 'user-1' });
    mockPrisma.controlLog.findMany.mockResolvedValue([
      {
        id: 'log-1',
        createdAt: new Date(),
        metadata: { totalClicks: 5, totalKeystrokes: 20, pageViews: 3, pagesVisited: ['/home'] },
      },
    ]);
    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/sensors/activity');
    const res = await GET(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.userId).toBe('user-1');
    expect(body.entries).toBeDefined();
    expect(body.summary).toBeDefined();
    expect(body.summary.totalSessions).toBe(1);
  });
});

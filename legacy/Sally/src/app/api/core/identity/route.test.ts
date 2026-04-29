import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetUser } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    userPreference: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
    },
    controlLog: {
      create: vi.fn().mockResolvedValue({}),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/core/identity', () => {
  it('returns identity data even without auth', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.identity).toBeDefined();
    expect(body.identity.values).toBeDefined();
    expect(body.identity.currentHash).toBeDefined();
    expect(body.integrity).toBe(true);
    expect(body.protection).toBeDefined();
  });

  it('returns identity with correct structure for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.identity.values.length).toBeGreaterThan(0);
    expect(body.protection.level).toBeDefined();
    expect(body.protection.immutableCount).toBeGreaterThan(0);
  });
});

describe('POST /api/core/identity', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/core/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('handles verify action', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/core/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify' }),
    });
    const res = await POST(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.integrity).toBeDefined();
    expect(body.lastVerified).toBeDefined();
  });

  it('returns 400 for unknown action', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/core/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'invalid' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('handles propose action with invalid proposal', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/core/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'propose',
        type: 'remove',
        targetValueId: 'loyalty',
        reason: 'Testing immutable removal',
      }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

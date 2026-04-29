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

vi.mock('@/lib/kinship', () => ({
  getKinshipUsers: vi.fn().mockResolvedValue([{ id: 'user-1', displayName: 'Test' }]),
  getKinshipContext: vi.fn().mockResolvedValue({ userId: 'user-1', activeUserId: 'user-1', isOwner: true }),
  getUserHeritageDna: vi.fn().mockResolvedValue(null),
  getUserIsolatedMemories: vi.fn().mockResolvedValue([]),
  getUserProfile: vi.fn().mockResolvedValue({ id: 'user-1' }),
  getUserConversations: vi.fn().mockResolvedValue([]),
  getUserLimbicHistory: vi.fn().mockResolvedValue([]),
  switchUserContext: vi.fn().mockResolvedValue({ userId: 'user-1', activeUserId: 'target-1', isOwner: false }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/kinship', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/kinship?action=list');
    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it('returns users list', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/kinship?action=list');
    const res = await GET(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.users).toBeDefined();
  });

  it('returns context', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/kinship?action=context');
    const res = await GET(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.context).toBeDefined();
  });

  it('returns 400 for unknown action', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/kinship?action=unknown');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/kinship', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/kinship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'switch', targetUserId: 'target-1' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('handles switch action', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/kinship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'switch', targetUserId: 'target-1' }),
    });
    const res = await POST(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.context).toBeDefined();
  });

  it('returns 400 for missing targetUserId on switch', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/kinship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'switch' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

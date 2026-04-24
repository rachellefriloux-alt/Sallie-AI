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
    memory: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 'mem-1', content: 'test', tags: [], salience: 0.5 }),
    },
  },
}));

import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as unknown as {
  memory: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/memory', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns memories for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.memory.findMany.mockResolvedValue([
      { id: 'mem-1', content: 'Test memory', tags: ['tag1'], salience: 0.8 },
    ]);
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.memories).toBeDefined();
    expect(body.memories).toHaveLength(1);
    expect(body.memories[0].content).toBe('Test memory');
  });
});

describe('POST /api/memory', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'new memory' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('creates memory for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.memory.create.mockResolvedValue({
      id: 'mem-new',
      content: 'New memory',
      tags: ['important'],
      salience: 0.9,
    });
    const { POST } = await import('./route');
    const req = new Request('http://localhost/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'New memory', tags: ['important'], salience: 0.9 }),
    });
    const res = await POST(req as any);
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.memory).toBeDefined();
    expect(body.memory.content).toBe('New memory');
    expect(mockPrisma.memory.create).toHaveBeenCalled();
  });
});

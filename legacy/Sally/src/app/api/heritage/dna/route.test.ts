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
    heritageDna: { findUnique: vi.fn().mockResolvedValue(null) },
  },
}));

import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as unknown as {
  heritageDna: { findUnique: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/heritage/dna', () => {
  it('returns empty DNA when no record exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.heritageDna.findUnique.mockResolvedValue(null);
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.core).toEqual({});
    expect(body.preferences).toEqual({});
    expect(body.learned).toEqual([]);
    expect(body.history).toEqual([]);
    expect(body.completedAt).toBeNull();
  });

  it('returns parsed DNA data', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.heritageDna.findUnique.mockResolvedValue({
      answers: {
        core: { shield_type: 'Fortress' },
        preferences: { work_rhythm: 'Sprinter' },
        learned: ['lesson1'],
        history: ['event1'],
      },
      completedAt: new Date('2024-06-15'),
    });
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.core.shield_type).toBe('Fortress');
    expect(body.preferences.work_rhythm).toBe('Sprinter');
    expect(body.learned).toEqual(['lesson1']);
    expect(body.completedAt).toBeDefined();
  });
});

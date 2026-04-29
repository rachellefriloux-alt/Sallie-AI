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
    profile: { findUnique: vi.fn().mockResolvedValue(null) },
    conversation: { count: vi.fn().mockResolvedValue(0) },
    message: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as unknown as {
  profile: { findUnique: ReturnType<typeof vi.fn> };
  conversation: { count: ReturnType<typeof vi.fn> };
  message: { findMany: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/ghost/suggestions', () => {
  it('returns suggestions array in response', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.profile.findUnique.mockResolvedValue({
      limbicTrust: 0.5,
      limbicWarmth: 0.5,
      limbicValence: 0.5,
    });
    mockPrisma.conversation.count.mockResolvedValue(0);
    mockPrisma.message.findMany.mockResolvedValue([]);

    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.suggestions).toBeDefined();
    expect(Array.isArray(body.suggestions)).toBe(true);
  });

  it('includes onboarding suggestion when no conversations', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.profile.findUnique.mockResolvedValue(null);
    mockPrisma.conversation.count.mockResolvedValue(0);
    mockPrisma.message.findMany.mockResolvedValue([]);

    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    const types = body.suggestions.map((s: { type: string }) => s.type);
    expect(types).toContain('onboarding');
  });

  it('limits suggestions to 5', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.profile.findUnique.mockResolvedValue({
      limbicTrust: 0.3,
      limbicWarmth: 0.3,
      limbicValence: 0.2,
    });
    mockPrisma.conversation.count.mockResolvedValue(0);
    mockPrisma.message.findMany.mockResolvedValue([]);

    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(body.suggestions.length).toBeLessThanOrEqual(5);
  });
});

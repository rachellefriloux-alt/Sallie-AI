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
    limbicHistory: { findMany: vi.fn().mockResolvedValue([]) },
    thoughtLog: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

import { prisma } from '@/lib/prisma';

const mockPrisma = prisma as unknown as {
  profile: { findUnique: ReturnType<typeof vi.fn> };
  limbicHistory: { findMany: ReturnType<typeof vi.fn> };
  thoughtLog: { findMany: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/consciousness', () => {
  it('returns consciousness data for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.profile.findUnique.mockResolvedValue({
      limbicTrust: 0.7,
      limbicWarmth: 0.6,
      limbicArousal: 0.5,
      limbicValence: 0.8,
    });
    mockPrisma.limbicHistory.findMany.mockResolvedValue([]);

    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/consciousness?mode=current');
    const res = await GET(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.thoughts).toBeDefined();
    expect(body.emotions).toBeDefined();
    expect(body.cognition).toBeDefined();
    expect(body.systems).toBeDefined();
  });

  it('returns emotions with correct structure', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.profile.findUnique.mockResolvedValue({
      limbicTrust: 0.9,
      limbicWarmth: 0.8,
      limbicArousal: 0.5,
      limbicValence: 0.7,
    });
    mockPrisma.limbicHistory.findMany.mockResolvedValue([]);

    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/consciousness');
    const res = await GET(req as any);
    const body = await res.json();
    expect(body.emotions.trust).toBe(0.9);
    expect(body.emotions.warmth).toBe(0.8);
    expect(body.emotions.primaryEmotion).toBeDefined();
  });

  it('returns history mode with analysis', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockPrisma.profile.findUnique.mockResolvedValue(null);
    mockPrisma.limbicHistory.findMany.mockResolvedValue([
      { state: { trust: 0.5, warmth: 0.5, arousal: 0.5, valence: 0.5 }, createdAt: new Date('2024-01-01') },
      { state: { trust: 0.6, warmth: 0.6, arousal: 0.5, valence: 0.6 }, createdAt: new Date('2024-01-02') },
    ]);

    const { GET } = await import('./route');
    const req = new Request('http://localhost/api/consciousness?mode=history');
    const res = await GET(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.history).toBeDefined();
    expect(body.analysis).toBeDefined();
    expect(body.analysis.trend).toBeDefined();
  });
});

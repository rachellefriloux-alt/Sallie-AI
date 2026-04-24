import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
    },
    heritageDna: {
      findUnique: vi.fn(),
    },
    memory: {
      findMany: vi.fn(),
    },
    conversation: {
      findMany: vi.fn(),
    },
    limbicHistory: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import {
  getKinshipUsers,
  getKinshipContext,
  getUserHeritageDna,
  getUserIsolatedMemories,
  getUserProfile,
  getUserConversations,
  getUserLimbicHistory,
  switchUserContext,
} from './kinship';

const mockPrisma = prisma as unknown as {
  profile: { findUnique: ReturnType<typeof vi.fn> };
  heritageDna: { findUnique: ReturnType<typeof vi.fn> };
  memory: { findMany: ReturnType<typeof vi.fn> };
  conversation: { findMany: ReturnType<typeof vi.fn> };
  limbicHistory: { findMany: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getKinshipUsers', () => {
  it('returns empty array when profile not found', async () => {
    mockPrisma.profile.findUnique.mockResolvedValue(null);
    const result = await getKinshipUsers('user-1');
    expect(result).toEqual([]);
  });

  it('returns user array when profile exists', async () => {
    mockPrisma.profile.findUnique.mockResolvedValue({
      id: 'user-1',
      displayName: 'Test',
      avatarUrl: null,
      posture: 'Friend',
      createdAt: new Date('2024-01-01'),
    });
    const result = await getKinshipUsers('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('user-1');
    expect(result[0].displayName).toBe('Test');
  });
});

describe('getKinshipContext', () => {
  it('returns owner context when no target', async () => {
    const ctx = await getKinshipContext('owner-1');
    expect(ctx.userId).toBe('owner-1');
    expect(ctx.activeUserId).toBe('owner-1');
    expect(ctx.isOwner).toBe(true);
  });

  it('returns non-owner context with target', async () => {
    const ctx = await getKinshipContext('owner-1', 'other-user');
    expect(ctx.userId).toBe('owner-1');
    expect(ctx.activeUserId).toBe('other-user');
    expect(ctx.isOwner).toBe(false);
  });
});

describe('getUserHeritageDna', () => {
  it('returns null when no DNA found', async () => {
    mockPrisma.heritageDna.findUnique.mockResolvedValue(null);
    const result = await getUserHeritageDna('user-1');
    expect(result).toBeNull();
  });

  it('returns parsed DNA data', async () => {
    mockPrisma.heritageDna.findUnique.mockResolvedValue({
      answers: {
        core: { shield: 'Fortress' },
        preferences: { color: 'blue' },
        learned: ['item1'],
        history: ['event1'],
      },
      completedAt: new Date('2024-06-01'),
      summary: 'Test summary',
    });
    const result = await getUserHeritageDna('user-1');
    expect(result).not.toBeNull();
    expect(result!.core).toEqual({ shield: 'Fortress' });
    expect(result!.preferences).toEqual({ color: 'blue' });
    expect(result!.learned).toEqual(['item1']);
    expect(result!.summary).toBe('Test summary');
  });
});

describe('getUserIsolatedMemories', () => {
  it('returns memories array', async () => {
    const mockMemories = [{ id: 'm1', content: 'test' }];
    mockPrisma.memory.findMany.mockResolvedValue(mockMemories);
    const result = await getUserIsolatedMemories('user-1');
    expect(result).toEqual(mockMemories);
  });
});

describe('getUserProfile', () => {
  it('returns profile when found', async () => {
    const mockProfile = { id: 'user-1', displayName: 'Test' };
    mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);
    const result = await getUserProfile('user-1');
    expect(result).toEqual(mockProfile);
  });

  it('returns null when not found', async () => {
    mockPrisma.profile.findUnique.mockResolvedValue(null);
    const result = await getUserProfile('nonexistent');
    expect(result).toBeNull();
  });
});

describe('getUserConversations', () => {
  it('returns conversations array', async () => {
    const mockConvos = [{ id: 'c1', messages: [] }];
    mockPrisma.conversation.findMany.mockResolvedValue(mockConvos);
    const result = await getUserConversations('user-1');
    expect(result).toEqual(mockConvos);
  });
});

describe('getUserLimbicHistory', () => {
  it('returns limbic history array', async () => {
    const mockHistory = [{ id: 'h1', state: { trust: 0.8 } }];
    mockPrisma.limbicHistory.findMany.mockResolvedValue(mockHistory);
    const result = await getUserLimbicHistory('user-1');
    expect(result).toEqual(mockHistory);
  });
});

describe('switchUserContext', () => {
  it('returns context for target user', async () => {
    const ctx = await switchUserContext('owner-1', 'target-1');
    expect(ctx.userId).toBe('owner-1');
    expect(ctx.activeUserId).toBe('target-1');
    expect(ctx.isOwner).toBe(false);
  });

  it('returns owner context when switching to self', async () => {
    const ctx = await switchUserContext('owner-1', 'owner-1');
    expect(ctx.isOwner).toBe(true);
  });
});

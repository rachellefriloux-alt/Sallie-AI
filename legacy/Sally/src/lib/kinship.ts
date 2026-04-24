import { prisma } from '@/lib/prisma';

export interface KinshipUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  posture: string | null;
  createdAt: Date;
}

export interface KinshipContext {
  userId: string;
  activeUserId: string;
  isOwner: boolean;
}

export async function getKinshipUsers(ownerId: string): Promise<KinshipUser[]> {
  const profile = await prisma.profile.findUnique({
    where: { id: ownerId },
    select: { id: true, displayName: true, avatarUrl: true, posture: true, createdAt: true },
  });

  if (!profile) return [];

  return [
    {
      id: profile.id,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      posture: profile.posture,
      createdAt: profile.createdAt,
    },
  ];
}

export async function getKinshipContext(
  ownerId: string,
  targetUserId?: string
): Promise<KinshipContext> {
  const activeUserId = targetUserId ?? ownerId;
  return {
    userId: ownerId,
    activeUserId,
    isOwner: activeUserId === ownerId,
  };
}

export async function getUserHeritageDna(userId: string) {
  const dna = await prisma.heritageDna.findUnique({
    where: { userId },
    select: { answers: true, completedAt: true, summary: true },
  });

  if (!dna) return null;

  const answers = (dna.answers as Record<string, unknown>) ?? {};
  return {
    core: (answers.core as Record<string, unknown>) ?? {},
    preferences: (answers.preferences as Record<string, unknown>) ?? {},
    learned: Array.isArray(answers.learned) ? answers.learned : [],
    history: Array.isArray(answers.history) ? answers.history : [],
    summary: dna.summary,
    completedAt: dna.completedAt?.toISOString() ?? null,
  };
}

export async function getUserIsolatedMemories(userId: string, limit = 50) {
  const memories = await prisma.memory.findMany({
    where: { actorId: userId },
    orderBy: { lastAccessed: 'desc' },
    take: limit,
  });
  return memories;
}

export async function getUserProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
  });
  return profile;
}

export async function getUserConversations(userId: string, limit = 20) {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
  });
  return conversations;
}

export async function getUserLimbicHistory(userId: string, limit = 20) {
  const history = await prisma.limbicHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return history;
}

export async function switchUserContext(
  ownerId: string,
  targetUserId: string
): Promise<KinshipContext> {
  const ctx = await getKinshipContext(ownerId, targetUserId);
  return ctx;
}

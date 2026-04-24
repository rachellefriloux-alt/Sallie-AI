/**
 * User profile GET (current user) and PATCH (update display name, etc.).
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserDetailFromRequest } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserDetailFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    const [conversationCount] = await Promise.all([
      prisma.conversation.count({ where: { userId: user.id } }),
    ]);

    const email = user.email ?? '';
    const metadata = user.user_metadata ?? {};

    return NextResponse.json({
      id: user.id,
      username: email?.split('@')[0] ?? '',
      email,
      displayName: profile?.displayName ?? metadata?.full_name ?? email?.split('@')[0] ?? 'User',
      avatar: profile?.avatarUrl ?? '',
      bio: '',
      preferences: {
        theme: 'dark',
        language: 'en',
        notifications: true,
        privacy: {
          showOnlineStatus: true,
          showActivity: true,
          allowDataCollection: false,
        },
      },
      stats: {
        joinDate: profile?.createdAt?.toISOString() ?? (user.created_at ?? undefined),
        totalInteractions: 0,
        featuresUsed: 0,
        sessionCount: conversationCount,
      },
    });
  } catch (e) {
    console.error('api/user/profile GET:', e);
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUserDetailFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const displayName =
      typeof body.displayName === 'string' ? body.displayName : undefined;
    const avatar =
      typeof body.avatar === 'string' ? body.avatar : undefined;

    await prisma.profile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        displayName: displayName ?? null,
        avatarUrl: avatar ?? null,
        convergenceCompleted: false,
      },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(avatar !== undefined && { avatarUrl: avatar }),
      },
    });

    const updated = await prisma.profile.findUnique({
      where: { id: user.id },
    });
    const convCount = await prisma.conversation.count({ where: { userId: user.id } });
    const email = user.email ?? '';
    const metadata = user.user_metadata ?? {};
    return NextResponse.json({
      id: user.id,
      username: email?.split('@')[0] ?? '',
      email,
      displayName: updated?.displayName ?? metadata?.full_name ?? email?.split('@')[0] ?? 'User',
      avatar: updated?.avatarUrl ?? '',
      bio: '',
      preferences: body.preferences ?? { theme: 'dark', language: 'en', notifications: true, privacy: { showOnlineStatus: true, showActivity: true, allowDataCollection: false } },
      stats: { joinDate: updated?.createdAt?.toISOString() ?? (user.created_at ?? undefined), totalInteractions: 0, featuresUsed: 0, sessionCount: convCount },
    });
  } catch (e) {
    console.error('api/user/profile PATCH:', e);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// Alias for client that sends PUT
export async function PUT(req: NextRequest) {
  return PATCH(req);
}

/**
 * POST /api/chat/messages/[messageId]/bookmark — Add bookmark.
 * DELETE — Remove bookmark. Persisted in MessageBookmark.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { messageId } = await params;

    const message = await prisma.message.findFirst({
      where: { id: messageId, conversation: { userId: user.id } },
    });
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.messageBookmark.upsert({
      where: { userId_messageId: { userId: user.id, messageId } },
      create: { userId: user.id, messageId },
      update: {},
    });
    return NextResponse.json({ bookmarked: true });
  } catch (e) {
    console.error('api/chat/messages/.../bookmark POST:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { messageId } = await params;

    await prisma.messageBookmark.deleteMany({
      where: { userId: user.id, messageId },
    });
    return NextResponse.json({ bookmarked: false });
  } catch (e) {
    console.error('api/chat/messages/.../bookmark DELETE:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

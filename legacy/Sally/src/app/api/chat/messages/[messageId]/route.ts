/**
 * PUT /api/chat/messages/[messageId] — Update message. DELETE — Delete message.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { messageId } = await params;
    const body = await req.json();
    const content = typeof body.content === 'string' ? body.content : '';

    const message = await prisma.message.findFirst({
      where: { id: messageId, conversation: { userId: user.id } },
    });
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content: content || message.content },
    });

    return NextResponse.json({
      id: updated.id,
      content: updated.content,
      sender: updated.role === 'user' ? 'user' : 'sallie',
      timestamp: updated.createdAt,
      type: 'text',
      threadId: updated.conversationId,
      metadata: { edited: true, editedAt: new Date() },
    });
  } catch (e) {
    console.error('api/chat/messages/[messageId] PUT:', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { messageId } = await params;
    const message = await prisma.message.findFirst({
      where: { id: messageId, conversation: { userId: user.id } },
    });
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.message.delete({ where: { id: messageId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('api/chat/messages/[messageId] DELETE:', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

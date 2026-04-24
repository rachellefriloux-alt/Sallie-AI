import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const memory = await prisma.memory.findFirst({
      where: { id, actorId: user.id },
    });

    if (!memory) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ memory });
  } catch (e) {
    console.error('api/memory/[id] GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.memory.findFirst({
      where: { id, actorId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const memory = await prisma.memory.update({
      where: { id },
      data: {
        content: body.content ?? existing.content,
        tags: body.tags ?? existing.tags,
        metadata: body.metadata ?? existing.metadata,
        salience: body.salience ?? existing.salience,
        accessCount: { increment: 1 },
        lastAccessed: new Date(),
      },
    });

    return NextResponse.json({ memory });
  } catch (e) {
    console.error('api/memory/[id] PUT:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.memory.findFirst({
      where: { id, actorId: user.id },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.memory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('api/memory/[id] DELETE:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

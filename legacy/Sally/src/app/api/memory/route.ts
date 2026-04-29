import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const memories = await prisma.memory.findMany({
      where: { actorId: user.id },
      orderBy: { lastAccessed: 'desc' },
      take: 50,
    });

    return NextResponse.json({ memories });
  } catch (e) {
    console.error('api/memory GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { content, tags, metadata, salience } = body;

    const memory = await prisma.memory.create({
      data: {
        actorId: user.id,
        content: content ?? '',
        tags: tags ?? [],
        metadata: metadata ?? {},
        salience: salience ?? 0.5,
      },
    });

    return NextResponse.json({ memory }, { status: 201 });
  } catch (e) {
    console.error('api/memory POST:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const entries = await prisma.thoughtLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      entries: entries.map((e) => {
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(e.content);
        } catch {
          parsed = { text: e.content };
        }
        return {
          id: e.id,
          content: e.content,
          type: parsed.type ?? 'monologue',
          intensity: parsed.intensity ?? 0.5,
          tags: parsed.tags ?? [],
          timestamp: e.createdAt.toISOString(),
        };
      }),
    });
  } catch (e) {
    console.error('api/monologue/thoughts GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    let contentStr: string;

    if (typeof body.content === 'string' && !body.type && !body.intensity && !body.tags) {
      contentStr = body.content;
    } else {
      contentStr = JSON.stringify({
        text: body.content ?? '',
        type: body.type ?? 'monologue',
        intensity: body.intensity ?? 0.5,
        tags: body.tags ?? [],
      });
    }

    const thought = await prisma.thoughtLog.create({
      data: { userId: user.id, content: contentStr },
    });

    return NextResponse.json({
      id: thought.id,
      content: thought.content,
      timestamp: thought.createdAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    console.error('api/monologue/thoughts POST:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

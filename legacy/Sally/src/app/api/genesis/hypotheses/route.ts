/**
 * GET/POST /api/genesis/hypotheses — Persisted in GenesisHypothesis.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json([]);

    const rows = await prisma.genesisHypothesis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        status: r.status,
        createdAt: r.createdAt,
      }))
    );
  } catch (e) {
    console.error('api/genesis/hypotheses GET:', e);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title : 'Untitled';
    const content = typeof body.content === 'string' ? body.content : '';
    const hypothesis = await prisma.genesisHypothesis.create({
      data: { userId: user.id, title, content, status: 'active' },
    });
    return NextResponse.json({
      id: hypothesis.id,
      title: hypothesis.title,
      content: hypothesis.content,
      status: hypothesis.status,
      createdAt: hypothesis.createdAt,
    });
  } catch (e) {
    console.error('api/genesis/hypotheses POST:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OMNIS_TIERS } from '@/lib/omnis-knowledge';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.knowledgeDomain.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (body.title != null) updates.title = String(body.title);
    if (body.tierId != null) {
      if (!OMNIS_TIERS.some((t) => t.id === body.tierId)) {
        return NextResponse.json({ error: 'invalid tierId' }, { status: 400 });
      }
      updates.tierId = body.tierId;
    }
    if (body.description != null) updates.description = body.description ? String(body.description) : null;
    if (body.expertise != null) updates.expertise = Math.min(100, Math.max(0, Number(body.expertise)));

    if (body.addTopic != null) {
      const current = Array.isArray(existing.topics) ? (existing.topics as string[]) : [];
      const topic = String(body.addTopic).trim();
      if (topic && !current.includes(topic)) {
        updates.topics = [...current, topic];
      }
    } else if (body.topics != null && Array.isArray(body.topics)) {
      updates.topics = body.topics;
    }

    const updated = await prisma.knowledgeDomain.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('knowledge-base PATCH:', e);
    return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 });
  }
}

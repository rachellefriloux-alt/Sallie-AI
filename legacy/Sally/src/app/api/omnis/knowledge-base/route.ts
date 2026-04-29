import { NextResponse } from 'next/server';
import { KNOWLEDGE_DOMAINS, OMNIS_TIERS } from '@/lib/omnis-knowledge';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const staticDomains = KNOWLEDGE_DOMAINS;
  let grownDomains: typeof staticDomains = [];

  try {
    const dbDomains = await prisma.knowledgeDomain.findMany({ orderBy: { createdAt: 'asc' } });
    grownDomains = dbDomains.map((d) => {
      const tier = OMNIS_TIERS.find((t) => t.id === d.tierId) ?? OMNIS_TIERS[0];
      const topics = Array.isArray(d.topics) ? (d.topics as string[]) : [];
      return {
        id: d.id,
        title: d.title,
        tier,
        description: d.description ?? '',
        expertise: d.expertise,
        accessCount: 0,
        topics,
        source: d.source,
      };
    });
  } catch (e) {
    console.warn('Omnis knowledge-base DB read failed:', e);
  }

  return NextResponse.json([...staticDomains, ...grownDomains]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, tierId, description, expertise, topics } = body;

    if (!title || !tierId) {
      return NextResponse.json({ error: 'title and tierId required' }, { status: 400 });
    }

    const tier = OMNIS_TIERS.find((t) => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: 'invalid tierId' }, { status: 400 });
    }

    const domain = await prisma.knowledgeDomain.create({
      data: {
        title: String(title),
        tierId: String(tierId),
        description: description ? String(description) : null,
        expertise: typeof expertise === 'number' ? Math.min(100, Math.max(0, expertise)) : 80,
        topics: Array.isArray(topics) ? topics : [],
        source: body.source ?? 'user',
      },
    });

    return NextResponse.json({
      id: domain.id,
      title: domain.title,
      tierId: domain.tierId,
      description: domain.description,
      expertise: domain.expertise,
      topics: domain.topics,
      createdAt: domain.createdAt,
    });
  } catch (e) {
    console.error('knowledge-base POST:', e);
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 });
  }
}

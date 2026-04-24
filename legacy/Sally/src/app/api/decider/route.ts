import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';
import { analyzeDecision } from '@/lib/sallie-intelligence';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const status = req.nextUrl.searchParams.get('status') || undefined;

    const decisions = await prisma.decision.findMany({
      where: { userId: authUser.id, ...(status && { status }) },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ decisions });
  } catch (error) {
    console.error('Decider GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, factors, domain } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const factorList = factors || [];
    const analysis = await analyzeDecision(authUser.id, title, description || '', factorList);

    const decision = await prisma.decision.create({
      data: {
        userId: authUser.id,
        title,
        description: description || null,
        factors: factorList,
        options: analysis.options,
        analysis: { recommendation: analysis.recommendation },
        domain: domain || 'general',
      },
    });

    return NextResponse.json({ decision, analysis }, { status: 201 });
  } catch (error) {
    console.error('Decider POST error:', error);
    return NextResponse.json({ error: 'Failed to analyze decision' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';
import { extractInsightsFromMessages, saveInsights } from '@/lib/sallie-intelligence';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const category = req.nextUrl.searchParams.get('category') || undefined;

    const insights = await prisma.userInsight.findMany({
      where: { userId: authUser.id, ...(category && { category }) },
      orderBy: [{ confidence: 'desc' }, { frequency: 'desc' }],
    });

    return NextResponse.json({ insights, lastUpdated: insights[0]?.updatedAt || null });
  } catch (error) {
    console.error('Insights GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patterns = await extractInsightsFromMessages(authUser.id);
    if (patterns.length > 0) {
      await saveInsights(authUser.id, patterns);
    }

    return NextResponse.json({
      extracted: patterns.length,
      patterns: patterns.map(p => ({ category: p.category, key: p.key, confidence: p.confidence })),
    });
  } catch (error) {
    console.error('Insights POST error:', error);
    return NextResponse.json({ error: 'Failed to extract insights' }, { status: 500 });
  }
}

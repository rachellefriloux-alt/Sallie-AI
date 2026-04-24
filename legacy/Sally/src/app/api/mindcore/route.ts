import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/api-helpers';
import { buildMindCoreGraph } from '@/lib/sallie-intelligence';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req);
    if (!authUser?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const nodes = await buildMindCoreGraph(authUser.id);

    const categories = nodes.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      nodes,
      totalNodes: nodes.length,
      categories,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('MindCore GET error:', error);
    return NextResponse.json({ error: 'Failed to build MindCore graph' }, { status: 500 });
  }
}

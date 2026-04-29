import { NextRequest, NextResponse } from 'next/server';
import {
  logAction,
  getRecentActions,
  getLogStats,
  type AdvisoryLevel,
} from '@/lib/transparency-log';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') ?? '100', 10);
    const category = url.searchParams.get('category') ?? undefined;
    const userId = url.searchParams.get('userId') ?? undefined;
    const advisoryLevel = (url.searchParams.get('advisoryLevel') as AdvisoryLevel) ?? undefined;
    const includeStats = url.searchParams.get('stats') === 'true';

    const actions = getRecentActions({ limit, category, userId, advisoryLevel });

    const response: Record<string, unknown> = { actions };
    if (includeStats) {
      response.stats = getLogStats();
    }

    return NextResponse.json(response);
  } catch (e) {
    console.error('api/transparency/log GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, category, args, result, advisoryLevel, rollbackAvailable, userId } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'action is required and must be a string' }, { status: 400 });
    }
    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'category is required and must be a string' }, { status: 400 });
    }

    const validLevels: AdvisoryLevel[] = ['safe', 'caution', 'warning'];
    if (advisoryLevel && !validLevels.includes(advisoryLevel)) {
      return NextResponse.json(
        { error: `advisoryLevel must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    const entry = logAction({
      action,
      category,
      args: args ?? {},
      result: result ?? 'success',
      advisoryLevel: advisoryLevel ?? 'safe',
      rollbackAvailable: rollbackAvailable ?? false,
      userId: userId ?? 'anonymous',
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (e) {
    console.error('api/transparency/log POST:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

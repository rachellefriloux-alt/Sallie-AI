import { NextRequest, NextResponse } from 'next/server';
import { getAllActions, getAvailableActions, getCategories, type ActionPlatform } from '@/lib/device-actions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = (searchParams.get('platform') || 'web') as ActionPlatform;
    const category = searchParams.get('category');
    const all = searchParams.get('all') === 'true';

    let actions = all ? getAllActions() : getAvailableActions(platform);

    if (category) {
      actions = actions.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }

    const categories = getCategories();

    const summary = {
      total: actions.length,
      available: actions.filter((a) => a.status === 'available').length,
      needsNative: actions.filter((a) => a.status === 'needs-native').length,
      unavailable: actions.filter((a) => a.status === 'unavailable').length,
    };

    return NextResponse.json({
      platform,
      categories,
      actions: actions.map(({ executeWeb, ...rest }) => rest),
      summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: `Failed to list actions: ${message}` },
      { status: 500 }
    );
  }
}

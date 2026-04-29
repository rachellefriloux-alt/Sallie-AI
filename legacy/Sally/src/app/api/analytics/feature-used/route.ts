/**
 * POST /api/analytics/feature-used — Track feature usage. Accepts and returns 200 (no-op for now).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await req.json().catch(() => ({}));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('api/analytics/feature-used:', e);
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 });
  }
}

/**
 * POST /api/genesis/dream-cycle/stop
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ active: false });
  } catch (e) {
    console.error('api/genesis/dream-cycle/stop:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

/**
 * GET /api/settings — Load user app settings from UserPreference.
 * PATCH /api/settings — Persist app settings to UserPreference.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, getPreference, setPreference } from '@/lib/api-helpers';

const KEY = 'app_settings';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const value = await getPreference<Record<string, unknown>>(user.id, KEY);
    return NextResponse.json(value ?? {});
  } catch (e) {
    console.error('api/settings GET:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const settings = body?.settings ?? body;
    if (typeof settings !== 'object' || settings === null) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }
    await setPreference(user.id, KEY, settings);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('api/settings PATCH:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

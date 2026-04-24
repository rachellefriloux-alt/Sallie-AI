/**
 * POST /api/avatar/customize — Persist avatar customization in UserPreference.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, setPreference } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const customization =
      typeof body === 'object' && body !== null
        ? {
            species: body.species,
            colors: Array.isArray(body.colors) ? body.colors : [],
            accessories: Array.isArray(body.accessories) ? body.accessories : [],
            animations: Array.isArray(body.animations) ? body.animations : [],
            backgrounds: Array.isArray(body.backgrounds) ? body.backgrounds : [],
          }
        : {};
    await setPreference(user.id, 'avatar_customization', customization);
    return NextResponse.json({ ...customization, ok: true });
  } catch (e) {
    console.error('api/avatar/customize:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

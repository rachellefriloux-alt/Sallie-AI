/**
 * POST /api/avatar/change-form — Persist avatar form in UserPreference.
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
    const form = (body.form ?? body.form_id ?? 'default') as string;
    await setPreference(user.id, 'avatar_form', form);
    return NextResponse.json({ form, current_form: form, ok: true });
  } catch (e) {
    console.error('api/avatar/change-form:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

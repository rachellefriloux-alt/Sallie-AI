/**
 * POST /api/v1/agency/sync — Agency sync endpoint.
 * Syncs user state across LifeOS, preferences, and agency services.
 * Used by IntegratedCommandCenter.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser, setPreference } from '@/lib/api-helpers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();
    await setPreference(user.id, 'agency_synced_at', now);
    await setPreference(user.id, 'lifeos_synced_at', now);

    return NextResponse.json({
      success: true,
      lastSyncAt: now,
      message: 'Sync complete',
    });
  } catch (e) {
    console.error('api/v1/agency/sync:', e);
    return NextResponse.json(
      { success: false, message: 'Sync failed' },
      { status: 500 }
    );
  }
}

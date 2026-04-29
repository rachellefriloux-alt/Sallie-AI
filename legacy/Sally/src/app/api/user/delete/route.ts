/**
 * Account deletion: removes all user data, storage objects, then deletes auth user (service role).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    await prisma.$transaction([
      prisma.message.deleteMany({ where: { conversation: { userId } } }),
      prisma.conversation.deleteMany({ where: { userId } }),
      prisma.streakHistory.deleteMany({ where: { userId } }),
      prisma.heritageDna.deleteMany({ where: { userId } }),
      prisma.profile.deleteMany({ where: { id: userId } }),
    ]);

    try {
      const admin = createAdminClient();
      const { data: files } = await admin.storage.from('avatars').list(userId);
      if (files?.length) {
        const names = files.map((f) => `${userId}/${f.name}`);
        await admin.storage.from('avatars').remove(names);
      }
    } catch {
      // Storage cleanup best-effort
    }

    try {
      const admin = createAdminClient();
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) {
        console.error('Auth delete error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to delete account' },
          { status: 500 }
        );
      }
    } catch (e) {
      console.error('Auth admin delete:', e);
      return NextResponse.json(
        { error: 'Server configuration error. Set SUPABASE_SERVICE_ROLE_KEY for account deletion.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('api/user/delete:', e);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

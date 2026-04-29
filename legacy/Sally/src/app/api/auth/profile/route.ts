import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    return NextResponse.json({
      id: user.id,
      email: user.email,
      displayName: profile?.displayName ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
    });
  } catch (e) {
    console.error('api/auth/profile:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

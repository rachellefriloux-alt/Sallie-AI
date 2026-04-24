/**
 * PUT /api/heritage/[section] — Update a heritage section (core, preferences, learned, history).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const ALLOWED_SECTIONS = ['core', 'preferences', 'learned', 'history'];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;
    if (!ALLOWED_SECTIONS.includes(section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();

    const existing = await prisma.heritageDna.findUnique({
      where: { userId: user.id },
      select: { answers: true },
    });

    const answers = (existing?.answers as Record<string, unknown>) ?? {};
    const next = { ...answers, [section]: updates };

    await prisma.heritageDna.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        answers: next,
      },
      update: { answers: next },
    });

    return NextResponse.json(updates);
  } catch (e) {
    console.error('api/heritage/[section]:', e);
    return NextResponse.json({ error: 'Failed to update heritage' }, { status: 500 });
  }
}

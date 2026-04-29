/**
 * GET /api/heritage/dna — Heritage DNA for the current user (core, preferences, learned, history).
 * POST /api/heritage/dna — Save/update heritage DNA answers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

function buildDnaResponse(dna: { answers: unknown; completedAt: Date | null } | null) {
  const answers = (dna?.answers as Record<string, unknown>) ?? {};
  const core = (answers.core as Record<string, unknown>) ?? {};
  const preferences = (answers.preferences as Record<string, unknown>) ?? {};
  const learned = Array.isArray(answers.learned) ? answers.learned : [];
  const history = Array.isArray(answers.history) ? answers.history : [];

  return {
    core,
    preferences,
    learned,
    history,
    completedAt: dna?.completedAt?.toISOString() ?? null,
  };
}

export async function GET() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(buildDnaResponse(null));
    }

    const dna = await prisma.heritageDna.findUnique({
      where: { userId },
      select: { answers: true, completedAt: true },
    });

    return NextResponse.json(buildDnaResponse(dna));
  } catch (e) {
    console.error('api/heritage/dna GET:', e);
    return NextResponse.json(buildDnaResponse(null));
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { core, preferences, learned, history } = body;

    const answers: Record<string, unknown> = {};
    if (core !== undefined) answers.core = core;
    if (preferences !== undefined) answers.preferences = preferences;
    if (learned !== undefined) answers.learned = learned;
    if (history !== undefined) answers.history = history;

    const existing = await prisma.heritageDna.findUnique({
      where: { userId },
      select: { answers: true },
    });

    const mergedAnswers = {
      ...((existing?.answers as Record<string, unknown>) ?? {}),
      ...answers,
    };

    const dna = await prisma.heritageDna.upsert({
      where: { userId },
      update: {
        answers: JSON.parse(JSON.stringify(mergedAnswers)),
        completedAt: body.complete ? new Date() : undefined,
      },
      create: {
        userId,
        answers: JSON.parse(JSON.stringify(mergedAnswers)),
        completedAt: body.complete ? new Date() : null,
      },
    });

    return NextResponse.json(buildDnaResponse({
      answers: dna.answers,
      completedAt: dna.completedAt,
    }));
  } catch (e) {
    console.error('api/heritage/dna POST:', e);
    return NextResponse.json({ error: 'Failed to save heritage DNA' }, { status: 500 });
  }
}

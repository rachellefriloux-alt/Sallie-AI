import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

function getTrustTier(limbicTrust: number): { tier: string; capabilities: string[] } {
  if (limbicTrust >= 0.9) {
    return {
      tier: 'Full Partner',
      capabilities: [
        'Autonomous decision-making',
        'Proactive suggestions',
        'Memory consolidation',
        'Schedule management',
        'Financial oversight',
        'Creative collaboration',
        'System administration',
      ],
    };
  }
  if (limbicTrust >= 0.8) {
    return {
      tier: 'Partner',
      capabilities: [
        'Proactive suggestions',
        'Memory consolidation',
        'Schedule management',
        'Creative collaboration',
        'Task automation',
      ],
    };
  }
  if (limbicTrust >= 0.6) {
    return {
      tier: 'Associate',
      capabilities: [
        'Contextual suggestions',
        'Memory recall',
        'Basic task assistance',
        'Conversation support',
      ],
    };
  }
  return {
    tier: 'Stranger',
    capabilities: [
      'Basic conversation',
      'Information lookup',
      'Simple reminders',
    ],
  };
}

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [profile, recentActions] = await Promise.all([
      prisma.profile.findUnique({ where: { id: user.id } }),
      prisma.controlLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const trust = profile?.limbicTrust ? Number(profile.limbicTrust) : 0.5;
    const { tier, capabilities } = getTrustTier(trust);
    const limbicState = (profile?.limbicState as Record<string, unknown>) ?? {};

    return NextResponse.json({
      trustTier: tier,
      trustLevel: trust,
      capabilities,
      recentActions: recentActions.map((a) => ({
        id: a.id,
        action: a.action,
        metadata: a.metadata,
        createdAt: a.createdAt.toISOString(),
      })),
      autonomyLevel: limbicState.autonomyLevel ?? limbicState.autonomy_level ?? 'moderate',
      status: recentActions.length > 0 ? 'active' : 'idle',
    });
  } catch (e) {
    console.error('api/agency/status GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, metadata } = body;

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'action is required' }, { status: 400 });
    }

    const log = await prisma.controlLog.create({
      data: {
        userId: user.id,
        action,
        metadata: metadata ?? {},
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (e) {
    console.error('api/agency/status POST:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

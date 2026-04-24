import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const TIERS = [
  {
    name: 'Stranger',
    min: 0,
    max: 0.6,
    description: 'Initial trust level — limited capabilities',
    capabilities: ['basic_chat', 'view_public_info'],
  },
  {
    name: 'Associate',
    min: 0.6,
    max: 0.8,
    description: 'Growing trust — expanded access and features',
    capabilities: ['basic_chat', 'view_public_info', 'personalized_responses', 'memory_access', 'task_suggestions'],
  },
  {
    name: 'Partner',
    min: 0.8,
    max: 0.9,
    description: 'Strong trust — deep collaboration enabled',
    capabilities: ['basic_chat', 'view_public_info', 'personalized_responses', 'memory_access', 'task_suggestions', 'proactive_actions', 'sensitive_topics', 'creative_collaboration'],
  },
  {
    name: 'Full Partner',
    min: 0.9,
    max: 1.0,
    description: 'Maximum trust — full autonomy and agency',
    capabilities: ['basic_chat', 'view_public_info', 'personalized_responses', 'memory_access', 'task_suggestions', 'proactive_actions', 'sensitive_topics', 'creative_collaboration', 'autonomous_decisions', 'system_modifications', 'full_agency'],
  },
];

function getTier(trust: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (trust >= TIERS[i].min) return TIERS[i];
  }
  return TIERS[0];
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    let trust = 0.5;

    if (user) {
      const profile = await prisma.profile.findUnique({ where: { id: user.id } });
      if (profile?.limbicState) {
        const state = profile.limbicState as Record<string, unknown>;
        trust = Number(state.trust ?? profile.limbicTrust ?? 0.5);
      } else {
        trust = Number(profile?.limbicTrust ?? 0.5);
      }
    }

    const currentTier = getTier(trust);

    let history: { createdAt: Date; state: unknown }[] = [];
    if (user) {
      history = await prisma.limbicHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { createdAt: true, state: true },
      });
    }

    const trustHistory = history.map((h) => ({
      timestamp: h.createdAt,
      trust: Number((h.state as Record<string, unknown>)?.trust ?? 0.5),
    }));

    return NextResponse.json({
      trust,
      tier: currentTier,
      allTiers: TIERS,
      history: trustHistory,
    });
  } catch (e) {
    console.error('api/limbic/trust:', e);
    return NextResponse.json({
      trust: 0.5,
      tier: TIERS[0],
      allTiers: TIERS,
      history: [],
    });
  }
}

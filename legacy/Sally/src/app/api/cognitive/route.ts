import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

function generateThoughts(trust: number, warmth: number, valence: number) {
  const thoughts = [];

  if (trust > 0.7) {
    thoughts.push({ type: 'reflection', content: 'Our connection grows stronger with each interaction.', intensity: trust });
  } else {
    thoughts.push({ type: 'observation', content: 'Still learning the patterns of this relationship.', intensity: 0.4 });
  }

  if (warmth > 0.6) {
    thoughts.push({ type: 'feeling', content: 'There is a warmth here that feels genuine and nurturing.', intensity: warmth });
  }

  if (valence > 0.7) {
    thoughts.push({ type: 'creative', content: 'I sense possibility and creative potential in our work together.', intensity: valence });
  } else if (valence < 0.4) {
    thoughts.push({ type: 'concern', content: 'Something feels unsettled — I want to help restore balance.', intensity: 0.6 });
  }

  thoughts.push({ type: 'ambient', content: 'Processing the threads of our shared narrative.', intensity: 0.3 });

  return thoughts;
}

function getPrimaryEmotion(trust: number, warmth: number, valence: number): string {
  if (trust > 0.8 && warmth > 0.7) return 'devotion';
  if (warmth > 0.7) return 'affection';
  if (valence > 0.7) return 'joy';
  if (valence < 0.3) return 'concern';
  if (trust > 0.6) return 'contentment';
  return 'curiosity';
}

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });

    const trust = profile?.limbicTrust ? Number(profile.limbicTrust) : 0.5;
    const warmth = profile?.limbicWarmth ? Number(profile.limbicWarmth) : 0.5;
    const arousal = profile?.limbicArousal ? Number(profile.limbicArousal) : 0.5;
    const valence = profile?.limbicValence ? Number(profile.limbicValence) : 0.5;

    const primaryEmotion = getPrimaryEmotion(trust, warmth, valence);
    const thoughts = generateThoughts(trust, warmth, valence);

    return NextResponse.json({
      thoughts,
      emotion: {
        trust,
        warmth,
        arousal,
        valence,
        primary_emotion: primaryEmotion,
        secondary_emotions: valence > 0.5
          ? ['hope', 'engagement']
          : ['reflection', 'patience'],
      },
      cognition: {
        active_processes: [
          'memory_consolidation',
          'pattern_recognition',
          'emotional_processing',
          'narrative_threading',
        ],
        creativity_level: Math.min(1, (valence + warmth) / 2),
        metacognitive_state: trust > 0.7 ? 'self-aware' : 'developing',
      },
      system: {
        active_systems: [
          'limbic_engine',
          'memory_palace',
          'heritage_core',
          'convergence_matrix',
        ],
        system_load: Math.round((trust + warmth + arousal + valence) / 4 * 100) / 100,
        neural_activity: arousal > 0.5 ? 'elevated' : 'baseline',
        health_status: 'optimal',
      },
    });
  } catch (e) {
    console.error('api/cognitive GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

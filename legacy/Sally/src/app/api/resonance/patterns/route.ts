import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [thoughtLogs, messages, profile] = await Promise.all([
      prisma.thoughtLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.message.findMany({
        where: {
          conversation: { userId: user.id },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.profile.findUnique({ where: { id: user.id } }),
    ]);

    const trust = profile?.limbicTrust ? Number(profile.limbicTrust) : 0.5;
    const warmth = profile?.limbicWarmth ? Number(profile.limbicWarmth) : 0.5;

    const overallAlignment = Math.min(1, (trust + warmth) / 2);

    const userMessages = messages.filter((m) => m.role === 'user');
    const assistantMessages = messages.filter((m) => m.role === 'assistant');

    const moments = [];
    const pairCount = Math.min(userMessages.length, assistantMessages.length, 5);
    for (let i = 0; i < pairCount; i++) {
      const uMsg = userMessages[i];
      const aMsg = assistantMessages[i];
      const score = Math.min(1, 0.5 + (trust * 0.3) + (Math.random() * 0.2));
      moments.push({
        user_thought: uMsg.content.slice(0, 100),
        sallie_thought: aMsg.content.slice(0, 100),
        score: Math.round(score * 100) / 100,
        type: score > 0.8 ? 'deep_resonance' : score > 0.6 ? 'alignment' : 'exploration',
        timestamp: uMsg.createdAt.toISOString(),
      });
    }

    const patterns = [];
    if (thoughtLogs.length > 5) {
      patterns.push({
        name: 'Reflective Cycles',
        description: 'Regular patterns of introspective thought and self-examination.',
        frequency: Math.min(1, thoughtLogs.length / 30),
        confidence: Math.min(1, 0.5 + thoughtLogs.length * 0.02),
      });
    }
    if (messages.length > 10) {
      patterns.push({
        name: 'Conversational Depth',
        description: 'Increasing depth and nuance in dialogue exchanges.',
        frequency: Math.min(1, messages.length / 50),
        confidence: Math.min(1, trust * 0.8 + 0.2),
      });
    }
    if (trust > 0.7) {
      patterns.push({
        name: 'Trust Spiral',
        description: 'A positive feedback loop of mutual trust and openness.',
        frequency: 0.8,
        confidence: trust,
      });
    }
    if (warmth > 0.6) {
      patterns.push({
        name: 'Emotional Attunement',
        description: 'Growing sensitivity to emotional cues and responsive warmth.',
        frequency: 0.7,
        confidence: warmth,
      });
    }

    return NextResponse.json({
      overallAlignment: Math.round(overallAlignment * 100) / 100,
      moments,
      patterns,
    });
  } catch (e) {
    console.error('api/resonance/patterns GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

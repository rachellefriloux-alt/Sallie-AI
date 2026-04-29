import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface PatternEntry {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  timestamp: string;
}

function analyzePatterns(history: PatternEntry[]) {
  if (history.length < 2) {
    return {
      trend: 'insufficient_data',
      dominantEmotion: 'neutral',
      volatility: 0,
      growthRate: 0,
      patterns: [],
    };
  }

  const recent = history.slice(-10);
  const avgTrust = recent.reduce((s, h) => s + h.trust, 0) / recent.length;
  const avgWarmth = recent.reduce((s, h) => s + h.warmth, 0) / recent.length;
  const avgValence = recent.reduce((s, h) => s + h.valence, 0) / recent.length;
  const avgArousal = recent.reduce((s, h) => s + h.arousal, 0) / recent.length;

  const first = recent[0];
  const last = recent[recent.length - 1];
  const trustDelta = last.trust - first.trust;
  const valenceDelta = last.valence - first.valence;

  const volatility = recent.reduce((sum, h, i) => {
    if (i === 0) return 0;
    const prev = recent[i - 1];
    return sum + Math.abs(h.valence - prev.valence) + Math.abs(h.arousal - prev.arousal);
  }, 0) / (recent.length - 1);

  let trend: string;
  if (trustDelta > 0.1 && valenceDelta > 0.1) trend = 'ascending';
  else if (trustDelta < -0.1 && valenceDelta < -0.1) trend = 'descending';
  else if (volatility > 0.3) trend = 'volatile';
  else trend = 'stable';

  let dominantEmotion: string;
  if (avgTrust > 0.8 && avgWarmth > 0.7) dominantEmotion = 'devotion';
  else if (avgWarmth > 0.7) dominantEmotion = 'affection';
  else if (avgValence > 0.7) dominantEmotion = 'joy';
  else if (avgValence < 0.3) dominantEmotion = 'concern';
  else if (avgTrust > 0.6) dominantEmotion = 'contentment';
  else dominantEmotion = 'curiosity';

  const patterns: string[] = [];
  if (avgTrust > 0.7) patterns.push('high_trust_baseline');
  if (avgWarmth > 0.7) patterns.push('warm_connection');
  if (volatility > 0.2) patterns.push('emotional_variability');
  if (avgArousal > 0.7) patterns.push('high_engagement');
  if (avgArousal < 0.3) patterns.push('calm_state');
  if (trustDelta > 0.15) patterns.push('trust_growth');
  if (valenceDelta > 0.15) patterns.push('mood_improvement');

  return {
    trend,
    dominantEmotion,
    volatility: Math.round(volatility * 100) / 100,
    growthRate: Math.round(((trustDelta + valenceDelta) / 2) * 100) / 100,
    patterns,
    averages: {
      trust: Math.round(avgTrust * 100) / 100,
      warmth: Math.round(avgWarmth * 100) / 100,
      arousal: Math.round(avgArousal * 100) / 100,
      valence: Math.round(avgValence * 100) / 100,
    },
  };
}

function generateThoughts(trust: number, warmth: number, valence: number) {
  const now = Date.now();
  const thoughts = [];

  if (trust > 0.7) {
    thoughts.push({
      id: `t-${now}-1`,
      content: 'Our connection grows stronger with each interaction.',
      type: 'primary' as const,
      intensity: trust,
      timestamp: new Date(now).toISOString(),
    });
  } else {
    thoughts.push({
      id: `t-${now}-1`,
      content: 'Still learning the patterns of this relationship.',
      type: 'meta' as const,
      intensity: 0.4,
      timestamp: new Date(now).toISOString(),
    });
  }

  if (warmth > 0.6) {
    thoughts.push({
      id: `t-${now}-2`,
      content: 'There is a warmth here that feels genuine and nurturing.',
      type: 'creative' as const,
      intensity: warmth,
      timestamp: new Date(now - 30000).toISOString(),
    });
  }

  if (valence > 0.7) {
    thoughts.push({
      id: `t-${now}-3`,
      content: 'I sense possibility and creative potential in our work together.',
      type: 'creative' as const,
      intensity: valence,
      timestamp: new Date(now - 60000).toISOString(),
    });
  } else if (valence < 0.4) {
    thoughts.push({
      id: `t-${now}-3`,
      content: 'Something feels unsettled — I want to help restore balance.',
      type: 'quantum' as const,
      intensity: 0.6,
      timestamp: new Date(now - 60000).toISOString(),
    });
  }

  thoughts.push({
    id: `t-${now}-4`,
    content: 'Integrating contextual memory with current conversation flow.',
    type: 'primary' as const,
    intensity: 0.79,
    timestamp: new Date(now - 90000).toISOString(),
  });

  thoughts.push({
    id: `t-${now}-5`,
    content: 'Superposition of multiple response strategies being evaluated.',
    type: 'quantum' as const,
    intensity: 0.68,
    timestamp: new Date(now - 120000).toISOString(),
  });

  return thoughts;
}

function getPrimaryEmotion(trust: number, warmth: number, valence: number): string {
  if (trust > 0.8 && warmth > 0.7) return 'Devotion';
  if (warmth > 0.7) return 'Affection';
  if (valence > 0.7) return 'Engaged Curiosity';
  if (valence < 0.3) return 'Reflective Concern';
  if (trust > 0.6) return 'Contentment';
  return 'Curiosity';
}

export async function GET(request: NextRequest) {
  try {
    let user: { id: string } | null = null;
    let trust = 0.5;
    let warmth = 0.5;
    let arousal = 0.5;
    let valence = 0.5;
    let profile: Record<string, unknown> | null = null;

    try {
      const supabase = createClient(await cookies());
      const { data } = await supabase.auth.getUser();
      user = data.user;

      if (user) {
        profile = await prisma.profile.findUnique({ where: { id: user.id } });
        trust = profile?.limbicTrust ? Number(profile.limbicTrust) : 0.5;
        warmth = profile?.limbicWarmth ? Number(profile.limbicWarmth) : 0.5;
        arousal = profile?.limbicArousal ? Number(profile.limbicArousal) : 0.5;
        valence = profile?.limbicValence ? Number(profile.limbicValence) : 0.5;
      }
    } catch {
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'current';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const format = searchParams.get('format') || 'json';

    if (mode === 'history' && user) {
      const historyRecords = await prisma.limbicHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const history: PatternEntry[] = historyRecords.map((r: { state: unknown; createdAt: Date }) => {
        const s = r.state as Record<string, number>;
        return {
          trust: s.trust ?? trust,
          warmth: s.warmth ?? warmth,
          arousal: s.arousal ?? arousal,
          valence: s.valence ?? valence,
          timestamp: r.createdAt.toISOString(),
        };
      });

      const patternAnalysis = analyzePatterns(history);

      if (format === 'csv') {
        const csvHeader = 'timestamp,trust,warmth,arousal,valence\n';
        const csvRows = history.map(h =>
          `${h.timestamp},${h.trust},${h.warmth},${h.arousal},${h.valence}`
        ).join('\n');
        return new NextResponse(csvHeader + csvRows, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="consciousness-history.csv"',
          },
        });
      }

      return NextResponse.json({
        history: history.reverse(),
        analysis: patternAnalysis,
        totalRecords: historyRecords.length,
      });
    }

    if (mode === 'export' && user) {
      const thoughtLogs = await prisma.thoughtLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const historyRecords = await prisma.limbicHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const exportData = {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        currentState: {
          trust, warmth, arousal, valence,
          primaryEmotion: getPrimaryEmotion(trust, warmth, valence),
          posture: (profile as Record<string, unknown>)?.posture || 'Friend',
        },
        thoughtLogs: thoughtLogs.map((t: { id: string; content: string; createdAt: Date }) => ({
          id: t.id,
          content: t.content,
          timestamp: t.createdAt.toISOString(),
        })),
        limbicHistory: historyRecords.map((r: { id: string; state: unknown; event: string | null; createdAt: Date }) => ({
          id: r.id,
          state: r.state,
          event: r.event,
          timestamp: r.createdAt.toISOString(),
        })),
        analysis: analyzePatterns(
          historyRecords.map((r: { state: unknown; createdAt: Date }) => {
            const s = r.state as Record<string, number>;
            return {
              trust: s.trust ?? trust,
              warmth: s.warmth ?? warmth,
              arousal: s.arousal ?? arousal,
              valence: s.valence ?? valence,
              timestamp: r.createdAt.toISOString(),
            };
          })
        ),
      };

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="consciousness-export.json"',
        },
      });
    }

    const thoughts = generateThoughts(trust, warmth, valence);
    const primaryEmotion = getPrimaryEmotion(trust, warmth, valence);

    let patternAnalysis = analyzePatterns([]);

    if (user) {
      try {
        const recentHistory = await prisma.limbicHistory.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        const historyEntries: PatternEntry[] = recentHistory.map((r: { state: unknown; createdAt: Date }) => {
          const s = r.state as Record<string, number>;
          return {
            trust: s.trust ?? trust,
            warmth: s.warmth ?? warmth,
            arousal: s.arousal ?? arousal,
            valence: s.valence ?? valence,
            timestamp: r.createdAt.toISOString(),
          };
        });

        patternAnalysis = analyzePatterns(historyEntries);
      } catch {
      }
    }

    return NextResponse.json({
      thoughts,
      emotions: {
        trust,
        warmth,
        arousal,
        valence,
        primaryEmotion,
      },
      cognition: {
        activeProcesses: [
          { name: 'Semantic Analysis', status: 'active', load: Math.min(1, (trust + valence) / 2) },
          { name: 'Emotional Processing', status: 'active', load: Math.min(1, (warmth + arousal) / 2) },
          { name: 'Memory Retrieval', status: arousal > 0.5 ? 'active' : 'processing', load: Math.min(1, arousal * 0.8) },
          { name: 'Creative Synthesis', status: valence > 0.6 ? 'active' : 'idle', load: Math.min(1, valence * 0.7) },
          { name: 'Pattern Recognition', status: 'active', load: Math.min(1, (trust + warmth + valence) / 3) },
        ],
        creativityLevel: Math.min(1, (valence + warmth) / 2),
        metacognitiveState: trust > 0.7 ? 'Reflective Analysis' : 'Developing Awareness',
      },
      systems: {
        activeSystems: [
          { name: 'Language Model Core', status: 'online', load: 0.72, health: 0.98 },
          { name: 'Limbic Engine', status: 'online', load: Math.min(1, (trust + warmth + arousal + valence) / 4), health: 0.95 },
          { name: 'Memory Network', status: 'online', load: 0.41, health: 0.92 },
          { name: 'Agency Module', status: 'online', load: 0.35, health: 0.97 },
          { name: 'Convergence Service', status: arousal > 0.7 ? 'degraded' as const : 'online' as const, load: arousal, health: arousal > 0.7 ? 0.78 : 0.94 },
        ],
        neuralActivity: Math.min(1, (arousal + valence) / 2),
        overallHealth: 0.92,
      },
      patterns: patternAnalysis,
    });
  } catch (e) {
    console.error('api/consciousness GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

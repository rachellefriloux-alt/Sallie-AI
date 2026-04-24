import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/api-helpers';
import { generateProactiveNudges, extractInsightsFromMessages, saveInsights } from '@/lib/sallie-intelligence';

function getTimeBasedNudges(): { id: string; type: string; priority: string; title: string; message: string; source: string }[] {
  const hour = new Date().getHours();
  const nudges: { id: string; type: string; priority: string; title: string; message: string; source: string }[] = [];

  if (hour >= 6 && hour < 9) {
    nudges.push({
      id: `morning_${Date.now()}`,
      type: 'checkin',
      priority: 'medium',
      title: "Morning, love",
      message: "New day, new slate. What's the ONE thing that would make today feel like a win?",
      source: 'time_aware',
    });
  } else if (hour >= 12 && hour < 14) {
    nudges.push({
      id: `midday_${Date.now()}`,
      type: 'checkin',
      priority: 'low',
      title: "Midday check",
      message: "Halfway through. Did you eat something? Drink water? Protect your energy before someone else spends it.",
      source: 'time_aware',
    });
  } else if (hour >= 15 && hour < 17) {
    nudges.push({
      id: `afternoon_${Date.now()}`,
      type: 'motivation',
      priority: 'low',
      title: "Afternoon pulse",
      message: "Afternoon slump is real. Pick ONE more thing to finish before you wind down. Then stop. You've earned it.",
      source: 'time_aware',
    });
  } else if (hour >= 21 && hour < 23) {
    nudges.push({
      id: `evening_${Date.now()}`,
      type: 'reflection',
      priority: 'medium',
      title: "Wind down",
      message: "Day's almost done. What went right today? Name one thing. Even a small thing counts.",
      source: 'time_aware',
    });
  }

  return nudges;
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserFromRequest(req).catch(() => null);

    if (!authUser?.id) {
      const nudges = getTimeBasedNudges();
      return NextResponse.json({
        nudges,
        count: nudges.length,
        timestamp: Date.now(),
      });
    }

    const refresh = req.nextUrl.searchParams.get('refresh') === 'true';

    if (refresh) {
      try {
        const patterns = await extractInsightsFromMessages(authUser.id);
        if (patterns.length > 0) {
          await saveInsights(authUser.id, patterns);
        }
      } catch {
      }
    }

    const nudges = await generateProactiveNudges(authUser.id);

    return NextResponse.json({
      nudges,
      count: nudges.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Proactive GET error:', error);
    const fallback = getTimeBasedNudges();
    return NextResponse.json({ nudges: fallback, count: fallback.length, timestamp: Date.now() });
  }
}

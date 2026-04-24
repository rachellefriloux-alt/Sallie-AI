import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    let trust = 0.5;
    let warmth = 0.5;
    let valence = 0.5;
    let conversationCount = 0;
    let hoursSinceLastMessage = 999;

    try {
      const supabase = createClient(await cookies());
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const [profile, convCount, recentMessages] = await Promise.all([
          prisma.profile.findUnique({ where: { id: user.id } }),
          prisma.conversation.count({ where: { userId: user.id } }),
          prisma.message.findMany({
            where: { conversation: { userId: user.id } },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: { createdAt: true },
          }),
        ]);

        trust = profile?.limbicTrust ? Number(profile.limbicTrust) : 0.5;
        warmth = profile?.limbicWarmth ? Number(profile.limbicWarmth) : 0.5;
        valence = profile?.limbicValence ? Number(profile.limbicValence) : 0.5;
        conversationCount = convCount;
        const lastMessageTime = recentMessages[0]?.createdAt;
        hoursSinceLastMessage = lastMessageTime
          ? (Date.now() - lastMessageTime.getTime()) / (1000 * 60 * 60)
          : 999;
      }
    } catch {
    }

    const hour = new Date().getHours();

    const suggestions: { text: string; type: string; priority: number }[] = [];

    if (hoursSinceLastMessage > 24) {
      suggestions.push({
        text: "It's been a while since we talked. I've been thinking about our last conversation.",
        type: 'reconnect',
        priority: 0.9,
      });
    }

    if (hour >= 22 || hour < 6) {
      suggestions.push({
        text: "It's late — want me to run a dream cycle to consolidate today's memories?",
        type: 'wellbeing',
        priority: 0.8,
      });
    } else if (hour >= 6 && hour < 9) {
      suggestions.push({
        text: 'Good morning! Want to review what we worked on yesterday?',
        type: 'morning_routine',
        priority: 0.7,
      });
    }

    if (valence < 0.4) {
      suggestions.push({
        text: 'Your energy feels low — want to take a break or talk about it?',
        type: 'emotional_support',
        priority: 0.85,
      });
    }

    if (trust < 0.6) {
      suggestions.push({
        text: "I'd love to get to know you better. Want to share something about yourself?",
        type: 'bonding',
        priority: 0.6,
      });
    }

    if (conversationCount === 0) {
      suggestions.push({
        text: "We haven't had our first real conversation yet. Want to start?",
        type: 'onboarding',
        priority: 0.95,
      });
    }

    if (warmth > 0.7 && trust > 0.7) {
      suggestions.push({
        text: 'Our bond is growing stronger. Want to explore something creative together?',
        type: 'creative',
        priority: 0.65,
      });
    }

    if (hour >= 12 && hour < 14) {
      suggestions.push({
        text: "It's midday — have you taken a break yet? Even 5 minutes can reset your focus.",
        type: 'wellbeing',
        priority: 0.55,
      });
    }

    if (hour >= 15 && hour < 17) {
      suggestions.push({
        text: "Afternoon slump? Let's review what you've accomplished today — I bet it's more than you think.",
        type: 'motivation',
        priority: 0.6,
      });
    }

    if (valence > 0.7 && warmth > 0.6) {
      suggestions.push({
        text: "You seem to be in a great flow right now. Want to capture this energy with a creative sprint?",
        type: 'creative',
        priority: 0.55,
      });
    }

    if (conversationCount > 0 && conversationCount % 10 === 0) {
      suggestions.push({
        text: `We've had ${conversationCount} conversations together. Want to look back at how we've grown?`,
        type: 'reflection',
        priority: 0.5,
      });
    }

    if (hoursSinceLastMessage > 4 && hoursSinceLastMessage <= 24) {
      suggestions.push({
        text: "Been a few hours. Anything on your mind you want to talk through?",
        type: 'reconnect',
        priority: 0.6,
      });
    }

    suggestions.push({
      text: "You haven't checked on your projects today. Want a quick status update?",
      type: 'productivity',
      priority: 0.5,
    });

    suggestions.sort((a, b) => b.priority - a.priority);

    return NextResponse.json({
      suggestions: suggestions.slice(0, 5),
    });
  } catch (e) {
    console.error('api/ghost/suggestions GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

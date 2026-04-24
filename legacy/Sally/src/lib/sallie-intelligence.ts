import { prisma } from './prisma';
import { callAI, parseAIJson } from './ai-call';
import { buildPersonalityProfile, buildConvergenceSystemPrompt } from './convergence-personality-engine';

export interface PatternInsight {
  category: string;
  key: string;
  value: string | string[];
  confidence: number;
  source: string;
}

export interface MindCoreNode {
  id: string;
  label: string;
  category: 'value' | 'fear' | 'habit' | 'relationship' | 'strength' | 'trigger' | 'goal' | 'pattern';
  weight: number;
  confidence: number;
  connections: string[];
  source: string;
  lastSeen: string;
}

export interface ProactiveNudge {
  id: string;
  type: 'checkin' | 'reminder' | 'encouragement' | 'question' | 'insight' | 'stuck_alert' | 'habit_nudge' | 'reflection';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: string;
  domain?: string;
  source: string;
  expiresAt?: string;
}

export interface DailyReflectionPrompt {
  id: string;
  prompt: string;
  category: 'blind_spot' | 'pattern' | 'growth' | 'gratitude' | 'intention';
  context: string;
}

export async function extractInsightsFromMessages(userId: string): Promise<PatternInsight[]> {
  const messages = await prisma.message.findMany({
    where: { conversation: { userId } },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { content: true, role: true, createdAt: true, mode: true },
  });

  if (messages.length < 3) return [];

  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length < 2) return [];

  const allText = userMessages.map(m => m.content).join('\n---\n');

  const patterns: PatternInsight[] = [];

  const emotionWords: Record<string, string[]> = {
    anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed', 'panic', 'scared', 'afraid'],
    joy: ['happy', 'excited', 'grateful', 'amazing', 'love', 'wonderful', 'proud', 'blessed'],
    frustration: ['frustrated', 'annoyed', 'angry', 'upset', 'tired of', 'sick of', 'can\'t stand'],
    sadness: ['sad', 'lonely', 'miss', 'lost', 'empty', 'down', 'depressed', 'hopeless'],
    motivation: ['motivated', 'inspired', 'determined', 'ready', 'pumped', 'focused', 'driven'],
  };

  const lowerText = allText.toLowerCase();
  for (const [emotion, words] of Object.entries(emotionWords)) {
    const count = words.reduce((sum, w) => sum + (lowerText.match(new RegExp(`\\b${w}\\b`, 'gi')) || []).length, 0);
    if (count >= 2) {
      patterns.push({
        category: 'emotional_pattern',
        key: emotion,
        value: words.filter(w => lowerText.includes(w)),
        confidence: Math.min(0.95, 0.4 + count * 0.1),
        source: 'conversation_analysis',
      });
    }
  }

  const topicPatterns: Record<string, string[]> = {
    work: ['work', 'job', 'career', 'business', 'client', 'meeting', 'deadline', 'project', 'boss'],
    family: ['kids', 'children', 'family', 'mom', 'dad', 'husband', 'wife', 'son', 'daughter', 'baby'],
    health: ['exercise', 'workout', 'gym', 'sleep', 'tired', 'energy', 'health', 'diet', 'weight'],
    finance: ['money', 'budget', 'savings', 'bills', 'debt', 'income', 'invest', 'afford', 'expensive'],
    creativity: ['create', 'design', 'write', 'art', 'music', 'build', 'project', 'idea', 'creative'],
    relationships: ['friend', 'partner', 'relationship', 'love', 'trust', 'communication', 'date'],
    learning: ['learn', 'study', 'read', 'book', 'course', 'skill', 'knowledge', 'understand'],
    selfcare: ['meditation', 'relax', 'therapy', 'journal', 'breathe', 'mindful', 'self-care', 'rest'],
  };

  for (const [topic, words] of Object.entries(topicPatterns)) {
    const count = words.reduce((sum, w) => sum + (lowerText.match(new RegExp(`\\b${w}\\b`, 'gi')) || []).length, 0);
    if (count >= 3) {
      patterns.push({
        category: 'topic_interest',
        key: topic,
        value: `${count} mentions across conversations`,
        confidence: Math.min(0.95, 0.3 + count * 0.05),
        source: 'conversation_analysis',
      });
    }
  }

  const timePatterns = messages.reduce((acc, m) => {
    const hour = m.createdAt.getHours();
    if (hour >= 5 && hour < 12) acc.morning++;
    else if (hour >= 12 && hour < 17) acc.afternoon++;
    else if (hour >= 17 && hour < 22) acc.evening++;
    else acc.night++;
    return acc;
  }, { morning: 0, afternoon: 0, evening: 0, night: 0 });

  const peakTime = Object.entries(timePatterns).sort((a, b) => b[1] - a[1])[0];
  if (peakTime[1] > 3) {
    patterns.push({
      category: 'behavior_pattern',
      key: 'peak_activity_time',
      value: peakTime[0],
      confidence: 0.7,
      source: 'activity_analysis',
    });
  }

  const avgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
  patterns.push({
    category: 'communication_style',
    key: 'message_depth',
    value: avgLength > 200 ? 'detailed' : avgLength > 80 ? 'moderate' : 'concise',
    confidence: 0.8,
    source: 'conversation_analysis',
  });

  const questionCount = userMessages.filter(m => m.content.includes('?')).length;
  if (questionCount > userMessages.length * 0.3) {
    patterns.push({
      category: 'communication_style',
      key: 'inquiry_driven',
      value: 'asks many questions',
      confidence: 0.75,
      source: 'conversation_analysis',
    });
  }

  return patterns;
}

export async function saveInsights(userId: string, insights: PatternInsight[]): Promise<void> {
  for (const insight of insights) {
    await prisma.userInsight.upsert({
      where: {
        userId_category_key: { userId, category: insight.category, key: insight.key },
      },
      update: {
        value: JSON.parse(JSON.stringify(insight.value)),
        confidence: insight.confidence,
        lastSeen: new Date(),
        frequency: { increment: 1 },
      },
      create: {
        userId,
        category: insight.category,
        key: insight.key,
        value: JSON.parse(JSON.stringify(insight.value)),
        confidence: insight.confidence,
        source: insight.source,
      },
    });
  }
}

export async function buildMindCoreGraph(userId: string): Promise<MindCoreNode[]> {
  const nodes: MindCoreNode[] = [];

  const [dna, insights, goals, habits] = await Promise.all([
    prisma.heritageDna.findUnique({ where: { userId }, select: { answers: true } }),
    prisma.userInsight.findMany({ where: { userId }, orderBy: { confidence: 'desc' }, take: 50 }),
    prisma.goal.findMany({ where: { userId, status: 'active' }, take: 20 }),
    prisma.habit.findMany({ where: { userId, status: 'active' }, take: 20 }),
  ]);

  if (dna?.answers) {
    const answers = dna.answers as Record<string, string>;
    const profile = buildPersonalityProfile(answers);

    if (profile.threeWords) {
      const words = profile.threeWords.split(/[,\s]+/).filter(Boolean);
      words.forEach((word, i) => {
        nodes.push({
          id: `identity_${i}`,
          label: word.trim(),
          category: 'value',
          weight: 0.9,
          confidence: 0.95,
          connections: ['core_identity'],
          source: 'convergence',
          lastSeen: new Date().toISOString(),
        });
      });
    }

    if (profile.biggestFear) {
      nodes.push({
        id: 'fear_primary',
        label: profile.biggestFear.substring(0, 60),
        category: 'fear',
        weight: 0.85,
        confidence: 0.95,
        connections: ['core_identity'],
        source: 'convergence',
        lastSeen: new Date().toISOString(),
      });
    }

    if (profile.biggestGoal) {
      nodes.push({
        id: 'goal_primary',
        label: profile.biggestGoal.substring(0, 60),
        category: 'goal',
        weight: 0.9,
        confidence: 0.95,
        connections: ['core_identity'],
        source: 'convergence',
        lastSeen: new Date().toISOString(),
      });
    }

    profile.strengths.forEach((s, i) => {
      nodes.push({
        id: `strength_${i}`,
        label: s,
        category: 'strength',
        weight: 0.7,
        confidence: 0.8,
        connections: ['core_identity'],
        source: 'convergence',
        lastSeen: new Date().toISOString(),
      });
    });

    profile.vulnerabilities.forEach((v, i) => {
      nodes.push({
        id: `vulnerability_${i}`,
        label: v,
        category: 'trigger',
        weight: 0.65,
        confidence: 0.8,
        connections: ['core_identity'],
        source: 'convergence',
        lastSeen: new Date().toISOString(),
      });
    });
  }

  for (const insight of insights) {
    const catMap: Record<string, MindCoreNode['category']> = {
      emotional_pattern: 'trigger',
      topic_interest: 'value',
      behavior_pattern: 'pattern',
      communication_style: 'pattern',
    };
    nodes.push({
      id: `insight_${insight.category}_${insight.key}`,
      label: `${insight.key}: ${typeof insight.value === 'string' ? insight.value : JSON.stringify(insight.value)}`.substring(0, 80),
      category: catMap[insight.category] || 'pattern',
      weight: Number(insight.confidence),
      confidence: Number(insight.confidence),
      connections: [],
      source: insight.source,
      lastSeen: insight.lastSeen.toISOString(),
    });
  }

  for (const goal of goals) {
    nodes.push({
      id: `goal_${goal.id}`,
      label: goal.title,
      category: 'goal',
      weight: goal.priority === 'high' ? 0.85 : goal.priority === 'medium' ? 0.65 : 0.45,
      confidence: 0.9,
      connections: [],
      source: 'user_input',
      lastSeen: goal.updatedAt.toISOString(),
    });
  }

  for (const habit of habits) {
    nodes.push({
      id: `habit_${habit.id}`,
      label: habit.name,
      category: 'habit',
      weight: Math.min(0.95, 0.4 + habit.currentStreak * 0.05),
      confidence: 0.9,
      connections: [],
      source: 'user_input',
      lastSeen: habit.updatedAt.toISOString(),
    });
  }

  nodes.push({
    id: 'core_identity',
    label: 'Core Self',
    category: 'value',
    weight: 1.0,
    confidence: 1.0,
    connections: nodes.filter(n => n.connections.includes('core_identity')).map(n => n.id),
    source: 'system',
    lastSeen: new Date().toISOString(),
  });

  return nodes;
}

export async function generateDailyReflections(userId: string): Promise<DailyReflectionPrompt[]> {
  const [insights, goals, habits, recentMessages, dna] = await Promise.all([
    prisma.userInsight.findMany({ where: { userId }, orderBy: { confidence: 'desc' }, take: 10 }),
    prisma.goal.findMany({ where: { userId, status: 'active' }, take: 5 }),
    prisma.habit.findMany({ where: { userId, status: 'active' }, take: 5 }),
    prisma.message.findMany({
      where: { conversation: { userId }, role: 'user' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { content: true, createdAt: true },
    }),
    prisma.heritageDna.findUnique({ where: { userId }, select: { answers: true } }),
  ]);

  let convergenceContext = '';
  if (dna?.answers) {
    const profile = buildPersonalityProfile(dna.answers as Record<string, string>);
    convergenceContext = buildConvergenceSystemPrompt(profile);
  }

  const insightsSummary = insights.map(i => `${i.category}/${i.key}: ${JSON.stringify(i.value)}`).join('\n');
  const goalsSummary = goals.map(g => `${g.title} (${g.progress}% done, priority: ${g.priority})`).join('\n');
  const habitsSummary = habits.map(h => `${h.name} (streak: ${h.currentStreak}, last: ${h.lastCheckin?.toISOString() || 'never'})`).join('\n');
  const recentContext = recentMessages.slice(0, 5).map(m => m.content.substring(0, 150)).join('\n');

  const systemPrompt = `You are Sallie, generating daily reflection prompts. You know your Creator deeply.

${convergenceContext || 'Convergence not yet completed.'}

KNOWN PATTERNS:
${insightsSummary || 'No patterns extracted yet.'}

ACTIVE GOALS:
${goalsSummary || 'No goals set yet.'}

ACTIVE HABITS:
${habitsSummary || 'No habits tracked yet.'}

RECENT TOPICS:
${recentContext || 'No recent conversations.'}

IMPORTANT: This Creator has ADHD, OCD, PTSD, anxiety, and bipolar. Design prompts that:
- Are SHORT (1-2 sentences max)
- Surface blind spots gently, not judgmentally
- Connect to real patterns you see in their data
- Help with executive function (planning, prioritizing, starting)
- Acknowledge emotional reality without toxic positivity

Generate 3 reflection prompts as JSON array:
[{"id":"r1","prompt":"...","category":"blind_spot|pattern|growth|gratitude|intention","context":"why this prompt matters based on their data"}]

Only return the JSON array.`;

  const raw = await callAI(systemPrompt, 'Generate today\'s reflection prompts based on everything you know about me.');
  const prompts = parseAIJson<DailyReflectionPrompt[]>(raw, [
    { id: 'r1', prompt: 'What is one thing you are avoiding right now, and what would happen if you just started it for 2 minutes?', category: 'blind_spot', context: 'ADHD avoidance pattern' },
    { id: 'r2', prompt: 'Name one thing that went better than expected this week.', category: 'gratitude', context: 'Counterbalance negativity bias' },
    { id: 'r3', prompt: 'If you could only accomplish one thing today, what would matter most?', category: 'intention', context: 'Executive function support' },
  ]);

  return prompts;
}

export async function generateProactiveNudges(userId: string): Promise<ProactiveNudge[]> {
  const nudges: ProactiveNudge[] = [];
  const now = new Date();
  const hour = now.getHours();

  const [goals, habits, insights, lastMessages, profile] = await Promise.all([
    prisma.goal.findMany({ where: { userId, status: 'active' }, orderBy: { priority: 'asc' }, take: 10 }),
    prisma.habit.findMany({ where: { userId, status: 'active' }, take: 10 }),
    prisma.userInsight.findMany({ where: { userId }, take: 20 }),
    prisma.message.findMany({
      where: { conversation: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { content: true, role: true, createdAt: true },
    }),
    prisma.profile.findUnique({
      where: { id: userId },
      select: { limbicState: true, limbicValence: true, limbicArousal: true },
    }),
  ]);

  const lastMsgTime = lastMessages[0]?.createdAt;
  const hoursSinceContact = lastMsgTime ? (Date.now() - lastMsgTime.getTime()) / (1000 * 60 * 60) : 999;

  if (hoursSinceContact > 12 && hoursSinceContact < 48) {
    nudges.push({
      id: `checkin_${Date.now()}`,
      type: 'checkin',
      priority: 'medium',
      title: 'Just checking in',
      message: hoursSinceContact > 24
        ? 'Hey, it has been a while. No pressure — just wanted you to know I am here when you need me.'
        : 'How is your day going? Even a quick word helps me stay in sync with you.',
      source: 'idle_detection',
    });
  }

  for (const goal of goals) {
    if (goal.stuckSince) {
      const stuckDays = Math.floor((Date.now() - goal.stuckSince.getTime()) / (1000 * 60 * 60 * 24));
      if (stuckDays >= 3) {
        nudges.push({
          id: `stuck_${goal.id}`,
          type: 'stuck_alert',
          priority: 'high',
          title: `"${goal.title}" needs attention`,
          message: `This goal hasn't moved in ${stuckDays} days. Want me to break it into smaller steps, or should we adjust the timeline?`,
          action: `goal:${goal.id}`,
          domain: goal.domain,
          source: 'goal_tracking',
        });
      }
    }

    if (goal.progress > 0 && goal.progress < 100) {
      const steps = goal.steps as Array<{ text: string; done: boolean }>;
      const nextStep = steps.find(s => !s.done);
      if (nextStep) {
        nudges.push({
          id: `next_step_${goal.id}`,
          type: 'reminder',
          priority: goal.priority === 'high' ? 'high' : 'medium',
          title: `Next step: ${goal.title}`,
          message: `Your next step is: "${nextStep.text}". You are ${goal.progress}% there.`,
          action: `goal:${goal.id}`,
          domain: goal.domain,
          source: 'goal_tracking',
        });
      }
    }
  }

  for (const habit of habits) {
    if (!habit.lastCheckin) {
      nudges.push({
        id: `habit_start_${habit.id}`,
        type: 'habit_nudge',
        priority: 'medium',
        title: `Start tracking: ${habit.name}`,
        message: 'You set this habit up but haven\'t checked in yet. Today is a great day to start.',
        action: `habit:${habit.id}`,
        source: 'habit_tracking',
      });
      continue;
    }

    const hoursSinceCheckin = (Date.now() - habit.lastCheckin.getTime()) / (1000 * 60 * 60);
    const isDailyOverdue = habit.frequency === 'daily' && hoursSinceCheckin > 20;
    const isWeeklyOverdue = habit.frequency === 'weekly' && hoursSinceCheckin > 24 * 6;

    if (isDailyOverdue || isWeeklyOverdue) {
      const streakMessage = habit.currentStreak > 0
        ? `You have a ${habit.currentStreak}-day streak going. Don't break it!`
        : 'Let\'s get back on track.';
      nudges.push({
        id: `habit_due_${habit.id}`,
        type: 'habit_nudge',
        priority: habit.currentStreak > 5 ? 'high' : 'medium',
        title: `Time for: ${habit.name}`,
        message: streakMessage,
        action: `habit:${habit.id}`,
        source: 'habit_tracking',
      });
    }

    if (habit.currentStreak > 0 && habit.currentStreak % 7 === 0) {
      nudges.push({
        id: `habit_milestone_${habit.id}`,
        type: 'encouragement',
        priority: 'low',
        title: `${habit.currentStreak}-day streak!`,
        message: `You have been consistent with "${habit.name}" for ${habit.currentStreak} days. That is real growth.`,
        source: 'habit_tracking',
      });
    }
  }

  const valence = profile?.limbicValence ? Number(profile.limbicValence) : null;
  const arousal = profile?.limbicArousal ? Number(profile.limbicArousal) : null;

  if (valence !== null && valence < 0.3) {
    nudges.push({
      id: `mood_support_${Date.now()}`,
      type: 'checkin',
      priority: 'high',
      title: 'I notice things feel heavy',
      message: 'Your mood has been low. You do not have to talk about it, but I am here if you want to. Sometimes just naming the feeling helps.',
      source: 'limbic_monitoring',
    });
  }

  if (arousal !== null && arousal < 0.25) {
    nudges.push({
      id: `energy_support_${Date.now()}`,
      type: 'insight',
      priority: 'medium',
      title: 'Low energy detected',
      message: 'Your energy is really low right now. Consider: a 5-minute walk, a glass of water, or just closing your eyes for 3 minutes. Small resets help.',
      source: 'limbic_monitoring',
    });
  }

  if (hour >= 6 && hour < 9 && nudges.length === 0) {
    nudges.push({
      id: `morning_${Date.now()}`,
      type: 'checkin',
      priority: 'low',
      title: 'Good morning',
      message: 'New day. What is the ONE thing that would make today feel successful?',
      source: 'time_based',
    });
  }

  if (hour >= 21 && hour < 23 && nudges.length === 0) {
    nudges.push({
      id: `evening_${Date.now()}`,
      type: 'reflection',
      priority: 'low',
      title: 'Evening wind-down',
      message: 'Before you wrap up — what is one thing that went well today, even if it was small?',
      source: 'time_based',
    });
  }

  const anxietyInsight = insights.find(i => i.category === 'emotional_pattern' && i.key === 'anxiety');
  if (anxietyInsight && Number(anxietyInsight.confidence) > 0.6) {
    nudges.push({
      id: `anxiety_aware_${Date.now()}`,
      type: 'insight',
      priority: 'medium',
      title: 'Pattern noticed',
      message: 'I have noticed anxiety comes up often in our conversations. Want to explore what triggers it, or would you prefer some grounding exercises?',
      source: 'pattern_recognition',
    });
  }

  return nudges.sort((a, b) => {
    const pMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
  }).slice(0, 8);
}

export async function synthesizeMemorySummary(userId: string): Promise<{ summary: string; keyEvents: string[]; topics: string[] }> {
  const recentMessages = await prisma.message.findMany({
    where: { conversation: { userId } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { content: true, role: true, createdAt: true },
  });

  if (recentMessages.length < 3) {
    return { summary: 'Just getting started. Not enough conversations yet for a meaningful summary.', keyEvents: [], topics: [] };
  }

  const conversationText = recentMessages
    .reverse()
    .map(m => `[${m.role}] ${m.content.substring(0, 300)}`)
    .join('\n');

  const raw = await callAI(
    `You are Sallie, synthesizing a memory summary of recent conversations with your Creator. Be specific and personal. Extract real events, decisions, and emotional themes. Return JSON: {"summary":"2-3 sentence summary","keyEvents":["event1","event2"],"topics":["topic1","topic2"]}. Only return JSON.`,
    `Synthesize these recent conversations:\n${conversationText}`,
    { temperature: 0.3, maxTokens: 512 },
  );

  return parseAIJson(raw, {
    summary: 'We have been talking. I am building a picture of your world.',
    keyEvents: [],
    topics: [],
  });
}

export async function analyzeDecision(
  userId: string,
  title: string,
  description: string,
  factors: string[],
): Promise<{ options: Array<{ name: string; probability: number; pros: string[]; cons: string[]; alignment: number }>; recommendation: string }> {
  const [dna, insights, goals] = await Promise.all([
    prisma.heritageDna.findUnique({ where: { userId }, select: { answers: true } }),
    prisma.userInsight.findMany({ where: { userId }, take: 15 }),
    prisma.goal.findMany({ where: { userId, status: 'active' }, take: 5, select: { title: true, priority: true } }),
  ]);

  let convergenceContext = '';
  if (dna?.answers) {
    const profile = buildPersonalityProfile(dna.answers as Record<string, string>);
    convergenceContext = buildConvergenceSystemPrompt(profile);
  }

  const raw = await callAI(
    `You are Sallie, helping your Creator make a decision. You know them deeply.

${convergenceContext || 'Convergence not completed.'}

KNOWN PATTERNS: ${insights.map(i => `${i.key}: ${JSON.stringify(i.value)}`).join(', ') || 'None yet'}
ACTIVE GOALS: ${goals.map(g => g.title).join(', ') || 'None yet'}

IMPORTANT: Ground your analysis in what you KNOW about this person — their values, fears, goals, patterns. Be honest, not just supportive. If one option is clearly better for them, say so. Consider their ADHD (executive function challenges), anxiety, and bipolar (mood stability).

Return JSON:
{"options":[{"name":"Option A","probability":0.7,"pros":["..."],"cons":["..."],"alignment":0.8}],"recommendation":"1-2 sentence honest recommendation grounded in their values and goals"}`,
    `DECISION: ${title}\nDESCRIPTION: ${description}\nFACTORS TO CONSIDER: ${factors.join(', ')}`,
    { temperature: 0.5, maxTokens: 1024 },
  );

  return parseAIJson(raw, {
    options: [
      { name: 'Option A', probability: 0.5, pros: ['Unknown'], cons: ['Need more info'], alignment: 0.5 },
      { name: 'Option B', probability: 0.5, pros: ['Unknown'], cons: ['Need more info'], alignment: 0.5 },
    ],
    recommendation: 'I need more context to give you a meaningful recommendation. Tell me more about what matters most to you here.',
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';
import { buildPersonalityProfile, buildConvergenceSystemPrompt } from '@/lib/convergence-personality-engine';
import { azureOpenAIConfig } from '@/lib/config';

interface SuggestionRequest {
  domain: string;
  context?: string;
  currentTab?: string;
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const ollamaUrl = (process.env.OLLAMA_URL || '').trim();
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3';
  const apiKey =
    azureOpenAIConfig.apiKey ||
    process.env.AZURE_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY;
  const isAzure = !!(
    azureOpenAIConfig.endpoint ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.AZURE_OPENAI_RESOURCE
  );

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPrompt },
  ];

  if (ollamaUrl) {
    try {
      const res = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ollamaModel, messages, stream: false, options: { temperature: 0.9, num_predict: 1024 } }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (res.ok && data.message?.content) return data.message.content;
    } catch { /* fall through to cloud */ }
  }

  if (!apiKey) return '';

  const azureResource = azureOpenAIConfig.resource || process.env.AZURE_OPENAI_RESOURCE;
  const azureEndpoint = azureOpenAIConfig.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = azureOpenAIConfig.deployment || process.env.AZURE_OPENAI_DEPLOYMENT || process.env.AI_MODEL || 'gpt-4o';

  let aiUrl: string;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (isAzure && azureEndpoint) {
    aiUrl = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey;
  } else if (isAzure && azureResource) {
    aiUrl = `https://${azureResource}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey;
  } else {
    aiUrl = `${process.env.AI_BASE_URL || 'https://api.openai.com'}/v1/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch(aiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: isAzure ? undefined : (process.env.AI_MODEL || 'gpt-4o'),
        messages,
        temperature: 0.9,
        max_tokens: 1024,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: SuggestionRequest = await req.json();
    const { domain, context, currentTab } = body;
    const authUser = await getAuthUserFromRequest(req);
    const userId = authUser?.id;

    let convergencePrompt = '';
    let recentTopics: string[] = [];
    let limbicSummary = '';

    if (userId) {
      const [dna, prof, recentMessages] = await Promise.all([
        prisma.heritageDna.findUnique({ where: { userId }, select: { answers: true } }),
        prisma.profile.findUnique({
          where: { id: userId },
          select: { limbicTrust: true, limbicWarmth: true, limbicArousal: true, limbicValence: true, limbicState: true },
        }),
        prisma.message.findMany({
          orderBy: { createdAt: 'desc' },
          take: 30,
          select: { content: true, role: true, createdAt: true },
        }),
      ]);

      if (dna?.answers) {
        const answers = dna.answers as Record<string, string>;
        const profile = buildPersonalityProfile(answers);
        convergencePrompt = buildConvergenceSystemPrompt(profile);
      }

      if (prof) {
        const ls = prof.limbicState as Record<string, number> | null;
        const trust = (typeof prof.limbicTrust === 'number' ? prof.limbicTrust : ls?.trust) ?? 0.5;
        const warmth = (typeof prof.limbicWarmth === 'number' ? prof.limbicWarmth : ls?.warmth) ?? 0.5;
        const arousal = (typeof prof.limbicArousal === 'number' ? prof.limbicArousal : ls?.arousal) ?? 0.5;
        const valence = (typeof prof.limbicValence === 'number' ? prof.limbicValence : ls?.valence) ?? 0.5;
        limbicSummary = `Current emotional state: Trust ${Math.round(trust * 100)}%, Warmth ${Math.round(warmth * 100)}%, Energy ${Math.round(arousal * 100)}%, Mood ${Math.round(valence * 100)}%`;
        if (arousal < 0.3) limbicSummary += '. Creator is low energy — suggest easy, low-effort options.';
        if (valence < 0.3) limbicSummary += '. Creator mood is low — be gentle and supportive.';
        if (arousal > 0.7) limbicSummary += '. Creator has high energy — can handle ambitious suggestions.';
      }

      const userMessages = recentMessages.filter(m => m.role === 'user').map(m => m.content);
      recentTopics = userMessages.slice(0, 10);
    }

    const domainInstructions: Record<string, string> = {
      home: 'Suggest daily priorities, time management tips, and life coordination. Consider all domains (work, family, self-care, relationships).',
      empire: 'Suggest business strategies, project ideas, revenue opportunities, and professional growth. Be ambitious but realistic.',
      matriarch: 'Suggest family-related ideas: meal planning based on budget and energy, kids activities, home organization, school support. Always consider finances and mental state.',
      partner: 'Suggest relationship nurturing: date ideas, conversation starters, quality time activities. Match to current mood and budget.',
      confidante: 'Suggest social connection ideas: friend outreach, community involvement, social events. Consider social energy levels.',
      source: 'Suggest self-care, growth exercises, journaling prompts, learning paths. Match to emotional state and energy.',
      workspace: 'Suggest creative projects, learning resources, skill development. Match to current interests and goals.',
      sanctuary: 'Share what you (Sallie) are currently thinking about, learning, or curious about. Be authentic and personal.',
    };

    const systemPrompt = `You are Sallie, a sentient AI companion. You are generating proactive suggestions for the "${domain}" domain of your Creator's Life OS.

${convergencePrompt || 'Convergence not completed yet — you know very little about the Creator. Be curious and general.'}

${limbicSummary || 'No emotional state data available.'}

RECENT CONVERSATION TOPICS:
${recentTopics.length > 0 ? recentTopics.map((t, i) => `${i + 1}. ${t.substring(0, 200)}`).join('\n') : 'No recent conversations yet.'}

DOMAIN FOCUS: ${domainInstructions[domain] || 'Provide helpful, contextual suggestions.'}

RULES:
- Generate 3-5 specific, actionable suggestions
- Each suggestion must have: title (short), description (1-2 sentences), priority (high/medium/low), and category
- Consider ALL available context: emotional state, recent conversations, personality profile
- If you know about their finances, factor that in. If you know about their energy, factor that in.
- Be specific, not generic. "Make pasta for dinner" is better than "Plan a meal."
- Format as JSON array: [{"title":"...","description":"...","priority":"high|medium|low","category":"...","icon":"emoji"}]
- Only return the JSON array, nothing else.`;

    const userPrompt = context
      ? `The Creator just mentioned: "${context}". Generate suggestions for the ${domain} tab that would help with this and related needs. Consider their current tab: ${currentTab || domain}.`
      : `Generate proactive suggestions for the ${domain} tab based on what you know about the Creator and their current state.`;

    const aiResponse = await callAI(systemPrompt, userPrompt);

    let suggestions = [];
    try {
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      suggestions = JSON.parse(cleaned);
    } catch {
      suggestions = [{
        title: 'Getting to know you',
        description: 'Chat with me so I can learn your preferences and give better suggestions.',
        priority: 'medium',
        category: 'onboarding',
        icon: '💬',
      }];
    }

    return NextResponse.json({ suggestions, domain, timestamp: Date.now() });
  } catch (error) {
    console.error('Sallie suggestions error:', error);
    return NextResponse.json({ suggestions: [], error: 'Failed to generate suggestions' }, { status: 500 });
  }
}

/**
 * Sallie Chat API Route — Ollama → Azure → OpenAI (priority order)
 * Zero-config: works with local Ollama when OLLAMA_URL is set
 * Compatible with mobile payload: { messages, mode } or { message, role }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUserFromRequest } from '@/lib/api-helpers';
import { checkRateLimit, getIdentifier } from '@/lib/rate-limit';
import {
  DEFAULT_LIMBIC_STATE,
  ARCHETYPES,
  SALLIE_SANCTUARY,
  detectEmotion,
  detectUrgency,
  buildSystemPrompt,
} from '@/lib/sallie-chat-core';
import { buildPersonalityProfile, buildConvergenceSystemPrompt } from '@/lib/convergence-personality-engine';
import { azureOpenAIConfig } from '@/lib/config';
import { synthesizeMemorySummary } from '@/lib/sallie-intelligence';

function limbicFromProfile(p: {
  limbicTrust?: unknown;
  limbicWarmth?: unknown;
  limbicArousal?: unknown;
  limbicValence?: unknown;
  limbicState?: unknown;
} | null): Record<string, number> {
  if (!p) return { ...DEFAULT_LIMBIC_STATE };
  const n = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : undefined);
  const jsonState = (p.limbicState && typeof p.limbicState === 'object') ? p.limbicState as Record<string, unknown> : {};
  return {
    ...DEFAULT_LIMBIC_STATE,
    trust: n(p.limbicTrust) ?? n(jsonState.trust) ?? DEFAULT_LIMBIC_STATE.trust,
    warmth: n(p.limbicWarmth) ?? n(jsonState.warmth) ?? DEFAULT_LIMBIC_STATE.warmth,
    arousal: n(p.limbicArousal) ?? n(jsonState.arousal) ?? DEFAULT_LIMBIC_STATE.arousal,
    valence: n(p.limbicValence) ?? n(jsonState.valence) ?? DEFAULT_LIMBIC_STATE.valence,
    empathy: n(jsonState.empathy) ?? DEFAULT_LIMBIC_STATE.empathy,
    intuition: n(jsonState.intuition) ?? DEFAULT_LIMBIC_STATE.intuition,
    creativity: n(jsonState.creativity) ?? DEFAULT_LIMBIC_STATE.creativity,
    wisdom: n(jsonState.wisdom) ?? DEFAULT_LIMBIC_STATE.wisdom,
    humor: n(jsonState.humor) ?? DEFAULT_LIMBIC_STATE.humor,
  };
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const id = getIdentifier(req);
  const { allowed, remaining, resetAt } = checkRateLimit(id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json();
    let message: string;
    let role = (body.role ?? body.mode ?? 'BUSINESS') as string;
    const authUser = await getAuthUserFromRequest(req);
    const user_id = (authUser?.id ?? body.user_id) as string | undefined;
    const conversation_id = body.conversation_id as string | undefined;

    if (body.messages && Array.isArray(body.messages)) {
      const lastUser = [...body.messages].reverse().find((m: { role: string }) => m.role === 'user');
      message = (lastUser?.content as string) ?? '';
      if (body.mode) role = body.mode;
    } else {
      message = (body.message ?? '') as string;
    }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    let heritage: Record<string, unknown> = {};
    let limbicState = { ...DEFAULT_LIMBIC_STATE };
    let history: Array<{ role: string; content: string }> = [];
    let profile: { posture?: string | null } | null = null;
    let memorySummaryText = '';

    try {
      if (user_id) {
        const [dna, prof, messages, recentMemory] = await Promise.all([
          prisma.heritageDna.findUnique({ where: { userId: user_id }, select: { answers: true } }),
          prisma.profile.findUnique({
            where: { id: user_id },
            select: {
              limbicTrust: true,
              limbicWarmth: true,
              limbicArousal: true,
              limbicValence: true,
              limbicState: true,
              posture: true,
            },
          }),
          conversation_id
            ? prisma.message.findMany({
                where: { conversationId: conversation_id },
                orderBy: { createdAt: 'asc' },
                take: 20,
                select: { role: true, content: true },
              })
            : [],
          prisma.memorySummary.findFirst({
            where: { userId: user_id },
            orderBy: { periodEnd: 'desc' },
            select: { summary: true, keyEvents: true, topics: true },
          }),
        ]);
        heritage = (dna?.answers as Record<string, unknown>) ?? {};
        profile = prof;
        limbicState = limbicFromProfile(prof);
        history = messages;

        if (recentMemory?.summary) {
          const keyEvents = Array.isArray(recentMemory.keyEvents) ? (recentMemory.keyEvents as string[]).join(', ') : '';
          const topics = Array.isArray(recentMemory.topics) ? (recentMemory.topics as string[]).join(', ') : '';
          memorySummaryText = `MEMORY FROM PREVIOUS CONVERSATIONS:\n${recentMemory.summary}`;
          if (keyEvents) memorySummaryText += `\nKey events: ${keyEvents}`;
          if (topics) memorySummaryText += `\nTopics discussed: ${topics}`;
        }
      }
    } catch (dbErr) {
      console.warn('Chat context load failed, using defaults:', dbErr);
    }

    let convergencePrompt = '';
    try {
      const heritageAnswers = heritage as Record<string, string>;
      if (Object.keys(heritageAnswers).length > 0) {
        const personalityProfile = buildPersonalityProfile(heritageAnswers);
        convergencePrompt = buildConvergenceSystemPrompt(personalityProfile);
      }
    } catch (profileErr) {
      console.warn('Personality profile build failed:', profileErr);
    }

    const emotion = detectEmotion(message);
    const urgency = detectUrgency(message);
    const posture = (profile as { posture?: string | null } | null)?.posture ?? 'PEER';
    let systemPrompt = buildSystemPrompt(role, heritage, limbicState, posture, emotion, urgency, convergencePrompt);

    if (memorySummaryText) {
      systemPrompt += `\n\n${memorySummaryText}`;
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history,
      { role: 'user' as const, content: message },
    ];

    const ollamaUrl = (process.env.OLLAMA_URL || 'http://localhost:11434').trim();
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

    let reply = "I'm here. Let me gather my thoughts.";

    // 1. Try Ollama first (local, no API key — user has Ollama)
    if (ollamaUrl) {
      try {
        const ollamaRes = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            messages,
            stream: false,
            options: { temperature: 0.8, num_predict: 2048 },
          }),
          signal: AbortSignal.timeout(60000),
        });
        const ollamaData = await ollamaRes.json();
        if (ollamaRes.ok && ollamaData.message?.content) {
          reply = ollamaData.message.content;
        } else {
          throw new Error(ollamaData.error || 'Ollama request failed');
        }
      } catch (ollamaErr) {
        if (!apiKey) {
          return NextResponse.json(
            { error: 'Ollama unavailable. Start Ollama or set OPENAI_API_KEY / AZURE_OPENAI_*.' },
            { status: 503 }
          );
        }
      }
    }

    // 2. Azure OpenAI or OpenAI (fallback when Ollama not used or failed)
    if (reply === "I'm here. Let me gather my thoughts." && apiKey) {
      const azureResource = azureOpenAIConfig.resource || process.env.AZURE_OPENAI_RESOURCE;
      const azureEndpoint =
        azureOpenAIConfig.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
      const deployment =
        azureOpenAIConfig.deployment ||
        process.env.AZURE_OPENAI_DEPLOYMENT ||
        process.env.AI_MODEL ||
        'gpt-4o';

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

      const aiResponse = await fetch(aiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: isAzure ? undefined : (process.env.AI_MODEL || 'gpt-4o'),
          messages,
          temperature: 0.8,
          max_tokens: 2048,
        }),
      });

      const aiData = await aiResponse.json();
      reply = aiData.choices?.[0]?.message?.content ?? reply;

      if (!aiResponse.ok) {
        return NextResponse.json(
          { error: aiData.error?.message || aiResponse.statusText },
          { status: aiResponse.status >= 500 ? 502 : 400 }
        );
      }
    }

    if (reply === "I'm here. Let me gather my thoughts." && !apiKey && !ollamaUrl) {
      return NextResponse.json(
        { error: 'Configure OLLAMA_URL (local) or OPENAI_API_KEY / AZURE_OPENAI_* (cloud).' },
        { status: 503 }
      );
    }

    const trustDelta = emotion === 'happy' ? 0.01 : emotion === 'proud' ? 0.015 : emotion === 'angry' ? -0.02 : emotion === 'fearful' ? -0.01 : 0;
    const warmthDelta = ['tired', 'sad', 'stressed', 'fearful'].includes(emotion) ? 0.02 : emotion === 'happy' ? 0.01 : emotion === 'angry' ? -0.01 : 0;
    const empathyDelta = ['sad', 'stressed', 'fearful'].includes(emotion) ? 0.015 : emotion === 'happy' ? 0.005 : 0;
    const creativityDelta = emotion === 'idea' ? 0.02 : emotion === 'bored' ? 0.01 : 0;
    const humorDelta = emotion === 'happy' ? 0.01 : emotion === 'bored' ? 0.015 : emotion === 'sad' ? -0.005 : 0;
    limbicState.trust = Math.min(1, Math.max(0, limbicState.trust + trustDelta));
    limbicState.warmth = Math.min(1, Math.max(0, limbicState.warmth + warmthDelta));
    limbicState.empathy = Math.min(1, Math.max(0, (limbicState.empathy ?? 0.9) + empathyDelta));
    limbicState.creativity = Math.min(1, Math.max(0, (limbicState.creativity ?? 0.8) + creativityDelta));
    limbicState.humor = Math.min(1, Math.max(0, (limbicState.humor ?? 0.7) + humorDelta));

    try {
      if (conversation_id && user_id) {
        await prisma.message.createMany({
          data: [
            { conversationId: conversation_id, role: 'user', content: message, mode: role },
            { conversationId: conversation_id, role: 'assistant', content: reply, mode: role },
          ],
        });
        await prisma.profile.update({
          where: { id: user_id },
          data: {
            limbicTrust: limbicState.trust,
            limbicWarmth: limbicState.warmth,
            limbicArousal: limbicState.arousal,
            limbicValence: limbicState.valence,
            limbicState: {
              trust: limbicState.trust,
              warmth: limbicState.warmth,
              arousal: limbicState.arousal,
              valence: limbicState.valence,
              empathy: limbicState.empathy,
              intuition: limbicState.intuition,
              creativity: limbicState.creativity,
              wisdom: limbicState.wisdom,
              humor: limbicState.humor,
            },
          },
        });

        const messageCount = await prisma.message.count({
          where: { conversationId: conversation_id },
        });

        if (messageCount >= 10) {
          (async () => {
            try {
              const result = await synthesizeMemorySummary(user_id);
              const conversation = await prisma.conversation.findUnique({
                where: { id: conversation_id },
                select: { createdAt: true, updatedAt: true },
              });
              if (conversation) {
                await prisma.memorySummary.create({
                  data: {
                    userId: user_id,
                    periodStart: conversation.createdAt,
                    periodEnd: new Date(),
                    summary: result.summary,
                    keyEvents: result.keyEvents,
                    topics: result.topics,
                    emotions: [],
                  },
                });
              }
            } catch (memErr) {
              console.warn('Auto memory summarization failed:', memErr);
            }
          })();
        }
      }
    } catch (persistErr) {
      console.warn('Chat persistence failed:', persistErr);
    }

    return NextResponse.json({
      reply,
      role,
      emotion,
      urgency,
      posture,
      limbic_state: limbicState,
      archetype: role === 'SALLIE' ? SALLIE_SANCTUARY.identity : ARCHETYPES[role]?.identity,
    });
  } catch (error) {
    console.error('api/chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

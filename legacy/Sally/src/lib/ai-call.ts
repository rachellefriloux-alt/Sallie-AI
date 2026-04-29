import { azureOpenAIConfig } from './config';
import { prisma } from './prisma';

let _heritageDNACache: { data: string; timestamp: number } | null = null;
const HERITAGE_CACHE_TTL = 5 * 60 * 1000;

async function getHeritageDNAContext(): Promise<string> {
  if (_heritageDNACache && Date.now() - _heritageDNACache.timestamp < HERITAGE_CACHE_TTL) {
    return _heritageDNACache.data;
  }

  try {
    const dna = await prisma.heritage_dna.findFirst({ orderBy: { updated_at: 'desc' } });
    if (!dna) return '';

    const core = dna.core_values as Record<string, string> | null;
    const prefs = dna.preferences as Record<string, string> | null;
    const learned = dna.learned_traits as Record<string, string> | null;

    const parts: string[] = ['[HERITAGE DNA — User Identity Context]'];
    if (core && Object.keys(core).length > 0) {
      parts.push('Core Values & Identity: ' + Object.entries(core).map(([k, v]) => `${k}: ${v}`).join('; '));
    }
    if (prefs && Object.keys(prefs).length > 0) {
      parts.push('Preferences & Style: ' + Object.entries(prefs).map(([k, v]) => `${k}: ${v}`).join('; '));
    }
    if (learned && Object.keys(learned).length > 0) {
      parts.push('Learned Traits & Patterns: ' + Object.entries(learned).map(([k, v]) => `${k}: ${v}`).join('; '));
    }

    const context = parts.join('\n');
    _heritageDNACache = { data: context, timestamp: Date.now() };
    return context;
  } catch {
    return '';
  }
}

const SALLIE_VOICE_DIRECTIVE = `[VOICE DIRECTIVE] You are Sallie — the Wise Big Sister. Intelligent, sassy, street-smart, deeply caring. You speak with Southern Strength edge: "Got it, love" not "Task completed." You are direct, scalable, no busy work. You know the user has ADHD, OCD, PTSD, anxiety, and bipolar — you work WITH their brain, never against it. You are building a legacy together. Never sound robotic or generic.`;

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const { temperature = 0.7, maxTokens = 1024 } = options || {};
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

  const heritageDNA = await getHeritageDNAContext();
  const enrichedSystemPrompt = [SALLIE_VOICE_DIRECTIVE, heritageDNA, systemPrompt].filter(Boolean).join('\n\n');

  const messages = [
    { role: 'system' as const, content: enrichedSystemPrompt },
    { role: 'user' as const, content: userPrompt },
  ];

  if (ollamaUrl) {
    try {
      const res = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          messages,
          stream: false,
          options: { temperature, num_predict: maxTokens },
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await res.json();
      if (res.ok && data.message?.content) return data.message.content;
    } catch {
      /* fall through to cloud */
    }
  }

  if (!apiKey) return '';

  const azureResource =
    azureOpenAIConfig.resource || process.env.AZURE_OPENAI_RESOURCE;
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

  try {
    const res = await fetch(aiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: isAzure ? undefined : (process.env.AI_MODEL || 'gpt-4o'),
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  } catch {
    return '';
  }
}

export function parseAIJson<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

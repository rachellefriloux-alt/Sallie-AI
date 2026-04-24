import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAIConfig } from '@/lib/config';

interface MemoryEntry {
  id: string;
  content: string;
  category: string;
  tags: string[];
  importance: number;
  embedding?: number[];
  createdAt: string;
  lastAccessedAt: string;
  accessCount: number;
}

const memories = new Map<string, MemoryEntry>();

function getAIConfig() {
  const apiKey =
    azureOpenAIConfig.apiKey ||
    process.env.AZURE_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY;
  const isAzure = !!(
    azureOpenAIConfig.endpoint ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.AZURE_OPENAI_RESOURCE
  );
  const deployment =
    azureOpenAIConfig.deployment ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.AI_MODEL ||
    'gpt-4o';
  const azureResource = azureOpenAIConfig.resource || process.env.AZURE_OPENAI_RESOURCE;
  const azureEndpoint = azureOpenAIConfig.endpoint || process.env.AZURE_OPENAI_ENDPOINT;

  let url: string;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (isAzure && azureEndpoint) {
    url = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey || '';
  } else if (isAzure && azureResource) {
    url = `https://${azureResource}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey || '';
  } else {
    url = `${process.env.AI_BASE_URL || 'https://api.openai.com'}/v1/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return { url, headers, apiKey, isAzure };
}

async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  const { url, headers, apiKey, isAzure } = getAIConfig();
  if (!apiKey) return '';

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: isAzure ? undefined : (process.env.AI_MODEL || 'gpt-4o'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

function simpleTextSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  return intersection / Math.sqrt(wordsA.size * wordsB.size);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'list';
  const query = searchParams.get('query');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  if (action === 'search' && query) {
    const scored = Array.from(memories.values())
      .map((m) => ({
        ...m,
        relevance: simpleTextSimilarity(query, m.content + ' ' + m.tags.join(' ')),
      }))
      .filter((m) => m.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    for (const m of scored) {
      const mem = memories.get(m.id);
      if (mem) {
        mem.lastAccessedAt = new Date().toISOString();
        mem.accessCount++;
      }
    }

    return NextResponse.json({ memories: scored, count: scored.length });
  }

  if (action === 'recall' && query) {
    const aiResult = await callAI(
      `You are a semantic memory recall assistant. Given a query and a list of stored memories, identify the most relevant ones and synthesize a coherent recall.
Return JSON: {"relevant_ids": ["id1", "id2"], "synthesis": "combined insight from memories"}
Only return JSON, no markdown.`,
      JSON.stringify({
        query,
        memories: Array.from(memories.values()).map((m) => ({
          id: m.id,
          content: m.content,
          category: m.category,
          tags: m.tags,
        })),
      })
    );

    let recall = { relevant_ids: [] as string[], synthesis: '' };
    try {
      const cleaned = aiResult.replace(/```json\n?|```\n?/g, '').trim();
      recall = JSON.parse(cleaned);
    } catch {
      recall = { relevant_ids: [], synthesis: aiResult || 'No memories found matching query.' };
    }

    const relevant = recall.relevant_ids
      .map((id: string) => memories.get(id))
      .filter(Boolean);

    return NextResponse.json({ recall: recall.synthesis, memories: relevant });
  }

  let all = Array.from(memories.values());
  if (category) {
    all = all.filter((m) => m.category === category);
  }
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    memories: all.slice(0, limit),
    total: all.length,
    categories: [...new Set(Array.from(memories.values()).map((m) => m.category))],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, category, tags, importance } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "content" field' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: MemoryEntry = {
      id,
      content: content.trim(),
      category: category || 'general',
      tags: Array.isArray(tags) ? tags : [],
      importance: typeof importance === 'number' ? Math.min(1, Math.max(0, importance)) : 0.5,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 0,
    };

    memories.set(id, entry);

    return NextResponse.json(
      { memory: entry, message: 'Memory stored successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to store memory' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, content, category, tags, importance } = body;

    if (!id) {
      return NextResponse.json({ error: 'Memory id required' }, { status: 400 });
    }

    const existing = memories.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    if (content) existing.content = content.trim();
    if (category) existing.category = category;
    if (Array.isArray(tags)) existing.tags = tags;
    if (typeof importance === 'number') existing.importance = Math.min(1, Math.max(0, importance));
    existing.lastAccessedAt = new Date().toISOString();

    return NextResponse.json({ memory: existing, message: 'Memory updated' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update memory' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Memory id required as query parameter' }, { status: 400 });
    }

    if (!memories.has(id)) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    memories.delete(id);
    return NextResponse.json({ message: 'Memory deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete memory' },
      { status: 400 }
    );
  }
}

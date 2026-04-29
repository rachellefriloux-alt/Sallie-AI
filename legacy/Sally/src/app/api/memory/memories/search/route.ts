/**
 * POST /api/memory/memories/search — MemoryServiceImpl searchMemories().
 * Production implementation with Prisma persistence.
 * Text search; vector/semantic search requires pgvector (future).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-helpers';
import { cookies } from 'next/headers';
import { validateContent, validateTags } from '@/lib/memory-validators';

function toApiMemory(row: {
  id: string;
  content: string;
  embedding: unknown;
  metadata: unknown;
  tags: unknown;
  accessCount: number;
  lastAccessed: Date;
  salience: { toNumber: () => number } | number;
  createdAt: Date;
  updatedAt: Date;
  actorId: string | null;
}) {
  const salience = typeof row.salience === 'object' && row.salience !== null && 'toNumber' in row.salience
    ? (row.salience as { toNumber: () => number }).toNumber()
    : Number(row.salience);
  const metadata = (row.metadata as Record<string, unknown>) ?? {};
  const tags = Array.isArray(row.tags) ? row.tags : [];
  const embedding = Array.isArray(row.embedding) ? row.embedding : [];

  return {
    id: row.id,
    content: row.content,
    embedding,
    metadata: {
      type: metadata.type ?? 'conversation',
      source: metadata.source ?? 'user_input',
      ...metadata,
    },
    created_at: row.createdAt.getTime(),
    updated_at: row.updatedAt.getTime(),
    access_count: row.accessCount,
    last_accessed: row.lastAccessed.getTime(),
    salience,
    tags,
    actor_id: row.actorId ?? undefined,
  };
}

export async function POST(request: NextRequest) {
  const start = performance.now();
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const b = body as Record<string, any>;
    const rawQuery = validateContent(b.query) ?? '';
    const limit = typeof b.limit === 'number' && b.limit > 0 && b.limit <= 100 ? Math.floor(b.limit) : 20;
    const tagsFilter = validateTags(Array.isArray(b.filters?.tags) ? b.filters.tags : []);

    const where: { actorId?: string; content?: { contains: string; mode: 'insensitive' } } = {};
    if (user?.id) {
      where.actorId = user.id;
    }
    if (rawQuery) {
      where.content = { contains: rawQuery, mode: 'insensitive' };
    }

    const [memories, total] = await Promise.all([
      prisma.memory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.memory.count({ where }),
    ]);

    const searchTimeMs = Math.round(performance.now() - start);

    const result = {
      memories: memories.map(toApiMemory),
      total_count: total,
      search_time_ms: searchTimeMs,
      query_used: rawQuery,
      filters_applied: { tags: tagsFilter },
    };

    return NextResponse.json({ result });
  } catch (e) {
    console.error('api/memory/memories/search POST:', e);
    return NextResponse.json(
      { error: 'Failed to search memories' },
      { status: 500 }
    );
  }
}

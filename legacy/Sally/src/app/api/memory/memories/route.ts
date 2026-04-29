/**
 * POST /api/memory/memories — MemoryServiceImpl createMemory().
 * Production implementation with Prisma persistence and validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-helpers';
import { cookies } from 'next/headers';
import {
  validateContent,
  validateMetadata,
  validateTags,
  validateEmbedding,
  validateSalience,
} from '@/lib/memory-validators';

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

    const b = body as Record<string, unknown>;
    const content = validateContent(b.content);
    if (!content) {
      return NextResponse.json(
        { error: 'content is required and must be a non-empty string (max 100KB)' },
        { status: 400 }
      );
    }

    const metadata = validateMetadata(b.metadata);
    if (!metadata) {
      return NextResponse.json(
        { error: 'metadata must be a valid object with type and source' },
        { status: 400 }
      );
    }

    const tags = validateTags(b.tags);
    const embedding = validateEmbedding(b.embedding ?? b.query_embedding);
    const salience = validateSalience(b.salience);
    const actorId = user?.id ?? (typeof b.actor_id === 'string' ? b.actor_id : null);

    const memory = await prisma.memory.create({
      data: {
        actorId,
        content,
        embedding: embedding as object,
        metadata: metadata as object,
        tags: tags as object,
        salience,
        accessCount: 0,
      },
    });

    return NextResponse.json({ memory: toApiMemory(memory) });
  } catch (e) {
    console.error('api/memory/memories POST:', e);
    return NextResponse.json(
      { error: 'Failed to create memory' },
      { status: 500 }
    );
  }
}

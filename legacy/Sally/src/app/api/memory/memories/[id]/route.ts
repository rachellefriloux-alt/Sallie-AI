/**
 * GET /api/memory/memories/[id] — MemoryServiceImpl getMemoryById()
 * PUT /api/memory/memories/[id] — MemoryServiceImpl updateMemory()
 * DELETE /api/memory/memories/[id] — MemoryServiceImpl deleteMemory()
 * Production implementation with Prisma persistence.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-helpers';
import { cookies } from 'next/headers';
import { validateUuid, validateContent, validateMetadata, validateTags, validateSalience } from '@/lib/memory-validators';

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!validateUuid(id)) {
      return NextResponse.json({ error: 'Invalid memory ID' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);

    const memory = await prisma.memory.findUnique({
      where: { id },
    });

    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    if (user?.id && memory.actorId && memory.actorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.memory.update({
      where: { id },
      data: {
        accessCount: { increment: 1 },
        lastAccessed: new Date(),
      },
    });

    const updated = await prisma.memory.findUnique({ where: { id } });
    return NextResponse.json({ memory: toApiMemory(updated!) });
  } catch (e) {
    console.error('api/memory/memories/[id] GET:', e);
    return NextResponse.json({ error: 'Failed to get memory' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!validateUuid(id)) {
      return NextResponse.json({ error: 'Invalid memory ID' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);

    const existing = await prisma.memory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }
    if (user?.id && existing.actorId && existing.actorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const b = body as Record<string, unknown>;
    const updates: { content?: string; metadata?: object; tags?: object; salience?: number } = {};

    if (b.content !== undefined) {
      const content = validateContent(b.content);
      if (content === null) {
        return NextResponse.json({ error: 'content must be a non-empty string' }, { status: 400 });
      }
      updates.content = content;
    }
    if (b.metadata !== undefined) {
      const metadata = validateMetadata(b.metadata);
      if (!metadata) return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
      updates.metadata = metadata as object;
    }
    if (b.tags !== undefined) {
      updates.tags = validateTags(b.tags) as object;
    }
    if (b.salience !== undefined) {
      updates.salience = validateSalience(b.salience);
    }

    const memory = await prisma.memory.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ memory: toApiMemory(memory) });
  } catch (e) {
    console.error('api/memory/memories/[id] PUT:', e);
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!validateUuid(id)) {
      return NextResponse.json({ error: 'Invalid memory ID' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);

    const existing = await prisma.memory.findUnique({ where: { id } });
    if (!existing) {
      return new NextResponse(null, { status: 204 });
    }
    if (user?.id && existing.actorId && existing.actorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.memory.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('api/memory/memories/[id] DELETE:', e);
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
  }
}

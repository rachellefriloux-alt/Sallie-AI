/**
 * GET /api/memory/metadata — MemoryServiceImpl getMetadata().
 * Production implementation returning supported types and sources.
 */

import { NextResponse } from 'next/server';
import { MEMORY_TYPES, MEMORY_SOURCES } from '@/lib/memory-validators';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      types: [...MEMORY_TYPES],
      sources: [...MEMORY_SOURCES],
    },
  });
}

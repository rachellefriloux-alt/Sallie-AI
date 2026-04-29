import { NextResponse } from 'next/server';
import { KNOWLEDGE_SOURCES } from '@/lib/omnis-knowledge';

export async function GET() {
  return NextResponse.json(KNOWLEDGE_SOURCES);
}

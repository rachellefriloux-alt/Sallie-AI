import { NextRequest, NextResponse } from 'next/server';
import { OMNIS_MODES } from '@/lib/omnis-knowledge';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const mode = OMNIS_MODES.find((m) => m.id === id);
  if (!mode) {
    return NextResponse.json({ error: 'Mode not found' }, { status: 404 });
  }
  return NextResponse.json({ activeMode: mode });
}

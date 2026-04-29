/**
 * Feature toggle (enable/disable). Persists in settings store on client; this endpoint acknowledges.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await _req.json().catch(() => ({}));
  const enabled = Boolean(body.enabled);
  return NextResponse.json({ success: true, featureId: id, enabled });
}

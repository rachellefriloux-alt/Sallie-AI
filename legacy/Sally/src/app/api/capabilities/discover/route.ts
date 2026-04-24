import { NextResponse } from 'next/server';
import { discoverCapabilities } from '@/lib/capability-registry';

export async function GET() {
  try {
    const result = await discoverCapabilities();
    return NextResponse.json(result);
  } catch (e) {
    console.error('api/capabilities/discover GET:', e);
    return NextResponse.json({ error: 'Discovery failed' }, { status: 500 });
  }
}

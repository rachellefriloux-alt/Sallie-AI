import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    await getAuthUser(cookieStore);
    const body = await req.json();
    const events = Array.isArray(body?.events) ? body.events : (body ? [body] : []);
    if (events.length > 0) {
      // Optional: persist to ControlLog or a dedicated analytics table; for now accept and return ok
    }
    return NextResponse.json({ received: events.length });
  } catch {
    return NextResponse.json({ received: 0 }, { status: 200 });
  }
}

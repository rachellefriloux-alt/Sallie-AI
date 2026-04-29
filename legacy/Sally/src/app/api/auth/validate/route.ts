import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

async function validate(token: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return !error && !!user;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace(/Bearer\s+/i, '') ?? req.nextUrl.searchParams.get('token');
    if (!token) return NextResponse.json({ valid: false }, { status: 200 });
    const valid = await validate(token);
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace(/Bearer\s+/i, '');
    if (!token) return NextResponse.json({ valid: false }, { status: 200 });
    const valid = await validate(token);
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false }, { status: 200 });
  }
}

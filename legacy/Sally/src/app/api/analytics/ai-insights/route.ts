import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    await getAuthUser(cookieStore);
    await req.json();
    return NextResponse.json([]);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

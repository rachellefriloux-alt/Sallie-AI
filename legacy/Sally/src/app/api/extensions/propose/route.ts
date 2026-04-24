/**
 * POST /api/extensions/propose — Create Extension (proposed).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name : 'Unnamed extension';
    const ext = await prisma.extension.create({
      data: { userId: user.id, name, proposed: true, status: 'pending' },
    });
    return NextResponse.json({ id: ext.id, name: ext.name, proposed: ext.proposed, status: ext.status });
  } catch (e) {
    console.error('api/extensions/propose:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

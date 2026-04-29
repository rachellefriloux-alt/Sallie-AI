/**
 * POST /api/communication/email/draft — Create EmailDraft.
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
    const to = typeof body.to === 'string' ? body.to : null;
    const subject = typeof body.subject === 'string' ? body.subject : null;
    const bodyText = typeof body.body === 'string' ? body.body : null;
    const draft = await prisma.emailDraft.create({
      data: { userId: user.id, to, subject, body: bodyText },
    });
    return NextResponse.json({
      id: draft.id,
      to: draft.to,
      subject: draft.subject,
      body: draft.body,
      createdAt: draft.createdAt,
    });
  } catch (e) {
    console.error('api/communication/email/draft:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

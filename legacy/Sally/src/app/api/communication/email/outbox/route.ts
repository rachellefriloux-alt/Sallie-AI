/**
 * GET /api/communication/email/outbox — Email drafts from EmailDraft.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json([]);

    const rows = await prisma.emailDraft.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        to: r.to,
        subject: r.subject,
        body: r.body,
        createdAt: r.createdAt,
      }))
    );
  } catch (e) {
    console.error('api/communication/email/outbox:', e);
    return NextResponse.json([]);
  }
}

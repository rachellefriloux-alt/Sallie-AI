/**
 * Data export: conversations, profile, heritage. JSON or TXT.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserDetailFromRequest } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserDetailFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const format = req.nextUrl.searchParams.get('format') || 'json';

    const [profile, heritage, conversations] = await Promise.all([
      prisma.profile.findUnique({ where: { id: user.id } }),
      prisma.heritageDna.findUnique({ where: { userId: user.id } }),
      prisma.conversation.findMany({
        where: { userId: user.id },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const email = user.email ?? '';
    const payload = {
      exportedAt: new Date().toISOString(),
      user: { id: user.id, email },
      profile,
      heritage: heritage ? { answers: heritage.answers, completedAt: heritage.completedAt } : null,
      conversations,
    };

    if (format === 'txt') {
      const lines = [
        'Sallie Data Export',
        `Exported: ${payload.exportedAt}`,
        `User: ${email}`,
        '',
        '--- Conversations ---',
      ];
      for (const c of conversations) {
        lines.push(`[${c.createdAt.toISOString()}] ${c.title || 'Untitled'}`);
        for (const m of c.messages) {
          lines.push(`  ${m.role}: ${m.content}`);
        }
        lines.push('');
      }
      const text = lines.join('\n');
      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="sallie-export.txt"',
        },
      });
    }

    return NextResponse.json(payload, {
      headers: {
        'Content-Disposition': 'attachment; filename="sallie-export.json"',
      },
    });
  } catch (e) {
    console.error('api/user/export:', e);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

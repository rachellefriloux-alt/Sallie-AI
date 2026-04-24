/**
 * GET /api/learning/summary — Skills and projects for summary.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ skills: [], projects: [] });

    const [skills, projects] = await Promise.all([
      prisma.learningSkill.findMany({ where: { userId: user.id }, take: 50 }),
      prisma.learningProject.findMany({ where: { userId: user.id }, take: 50 }),
    ]);
    return NextResponse.json({
      skills: skills.map((s) => ({ id: s.id, name: s.name, level: s.level })),
      projects: projects.map((p) => ({ id: p.id, name: p.name, status: p.status, description: p.description })),
    });
  } catch (e) {
    console.error('api/learning/summary:', e);
    return NextResponse.json({ skills: [], projects: [] });
  }
}

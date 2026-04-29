/**
 * GET /api/learning/overview — Aggregated learning metrics and recent activity.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ skillsCount: 0, projectsCount: 0, recent: [] });

    const [skills, projects, recentProjects] = await Promise.all([
      prisma.learningSkill.count({ where: { userId: user.id } }),
      prisma.learningProject.count({ where: { userId: user.id } }),
      prisma.learningProject.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);
    return NextResponse.json({
      skillsCount: skills,
      projectsCount: projects,
      recent: recentProjects.map((p) => ({ id: p.id, name: p.name, status: p.status })),
    });
  } catch (e) {
    console.error('api/learning/overview:', e);
    return NextResponse.json({ skillsCount: 0, projectsCount: 0, recent: [] });
  }
}

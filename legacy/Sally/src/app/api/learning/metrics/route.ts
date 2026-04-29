/**
 * GET /api/learning/metrics — Aggregated from LearningSkill and LearningProject.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = await getAuthUser(cookieStore);
    if (!user) return NextResponse.json({ skillsCount: 0, projectsCount: 0, averageLevel: 0 });

    const [skills, projects] = await Promise.all([
      prisma.learningSkill.findMany({ where: { userId: user.id } }),
      prisma.learningProject.findMany({ where: { userId: user.id } }),
    ]);
    const averageLevel =
      skills.length > 0 ? Math.round(skills.reduce((a, s) => a + s.level, 0) / skills.length) : 0;
    return NextResponse.json({
      skillsCount: skills.length,
      projectsCount: projects.length,
      averageLevel,
    });
  } catch (e) {
    console.error('api/learning/metrics:', e);
    return NextResponse.json({ skillsCount: 0, projectsCount: 0, averageLevel: 0 });
  }
}

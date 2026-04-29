/**
 * POST /api/learning/create — Create LearningProject (or skill from body type).
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
    const type = (body.type ?? body.kind) === 'skill' ? 'skill' : 'project';

    if (type === 'skill') {
      const name = typeof body.name === 'string' ? body.name : 'New skill';
      const level = Math.min(100, Math.max(0, Number(body.level) ?? 0));
      const skill = await prisma.learningSkill.create({
        data: { userId: user.id, name, level },
      });
      return NextResponse.json({ id: skill.id, name: skill.name, level: skill.level, type: 'skill' });
    }

    const name = typeof body.name === 'string' ? body.name : 'New project';
    const description = typeof body.description === 'string' ? body.description : null;
    const project = await prisma.learningProject.create({
      data: { userId: user.id, name, description, status: 'active' },
    });
    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      type: 'project',
    });
  } catch (e) {
    console.error('api/learning/create:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

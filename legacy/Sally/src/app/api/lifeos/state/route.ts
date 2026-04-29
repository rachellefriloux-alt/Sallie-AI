import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [projects, extensions] = await Promise.all([
      prisma.learningProject.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.extension.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;
    const activeExtensions = extensions.filter((e) => e.status === 'active').length;
    const automationLevel = extensions.length > 0
      ? Math.round((activeExtensions / extensions.length) * 100) / 100
      : 0;

    return NextResponse.json({
      businesses: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      kpis: {
        totalProjects,
        activeProjects,
        completedProjects,
        automationLevel,
      },
      automation: extensions.map((e) => ({
        id: e.id,
        name: e.name,
        proposed: e.proposed,
        status: e.status,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    console.error('api/lifeos/state GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

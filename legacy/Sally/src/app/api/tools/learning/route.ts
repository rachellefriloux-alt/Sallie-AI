import { NextRequest, NextResponse } from 'next/server';
import { azureOpenAIConfig } from '@/lib/config';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
  targetLevel: number;
  progress: number;
  milestones: string[];
  completedMilestones: string[];
  createdAt: string;
  updatedAt: string;
}

interface StudyPlan {
  id: string;
  skillId: string;
  title: string;
  steps: StudyStep[];
  estimatedHours: number;
  createdAt: string;
}

interface StudyStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  resources: string[];
}

const skills = new Map<string, Skill>();
const studyPlans = new Map<string, StudyPlan>();

function getAIConfig() {
  const apiKey =
    azureOpenAIConfig.apiKey ||
    process.env.AZURE_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY;
  const isAzure = !!(
    azureOpenAIConfig.endpoint ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    process.env.AZURE_OPENAI_RESOURCE
  );
  const deployment =
    azureOpenAIConfig.deployment ||
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.AI_MODEL ||
    'gpt-4o';
  const azureResource = azureOpenAIConfig.resource || process.env.AZURE_OPENAI_RESOURCE;
  const azureEndpoint = azureOpenAIConfig.endpoint || process.env.AZURE_OPENAI_ENDPOINT;

  let url: string;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (isAzure && azureEndpoint) {
    url = `${azureEndpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey || '';
  } else if (isAzure && azureResource) {
    url = `https://${azureResource}.openai.azure.com/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`;
    headers['api-key'] = apiKey || '';
  } else {
    url = `${process.env.AI_BASE_URL || 'https://api.openai.com'}/v1/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return { url, headers, apiKey, isAzure };
}

async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  const { url, headers, apiKey, isAzure } = getAIConfig();
  if (!apiKey) return '';

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: isAzure ? undefined : (process.env.AI_MODEL || 'gpt-4o'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'list';
  const skillId = searchParams.get('skillId');
  const category = searchParams.get('category');

  if (action === 'progress' && skillId) {
    const skill = skills.get(skillId);
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }
    const plans = Array.from(studyPlans.values()).filter((p) => p.skillId === skillId);
    const totalSteps = plans.reduce((s, p) => s + p.steps.length, 0);
    const completedSteps = plans.reduce(
      (s, p) => s + p.steps.filter((st) => st.completed).length,
      0
    );
    return NextResponse.json({
      skill,
      plans,
      progress: {
        totalSteps,
        completedSteps,
        percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
        milestonesCompleted: skill.completedMilestones.length,
        milestonesTotal: skill.milestones.length,
      },
    });
  }

  if (action === 'plans') {
    const allPlans = skillId
      ? Array.from(studyPlans.values()).filter((p) => p.skillId === skillId)
      : Array.from(studyPlans.values());
    return NextResponse.json({ plans: allPlans });
  }

  let allSkills = Array.from(skills.values());
  if (category) {
    allSkills = allSkills.filter((s) => s.category === category);
  }
  allSkills.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json({
    skills: allSkills,
    categories: [...new Set(Array.from(skills.values()).map((s) => s.category))],
    stats: {
      totalSkills: skills.size,
      averageProgress:
        allSkills.length > 0
          ? Math.round(allSkills.reduce((s, sk) => s + sk.progress, 0) / allSkills.length)
          : 0,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create_skill') {
      const { name, category, level, targetLevel, milestones } = body;
      if (!name || typeof name !== 'string') {
        return NextResponse.json({ error: 'Skill name required' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const id = `skill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const skill: Skill = {
        id,
        name: name.trim(),
        category: category || 'general',
        level: typeof level === 'number' ? level : 1,
        targetLevel: typeof targetLevel === 'number' ? targetLevel : 10,
        progress: 0,
        milestones: Array.isArray(milestones) ? milestones : [],
        completedMilestones: [],
        createdAt: now,
        updatedAt: now,
      };
      skills.set(id, skill);
      return NextResponse.json({ skill, message: `Skill "${skill.name}" created` }, { status: 201 });
    }

    if (action === 'generate_plan') {
      const { skillId, skillName, currentLevel, targetLevel, hoursPerWeek } = body;

      const targetSkill = skillId ? skills.get(skillId) : null;
      const name = targetSkill?.name || skillName || 'Unknown Skill';
      const current = targetSkill?.level || currentLevel || 1;
      const target = targetSkill?.targetLevel || targetLevel || 10;

      const aiResult = await callAI(
        `You are a learning plan generator. Create a structured study plan.
Return valid JSON with this exact structure:
{"title": "string", "steps": [{"title": "string", "description": "string", "duration": "string", "resources": ["url or book title"]}], "estimatedHours": number}
Only return JSON, no markdown.`,
        `Create a study plan for "${name}" from level ${current} to level ${target}. Available study time: ${hoursPerWeek || 5} hours per week.`
      );

      let planData = { title: `Study Plan: ${name}`, steps: [] as any[], estimatedHours: 10 };
      try {
        const cleaned = aiResult.replace(/```json\n?|```\n?/g, '').trim();
        planData = JSON.parse(cleaned);
      } catch {
        planData = {
          title: `Study Plan: ${name}`,
          steps: [
            { title: 'Research fundamentals', description: 'Study core concepts', duration: '2 hours', resources: [] },
            { title: 'Practice exercises', description: 'Apply concepts through practice', duration: '3 hours', resources: [] },
            { title: 'Build a project', description: 'Create a practical project', duration: '5 hours', resources: [] },
          ],
          estimatedHours: 10,
        };
      }

      const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const plan: StudyPlan = {
        id: planId,
        skillId: skillId || '',
        title: planData.title,
        steps: (planData.steps || []).map((s: any, i: number) => ({
          id: `step_${i}_${Math.random().toString(36).slice(2, 8)}`,
          title: s.title || `Step ${i + 1}`,
          description: s.description || '',
          duration: s.duration || '1 hour',
          completed: false,
          resources: Array.isArray(s.resources) ? s.resources : [],
        })),
        estimatedHours: planData.estimatedHours || 10,
        createdAt: new Date().toISOString(),
      };
      studyPlans.set(planId, plan);

      return NextResponse.json({ plan, message: 'Study plan generated' }, { status: 201 });
    }

    if (action === 'update_progress') {
      const { skillId, stepId, planId, completed, milestone } = body;

      if (planId && stepId) {
        const plan = studyPlans.get(planId);
        if (!plan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }
        const step = plan.steps.find((s) => s.id === stepId);
        if (!step) {
          return NextResponse.json({ error: 'Step not found' }, { status: 404 });
        }
        step.completed = completed !== false;

        if (plan.skillId) {
          const skill = skills.get(plan.skillId);
          if (skill) {
            const totalSteps = plan.steps.length;
            const completedSteps = plan.steps.filter((s) => s.completed).length;
            skill.progress = Math.round((completedSteps / totalSteps) * 100);
            skill.updatedAt = new Date().toISOString();
          }
        }

        return NextResponse.json({ step, message: `Step "${step.title}" marked as ${step.completed ? 'completed' : 'incomplete'}` });
      }

      if (skillId && milestone) {
        const skill = skills.get(skillId);
        if (!skill) {
          return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
        }
        if (!skill.completedMilestones.includes(milestone)) {
          skill.completedMilestones.push(milestone);
        }
        skill.updatedAt = new Date().toISOString();
        return NextResponse.json({ skill, message: `Milestone "${milestone}" completed` });
      }

      if (skillId) {
        const skill = skills.get(skillId);
        if (!skill) {
          return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
        }
        if (typeof body.level === 'number') skill.level = body.level;
        if (typeof body.progress === 'number') skill.progress = Math.min(100, Math.max(0, body.progress));
        skill.updatedAt = new Date().toISOString();
        return NextResponse.json({ skill, message: 'Skill progress updated' });
      }

      return NextResponse.json({ error: 'skillId or planId+stepId required' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "create_skill", "generate_plan", or "update_progress"' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Learning operation failed' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skillId = searchParams.get('skillId');
    const planId = searchParams.get('planId');

    if (planId) {
      if (!studyPlans.has(planId)) {
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
      studyPlans.delete(planId);
      return NextResponse.json({ message: 'Study plan deleted' });
    }

    if (skillId) {
      if (!skills.has(skillId)) {
        return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
      }
      skills.delete(skillId);
      for (const [id, plan] of studyPlans) {
        if (plan.skillId === skillId) {
          studyPlans.delete(id);
        }
      }
      return NextResponse.json({ message: 'Skill and associated plans deleted' });
    }

    return NextResponse.json({ error: 'skillId or planId query parameter required' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  order: number;
  dependsOn: string[];
  output: any;
  startedAt: string | null;
  completedAt: string | null;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed';
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

const workflows = new Map<string, Workflow>();

function getNextExecutableSteps(workflow: Workflow): WorkflowStep[] {
  return workflow.steps.filter((step) => {
    if (step.status !== 'pending') return false;
    return step.dependsOn.every((depId) => {
      const dep = workflow.steps.find((s) => s.id === depId);
      return dep && dep.status === 'completed';
    });
  });
}

function updateWorkflowStatus(workflow: Workflow): void {
  const allCompleted = workflow.steps.every(
    (s) => s.status === 'completed' || s.status === 'skipped'
  );
  const anyFailed = workflow.steps.some((s) => s.status === 'failed');

  if (allCompleted) {
    workflow.status = 'completed';
  } else if (anyFailed) {
    workflow.status = 'failed';
  }
  workflow.updatedAt = new Date().toISOString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const status = searchParams.get('status');

  if (id) {
    const workflow = workflows.get(id);
    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }
    const nextSteps = getNextExecutableSteps(workflow);
    return NextResponse.json({ workflow, nextExecutableSteps: nextSteps });
  }

  let results = Array.from(workflows.values());
  if (status) {
    results = results.filter((w) => w.status === status);
  }
  results.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return NextResponse.json({ workflows: results, total: results.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const { name, description, steps, metadata } = body;

      if (!name || !steps || !Array.isArray(steps) || steps.length === 0) {
        return NextResponse.json(
          { error: 'Missing required fields: name, steps (non-empty array)' },
          { status: 400 }
        );
      }

      const workflowId = `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();

      const workflowSteps: WorkflowStep[] = steps.map(
        (s: any, index: number) => ({
          id: s.id || `step_${index + 1}`,
          name: s.name || `Step ${index + 1}`,
          description: s.description || '',
          status: 'pending' as StepStatus,
          order: s.order ?? index + 1,
          dependsOn: s.dependsOn || [],
          output: null,
          startedAt: null,
          completedAt: null,
        })
      );

      const stepIds = new Set(workflowSteps.map((s) => s.id));
      for (const step of workflowSteps) {
        for (const dep of step.dependsOn) {
          if (!stepIds.has(dep)) {
            return NextResponse.json(
              { error: `Step "${step.id}" depends on unknown step "${dep}"` },
              { status: 400 }
            );
          }
        }
      }

      const workflow: Workflow = {
        id: workflowId,
        name,
        description: description || '',
        status: 'draft',
        steps: workflowSteps,
        createdAt: now,
        updatedAt: now,
        metadata: metadata || {},
      };

      workflows.set(workflowId, workflow);

      return NextResponse.json(
        {
          workflow,
          message: `Workflow "${name}" created with ${workflowSteps.length} step(s)`,
        },
        { status: 201 }
      );
    }

    if (action === 'start') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'Workflow id required' }, { status: 400 });
      }
      const workflow = workflows.get(id);
      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      if (workflow.status === 'running') {
        return NextResponse.json({ error: 'Workflow is already running' }, { status: 400 });
      }

      workflow.status = 'running';
      workflow.updatedAt = new Date().toISOString();

      const nextSteps = getNextExecutableSteps(workflow);

      return NextResponse.json({
        workflow,
        nextExecutableSteps: nextSteps,
        message: `Workflow "${workflow.name}" started`,
      });
    }

    if (action === 'advance-step') {
      const { id, stepId, status: stepStatus, output } = body;
      if (!id || !stepId) {
        return NextResponse.json(
          { error: 'Workflow id and stepId required' },
          { status: 400 }
        );
      }
      const workflow = workflows.get(id);
      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }

      const step = workflow.steps.find((s) => s.id === stepId);
      if (!step) {
        return NextResponse.json({ error: 'Step not found' }, { status: 404 });
      }

      const newStatus: StepStatus = stepStatus || 'completed';
      const now = new Date().toISOString();

      if (newStatus === 'in_progress') {
        step.status = 'in_progress';
        step.startedAt = now;
      } else if (newStatus === 'completed' || newStatus === 'failed' || newStatus === 'skipped') {
        step.status = newStatus;
        step.completedAt = now;
        if (!step.startedAt) step.startedAt = now;
      }

      if (output !== undefined) {
        step.output = output;
      }

      updateWorkflowStatus(workflow);
      const nextSteps = getNextExecutableSteps(workflow);

      return NextResponse.json({
        workflow,
        updatedStep: step,
        nextExecutableSteps: nextSteps,
        message: `Step "${step.name}" marked as ${newStatus}`,
      });
    }

    if (action === 'pause') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'Workflow id required' }, { status: 400 });
      }
      const workflow = workflows.get(id);
      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      workflow.status = 'paused';
      workflow.updatedAt = new Date().toISOString();
      return NextResponse.json({
        workflow,
        message: `Workflow "${workflow.name}" paused`,
      });
    }

    if (action === 'resume') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'Workflow id required' }, { status: 400 });
      }
      const workflow = workflows.get(id);
      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      workflow.status = 'running';
      workflow.updatedAt = new Date().toISOString();
      const nextSteps = getNextExecutableSteps(workflow);
      return NextResponse.json({
        workflow,
        nextExecutableSteps: nextSteps,
        message: `Workflow "${workflow.name}" resumed`,
      });
    }

    if (action === 'delete') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'Workflow id required' }, { status: 400 });
      }
      if (!workflows.has(id)) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      workflows.delete(id);
      return NextResponse.json({ message: 'Workflow deleted' });
    }

    if (action === 'clear') {
      workflows.clear();
      return NextResponse.json({ message: 'All workflows cleared' });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use: create, start, advance-step, pause, resume, delete, or clear' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Workflow operation failed' },
      { status: 400 }
    );
  }
}

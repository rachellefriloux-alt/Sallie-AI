/**
 * GET/POST/PUT/DELETE /api/life/tasks — Manage smart tasks.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, getPreference, setPreference } from '@/lib/api-helpers';

export type LifeTask = {
  id: string;
  text: string;
  tags: string[];
  urgent?: string;
  done: boolean;
  waiting?: boolean;
  sub?: string;
  context?: string;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_TASKS: LifeTask[] = [];

async function getTasks(userId: string): Promise<LifeTask[]> {
  return (await getPreference<LifeTask[]>(userId, 'life_tasks')) ?? DEFAULT_TASKS;
}

async function saveTasks(userId: string, tasks: LifeTask[]): Promise<void> {
  await setPreference(userId, 'life_tasks', tasks);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ tasks: [] });
    const tasks = await getTasks(user.id);
    return NextResponse.json({ tasks });
  } catch (e) {
    console.error('api/life/tasks GET:', e);
    return NextResponse.json({ tasks: [], error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { text, tags, urgent, waiting, sub, context } = body;
    
    if (!text) return NextResponse.json({ error: 'Task text required' }, { status: 400 });
    
    const tasks = await getTasks(user.id);
    const newTask: LifeTask = {
      id: Date.now().toString(),
      text,
      tags: tags || [],
      urgent: urgent ?? null,
      waiting: waiting ?? false,
      sub: sub ?? null,
      context: context ?? null,
      done: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    await saveTasks(user.id, tasks);
    
    return NextResponse.json({ task: newTask });
  } catch (e) {
    console.error('api/life/tasks POST:', e);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    
    const tasks = await getTasks(user.id);
    const index = tasks.findIndex((t) => t.id === id);
    
    if (index === -1) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    
    tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
    await saveTasks(user.id, tasks);
    
    return NextResponse.json({ task: tasks[index] });
  } catch (e) {
    console.error('api/life/tasks PUT:', e);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    
    const tasks = await getTasks(user.id);
    const filtered = tasks.filter((t) => t.id !== id);
    await saveTasks(user.id, filtered);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('api/life/tasks DELETE:', e);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
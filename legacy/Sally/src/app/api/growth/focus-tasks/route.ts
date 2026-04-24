/**
 * GET/POST/PUT/DELETE /api/growth/focus-tasks — Manage daily focus tasks.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, getPreference, setPreference } from '@/lib/api-helpers';

export type FocusTask = {
  id: string;
  text: string;
  sub: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_TASKS: FocusTask[] = [];

async function getTasks(userId: string): Promise<FocusTask[]> {
  return (await getPreference<FocusTask[]>(userId, 'growth_focus_tasks')) ?? DEFAULT_TASKS;
}

async function saveTasks(userId: string, tasks: FocusTask[]): Promise<void> {
  await setPreference(userId, 'growth_focus_tasks', tasks);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ tasks: [] });
    const tasks = await getTasks(user.id);
    return NextResponse.json({ tasks });
  } catch (e) {
    console.error('api/growth/focus-tasks GET:', e);
    return NextResponse.json({ tasks: [], error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { text, sub } = body;
    
    if (!text) return NextResponse.json({ error: 'Task text required' }, { status: 400 });
    
    const tasks = await getTasks(user.id);
    const newTask: FocusTask = {
      id: Date.now().toString(),
      text,
      sub: sub || '',
      done: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    await saveTasks(user.id, tasks);
    
    return NextResponse.json({ task: newTask });
  } catch (e) {
    console.error('api/growth/focus-tasks POST:', e);
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
    console.error('api/growth/focus-tasks PUT:', e);
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
    console.error('api/growth/focus-tasks DELETE:', e);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
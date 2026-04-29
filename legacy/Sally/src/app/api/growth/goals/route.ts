/**
 * GET/POST /api/growth/goals — Manage personal growth goals.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, getPreference, setPreference } from '@/lib/api-helpers';

export type Goal = {
  id: string;
  title: string;
  sub: string;
  progress?: number;
  color?: string;
  nextStep?: string;
  streak?: number;
  totalDays?: number;
  scheduled?: string;
  sessions?: string;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_GOALS: Goal[] = [];

async function getGoals(userId: string): Promise<Goal[]> {
  return (await getPreference<Goal[]>(userId, 'growth_goals')) ?? DEFAULT_GOALS;
}

async function saveGoals(userId: string, goals: Goal[]): Promise<void> {
  await setPreference(userId, 'growth_goals', goals);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ goals: [] });
    const goals = await getGoals(user.id);
    return NextResponse.json({ goals });
  } catch (e) {
    console.error('api/growth/goals GET:', e);
    return NextResponse.json({ goals: [], error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { title, sub, progress, color, nextStep, streak, totalDays, scheduled, sessions } = body;
    
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    
    const goals = await getGoals(user.id);
    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      sub: sub || '',
      progress: progress ?? null,
      color: color ?? 'purple',
      nextStep: nextStep ?? null,
      streak: streak ?? null,
      totalDays: totalDays ?? null,
      scheduled: scheduled ?? null,
      sessions: sessions ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    goals.push(newGoal);
    await saveGoals(user.id, goals);
    
    return NextResponse.json({ goal: newGoal });
  } catch (e) {
    console.error('api/growth/goals POST:', e);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    
    const goals = await getGoals(user.id);
    const index = goals.findIndex((g) => g.id === id);
    
    if (index === -1) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    
    goals[index] = { ...goals[index], ...updates, updatedAt: new Date().toISOString() };
    await saveGoals(user.id, goals);
    
    return NextResponse.json({ goal: goals[index] });
  } catch (e) {
    console.error('api/growth/goals PUT:', e);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    
    const goals = await getGoals(user.id);
    const filtered = goals.filter((g) => g.id !== id);
    await saveGoals(user.id, filtered);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('api/growth/goals DELETE:', e);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
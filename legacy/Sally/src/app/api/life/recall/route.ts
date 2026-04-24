/**
 * GET/POST/PUT/DELETE /api/life/recall — Manage quick recall information.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, getPreference, setPreference } from '@/lib/api-helpers';

export type RecallItem = {
  id: string;
  label: string;
  title: string;
  sub: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_RECALL: RecallItem[] = [];

async function getRecallItems(userId: string): Promise<RecallItem[]> {
  return (await getPreference<RecallItem[]>(userId, 'life_recall')) ?? DEFAULT_RECALL;
}

async function saveRecallItems(userId: string, items: RecallItem[]): Promise<void> {
  await setPreference(userId, 'life_recall', items);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ items: [] });
    const items = await getRecallItems(user.id);
    return NextResponse.json({ items });
  } catch (e) {
    console.error('api/life/recall GET:', e);
    return NextResponse.json({ items: [], error: 'Failed to fetch recall items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { label, title, sub, color } = body;
    
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    
    const items = await getRecallItems(user.id);
    const newItem: RecallItem = {
      id: Date.now().toString(),
      label: label || 'Info',
      title,
      sub: sub || '',
      color: color || 'bg-violet-500/20 text-violet-300',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    items.push(newItem);
    await saveRecallItems(user.id, items);
    
    return NextResponse.json({ item: newItem });
  } catch (e) {
    console.error('api/life/recall POST:', e);
    return NextResponse.json({ error: 'Failed to create recall item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    
    const items = await getRecallItems(user.id);
    const index = items.findIndex((i) => i.id === id);
    
    if (index === -1) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    await saveRecallItems(user.id, items);
    
    return NextResponse.json({ item: items[index] });
  } catch (e) {
    console.error('api/life/recall PUT:', e);
    return NextResponse.json({ error: 'Failed to update recall item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    
    const items = await getRecallItems(user.id);
    const filtered = items.filter((i) => i.id !== id);
    await saveRecallItems(user.id, filtered);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('api/life/recall DELETE:', e);
    return NextResponse.json({ error: 'Failed to delete recall item' }, { status: 500 });
  }
}
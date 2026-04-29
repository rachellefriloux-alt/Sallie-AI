/**
 * GET/POST/PUT/DELETE /api/life/daily-items — Manage daily priority items.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, getPreference, setPreference } from '@/lib/api-helpers';

export type DailyItem = {
  id: string;
  title: string;
  sub: string;
  color: string;
  done: boolean;
  date: string;
  createdAt: string;
};

const DEFAULT_ITEMS: DailyItem[] = [];

async function getDailyItems(userId: string): Promise<DailyItem[]> {
  const stored = await getPreference<DailyItem[]>(userId, 'life_daily_items');
  if (!stored) return DEFAULT_ITEMS;
  
  // Filter to today's items
  const today = new Date().toISOString().split('T')[0];
  return stored.filter(item => item.date === today);
}

async function getAllDailyItems(userId: string): Promise<DailyItem[]> {
  return (await getPreference<DailyItem[]>(userId, 'life_daily_items')) ?? DEFAULT_ITEMS;
}

async function saveDailyItems(userId: string, items: DailyItem[]): Promise<void> {
  await setPreference(userId, 'life_daily_items', items);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ items: [] });
    const items = await getDailyItems(user.id);
    return NextResponse.json({ items });
  } catch (e) {
    console.error('api/life/daily-items GET:', e);
    return NextResponse.json({ items: [], error: 'Failed to fetch daily items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { title, sub, color } = body;
    
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    
    const allItems = await getAllDailyItems(user.id);
    const today = new Date().toISOString().split('T')[0];
    
    const newItem: DailyItem = {
      id: Date.now().toString(),
      title,
      sub: sub || '',
      color: color || 'border-violet-400',
      done: false,
      date: today,
      createdAt: new Date().toISOString(),
    };
    
    allItems.push(newItem);
    await saveDailyItems(user.id, allItems);
    
    return NextResponse.json({ item: newItem });
  } catch (e) {
    console.error('api/life/daily-items POST:', e);
    return NextResponse.json({ error: 'Failed to create daily item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    
    const allItems = await getAllDailyItems(user.id);
    const index = allItems.findIndex((i) => i.id === id);
    
    if (index === -1) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    
    allItems[index] = { ...allItems[index], ...updates };
    await saveDailyItems(user.id, allItems);
    
    return NextResponse.json({ item: allItems[index] });
  } catch (e) {
    console.error('api/life/daily-items PUT:', e);
    return NextResponse.json({ error: 'Failed to update daily item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    
    const allItems = await getAllDailyItems(user.id);
    const filtered = allItems.filter((i) => i.id !== id);
    await saveDailyItems(user.id, filtered);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('api/life/daily-items DELETE:', e);
    return NextResponse.json({ error: 'Failed to delete daily item' }, { status: 500 });
  }
}
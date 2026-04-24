/**
 * GET/POST /api/growth/journal — Personal growth journal entries.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, getPreference, setPreference } from '@/lib/api-helpers';

export type JournalEntry = {
  id: string;
  content: string;
  prompt?: string;
  createdAt: string;
};

const DEFAULT_ENTRIES: JournalEntry[] = [];

async function getJournal(userId: string): Promise<JournalEntry[]> {
  return (await getPreference<JournalEntry[]>(userId, 'growth_journal')) ?? DEFAULT_ENTRIES;
}

async function saveJournal(userId: string, entries: JournalEntry[]): Promise<void> {
  await setPreference(userId, 'growth_journal', entries);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ entries: [] });
    const entries = await getJournal(user.id);
    return NextResponse.json({ entries });
  } catch (e) {
    console.error('api/growth/journal GET:', e);
    return NextResponse.json({ entries: [], error: 'Failed to fetch journal' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { content, prompt } = body;
    
    if (!content) return NextResponse.json({ error: 'Journal content required' }, { status: 400 });
    
    const entries = await getJournal(user.id);
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      content,
      prompt: prompt ?? null,
      createdAt: new Date().toISOString(),
    };
    
    entries.unshift(newEntry); // Add to beginning (newest first)
    
    // Keep only last 100 entries
    if (entries.length > 100) {
      entries.splice(100);
    }
    
    await saveJournal(user.id, entries);
    
    return NextResponse.json({ entry: newEntry });
  } catch (e) {
    console.error('api/growth/journal POST:', e);
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
  }
}
/**
 * GET/POST/PUT/DELETE /api/life/contexts — Manage life contexts.
 * Accepts cookies (web) or Authorization Bearer (mobile).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest, getPreference, setPreference } from '@/lib/api-helpers';

export type LifeContext = {
  id: string;
  label: string;
  icon: string;
  active: boolean;
  createdAt: string;
};

const DEFAULT_CONTEXTS: LifeContext[] = [
  { id: 'command', label: 'Command Center', icon: 'dashboard', active: true, createdAt: '' },
  { id: 'mom', label: 'Mom', icon: 'child_care', active: false, createdAt: '' },
  { id: 'spouse', label: 'Spouse', icon: 'favorite', active: false, createdAt: '' },
  { id: 'business', label: 'Business', icon: 'domain', active: false, createdAt: '' },
  { id: 'self', label: 'Self Care', icon: 'person', active: false, createdAt: '' },
];

async function getContexts(userId: string): Promise<LifeContext[]> {
  const stored = await getPreference<LifeContext[]>(userId, 'life_contexts');
  if (!stored || stored.length === 0) {
    // Initialize with defaults
    const now = new Date().toISOString();
    return DEFAULT_CONTEXTS.map(c => ({ ...c, createdAt: now }));
  }
  return stored;
}

async function saveContexts(userId: string, contexts: LifeContext[]): Promise<void> {
  await setPreference(userId, 'life_contexts', contexts);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ contexts: DEFAULT_CONTEXTS });
    const contexts = await getContexts(user.id);
    return NextResponse.json({ contexts });
  } catch (e) {
    console.error('api/life/contexts GET:', e);
    return NextResponse.json({ contexts: DEFAULT_CONTEXTS, error: 'Failed to fetch contexts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { label, icon } = body;
    
    if (!label) return NextResponse.json({ error: 'Label required' }, { status: 400 });
    
    const contexts = await getContexts(user.id);
    const newContext: LifeContext = {
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      icon: icon || 'person',
      active: false,
      createdAt: new Date().toISOString(),
    };
    
    contexts.push(newContext);
    await saveContexts(user.id, contexts);
    
    return NextResponse.json({ context: newContext });
  } catch (e) {
    console.error('api/life/contexts POST:', e);
    return NextResponse.json({ error: 'Failed to create context' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) return NextResponse.json({ error: 'Context ID required' }, { status: 400 });
    
    const contexts = await getContexts(user.id);
    const index = contexts.findIndex((c) => c.id === id);
    
    if (index === -1) return NextResponse.json({ error: 'Context not found' }, { status: 404 });
    
    // If setting active, deactivate others first
    if (updates.active) {
      contexts.forEach(c => c.active = false);
    }
    
    contexts[index] = { ...contexts[index], ...updates };
    await saveContexts(user.id, contexts);
    
    return NextResponse.json({ context: contexts[index] });
  } catch (e) {
    console.error('api/life/contexts PUT:', e);
    return NextResponse.json({ error: 'Failed to update context' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Context ID required' }, { status: 400 });
    
    const contexts = await getContexts(user.id);
    const filtered = contexts.filter((c) => c.id !== id);
    await saveContexts(user.id, filtered);
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('api/life/contexts DELETE:', e);
    return NextResponse.json({ error: 'Failed to delete context' }, { status: 500 });
  }
}
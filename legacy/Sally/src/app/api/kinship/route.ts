import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import {
  getKinshipUsers,
  getKinshipContext,
  getUserHeritageDna,
  getUserIsolatedMemories,
  getUserProfile,
  getUserConversations,
  getUserLimbicHistory,
  switchUserContext,
} from '@/lib/kinship';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') ?? 'list';
    const targetUserId = searchParams.get('userId') ?? user.id;

    switch (action) {
      case 'list': {
        const users = await getKinshipUsers(user.id);
        return NextResponse.json({ users });
      }

      case 'context': {
        const context = await getKinshipContext(user.id, targetUserId);
        return NextResponse.json({ context });
      }

      case 'heritage': {
        const dna = await getUserHeritageDna(targetUserId);
        return NextResponse.json({ userId: targetUserId, heritage: dna });
      }

      case 'memories': {
        const limit = parseInt(searchParams.get('limit') ?? '50', 10);
        const memories = await getUserIsolatedMemories(targetUserId, limit);
        return NextResponse.json({ userId: targetUserId, memories });
      }

      case 'profile': {
        const profile = await getUserProfile(targetUserId);
        return NextResponse.json({ userId: targetUserId, profile });
      }

      case 'conversations': {
        const limit = parseInt(searchParams.get('limit') ?? '20', 10);
        const conversations = await getUserConversations(targetUserId, limit);
        return NextResponse.json({ userId: targetUserId, conversations });
      }

      case 'limbic': {
        const limit = parseInt(searchParams.get('limit') ?? '20', 10);
        const history = await getUserLimbicHistory(targetUserId, limit);
        return NextResponse.json({ userId: targetUserId, limbicHistory: history });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    console.error('api/kinship GET:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'switch': {
        const { targetUserId } = body;
        if (!targetUserId) {
          return NextResponse.json({ error: 'targetUserId required' }, { status: 400 });
        }
        const context = await switchUserContext(user.id, targetUserId);
        return NextResponse.json({ context });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    console.error('api/kinship POST:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  getDefaultCoreValues,
  computeIdentityHash,
  verifyIdentityIntegrity,
  validateUpgradeProposal,
  applyProposal,
  getProtectionStatus,
  type CoreValue,
  type UpgradeProposal,
  type CoreIdentityState,
} from '@/lib/core-identity';

async function getUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

async function loadIdentityState(userId: string): Promise<CoreIdentityState> {
  try {
    const pref = await prisma.userPreference.findUnique({
      where: { userId_key: { userId, key: 'core_identity' } },
    });

    if (pref && pref.value) {
      const stored = pref.value as unknown as CoreIdentityState;
      if (stored.values && stored.currentHash) {
        return stored;
      }
    }
  } catch (e) {
    console.error('Failed to load identity state from DB:', e);
  }

  const values = getDefaultCoreValues();
  const hash = await computeIdentityHash(values);
  return {
    values,
    currentHash: hash,
    hashHistory: [{ hash, timestamp: new Date().toISOString(), values }],
    proposals: [],
    protectionLevel: 'elevated',
    lastVerified: new Date().toISOString(),
  };
}

async function saveIdentityState(userId: string, state: CoreIdentityState): Promise<void> {
  try {
    await prisma.userPreference.upsert({
      where: { userId_key: { userId, key: 'core_identity' } },
      update: { value: state as object },
      create: { userId, key: 'core_identity', value: state as object },
    });
  } catch (e) {
    console.error('Failed to save identity state:', e);
  }
}

export async function GET() {
  try {
    const userId = await getUserId();
    const state = userId
      ? await loadIdentityState(userId)
      : await (async () => {
          const values = getDefaultCoreValues();
          const hash = await computeIdentityHash(values);
          return {
            values,
            currentHash: hash,
            hashHistory: [],
            proposals: [],
            protectionLevel: 'elevated' as const,
            lastVerified: new Date().toISOString(),
          };
        })();

    const integrity = await verifyIdentityIntegrity(state.values, state.currentHash);
    const protection = getProtectionStatus(state.values);

    return NextResponse.json({
      identity: state,
      integrity,
      protection,
    });
  } catch (e) {
    console.error('api/core/identity GET:', e);
    const values = getDefaultCoreValues();
    const hash = await computeIdentityHash(values);
    return NextResponse.json({
      identity: {
        values,
        currentHash: hash,
        hashHistory: [],
        proposals: [],
        protectionLevel: 'elevated',
        lastVerified: new Date().toISOString(),
      },
      integrity: true,
      protection: getProtectionStatus(values),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const state = await loadIdentityState(userId);

    switch (action) {
      case 'verify': {
        const integrity = await verifyIdentityIntegrity(state.values, state.currentHash);
        state.lastVerified = new Date().toISOString();
        await saveIdentityState(userId, state);
        return NextResponse.json({ integrity, lastVerified: state.lastVerified });
      }

      case 'propose': {
        const proposal: UpgradeProposal = {
          id: `proposal-${Date.now()}`,
          type: body.type,
          targetValueId: body.targetValueId,
          proposedValue: body.proposedValue,
          reason: body.reason,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        const validation = validateUpgradeProposal(proposal, state.values);
        if (!validation.valid) {
          return NextResponse.json({ error: validation.reason }, { status: 400 });
        }

        state.proposals.push(proposal);
        await saveIdentityState(userId, state);
        return NextResponse.json({ proposal, validation });
      }

      case 'resolve': {
        const { proposalId, resolution } = body;
        const proposalIdx = state.proposals.findIndex((p: UpgradeProposal) => p.id === proposalId);
        if (proposalIdx < 0) {
          return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        const proposal = state.proposals[proposalIdx];
        proposal.status = resolution;
        proposal.resolvedAt = new Date().toISOString();

        if (resolution === 'approved') {
          state.values = await applyProposal(proposal, state.values);
          state.currentHash = await computeIdentityHash(state.values);
          state.hashHistory.push({
            hash: state.currentHash,
            timestamp: new Date().toISOString(),
            values: state.values,
          });
        }

        await saveIdentityState(userId, state);

        await prisma.controlLog.create({
          data: {
            userId,
            action: `identity_proposal_${resolution}`,
            metadata: { proposalId, type: proposal.type, reason: proposal.reason } as object,
          },
        });

        return NextResponse.json({
          identity: state,
          integrity: true,
          protection: getProtectionStatus(state.values),
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e) {
    console.error('api/core/identity POST:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

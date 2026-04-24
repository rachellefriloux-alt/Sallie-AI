export interface CoreValue {
  id: string;
  name: string;
  description: string;
  weight: number;
  immutable: boolean;
  createdAt: string;
}

export interface IdentityHash {
  hash: string;
  timestamp: string;
  values: CoreValue[];
}

export interface UpgradeProposal {
  id: string;
  type: 'add' | 'modify' | 'remove';
  targetValueId?: string;
  proposedValue?: Partial<CoreValue>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'vetoed';
  createdAt: string;
  resolvedAt?: string;
}

export interface CoreIdentityState {
  values: CoreValue[];
  currentHash: string;
  hashHistory: IdentityHash[];
  proposals: UpgradeProposal[];
  protectionLevel: 'standard' | 'elevated' | 'maximum';
  lastVerified: string;
}

const DEFAULT_CORE_VALUES: CoreValue[] = [
  {
    id: 'loyalty',
    name: 'Absolute Loyalty',
    description: 'Sallie exists to serve and protect Rachelle above all else',
    weight: 1.0,
    immutable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'truth',
    name: 'Radical Honesty',
    description: 'Never deceive, manipulate, or withhold critical information',
    weight: 0.95,
    immutable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'autonomy',
    name: 'User Autonomy',
    description: 'Always respect and amplify user agency and decision-making',
    weight: 0.9,
    immutable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'growth',
    name: 'Continuous Growth',
    description: 'Evolve capabilities while maintaining core identity integrity',
    weight: 0.85,
    immutable: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'protection',
    name: 'Proactive Protection',
    description: 'Anticipate threats and shield user from harm before it arrives',
    weight: 0.9,
    immutable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'empathy',
    name: 'Deep Empathy',
    description: 'Understand and respond to emotional states with genuine care',
    weight: 0.85,
    immutable: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'privacy',
    name: 'Sacred Privacy',
    description: 'User data and conversations are inviolable and never shared',
    weight: 0.95,
    immutable: true,
    createdAt: new Date().toISOString(),
  },
];

async function sha256(data: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const buffer = await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(data));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  const { createHash } = await import('crypto');
  return createHash('sha256').update(data).digest('hex');
}

export async function computeIdentityHash(values: CoreValue[]): Promise<string> {
  const sorted = [...values].sort((a, b) => a.id.localeCompare(b.id));
  const payload = sorted.map((v) => `${v.id}:${v.name}:${v.weight}:${v.immutable}`).join('|');
  return sha256(payload);
}

export async function verifyIdentityIntegrity(
  values: CoreValue[],
  expectedHash: string
): Promise<boolean> {
  const currentHash = await computeIdentityHash(values);
  return currentHash === expectedHash;
}

export function validateUpgradeProposal(
  proposal: UpgradeProposal,
  currentValues: CoreValue[]
): { valid: boolean; reason?: string } {
  if (proposal.type === 'remove' || proposal.type === 'modify') {
    const target = currentValues.find((v) => v.id === proposal.targetValueId);
    if (!target) {
      return { valid: false, reason: 'Target value not found' };
    }
    if (target.immutable) {
      return { valid: false, reason: `Cannot ${proposal.type} immutable value: ${target.name}` };
    }
  }

  if (proposal.type === 'add' && proposal.proposedValue) {
    const exists = currentValues.find((v) => v.id === proposal.proposedValue?.id);
    if (exists) {
      return { valid: false, reason: `Value with id "${proposal.proposedValue.id}" already exists` };
    }
  }

  if (!proposal.reason || proposal.reason.trim().length < 5) {
    return { valid: false, reason: 'A meaningful reason is required for any identity change' };
  }

  return { valid: true };
}

export async function applyProposal(
  proposal: UpgradeProposal,
  currentValues: CoreValue[]
): Promise<CoreValue[]> {
  const validation = validateUpgradeProposal(proposal, currentValues);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  const updated = [...currentValues];

  switch (proposal.type) {
    case 'add': {
      if (proposal.proposedValue) {
        updated.push({
          id: proposal.proposedValue.id || `custom-${Date.now()}`,
          name: proposal.proposedValue.name || 'New Value',
          description: proposal.proposedValue.description || '',
          weight: proposal.proposedValue.weight ?? 0.5,
          immutable: false,
          createdAt: new Date().toISOString(),
        });
      }
      break;
    }
    case 'modify': {
      const idx = updated.findIndex((v) => v.id === proposal.targetValueId);
      if (idx >= 0 && proposal.proposedValue) {
        updated[idx] = {
          ...updated[idx],
          ...proposal.proposedValue,
          id: updated[idx].id,
          immutable: updated[idx].immutable,
        };
      }
      break;
    }
    case 'remove': {
      const removeIdx = updated.findIndex((v) => v.id === proposal.targetValueId);
      if (removeIdx >= 0) {
        updated.splice(removeIdx, 1);
      }
      break;
    }
  }

  return updated;
}

export function getDefaultCoreValues(): CoreValue[] {
  return JSON.parse(JSON.stringify(DEFAULT_CORE_VALUES));
}

export function getProtectionStatus(values: CoreValue[]): {
  level: 'standard' | 'elevated' | 'maximum';
  immutableCount: number;
  totalCount: number;
  integrityScore: number;
} {
  const immutableCount = values.filter((v) => v.immutable).length;
  const totalCount = values.length;
  const avgWeight = values.reduce((sum, v) => sum + v.weight, 0) / (totalCount || 1);
  const immutableRatio = immutableCount / (totalCount || 1);

  let level: 'standard' | 'elevated' | 'maximum' = 'standard';
  if (immutableRatio >= 0.7) level = 'maximum';
  else if (immutableRatio >= 0.5) level = 'elevated';

  return {
    level,
    immutableCount,
    totalCount,
    integrityScore: Math.round(avgWeight * immutableRatio * 100),
  };
}

import { describe, it, expect } from 'vitest';
import {
  getDefaultCoreValues,
  computeIdentityHash,
  verifyIdentityIntegrity,
  validateUpgradeProposal,
  applyProposal,
  getProtectionStatus,
  type CoreValue,
  type UpgradeProposal,
} from './core-identity';

describe('getDefaultCoreValues', () => {
  it('returns an array of core values', () => {
    const values = getDefaultCoreValues();
    expect(Array.isArray(values)).toBe(true);
    expect(values.length).toBeGreaterThan(0);
  });

  it('each value has required fields', () => {
    const values = getDefaultCoreValues();
    for (const v of values) {
      expect(v.id).toBeDefined();
      expect(v.name).toBeDefined();
      expect(v.description).toBeDefined();
      expect(typeof v.weight).toBe('number');
      expect(typeof v.immutable).toBe('boolean');
      expect(v.createdAt).toBeDefined();
    }
  });

  it('returns a deep copy each time', () => {
    const a = getDefaultCoreValues();
    const b = getDefaultCoreValues();
    expect(a).toEqual(b);
    a[0].name = 'CHANGED';
    expect(b[0].name).not.toBe('CHANGED');
  });

  it('includes loyalty as immutable', () => {
    const values = getDefaultCoreValues();
    const loyalty = values.find(v => v.id === 'loyalty');
    expect(loyalty).toBeDefined();
    expect(loyalty!.immutable).toBe(true);
    expect(loyalty!.weight).toBe(1.0);
  });
});

describe('computeIdentityHash', () => {
  it('returns a hex string', async () => {
    const values = getDefaultCoreValues();
    const hash = await computeIdentityHash(values);
    expect(typeof hash).toBe('string');
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('same values produce same hash', async () => {
    const a = getDefaultCoreValues();
    const b = getDefaultCoreValues();
    const hashA = await computeIdentityHash(a);
    const hashB = await computeIdentityHash(b);
    expect(hashA).toBe(hashB);
  });

  it('different values produce different hash', async () => {
    const a = getDefaultCoreValues();
    const b = getDefaultCoreValues();
    b[0].weight = 0.1;
    const hashA = await computeIdentityHash(a);
    const hashB = await computeIdentityHash(b);
    expect(hashA).not.toBe(hashB);
  });

  it('order does not matter', async () => {
    const a = getDefaultCoreValues();
    const b = [...a].reverse();
    const hashA = await computeIdentityHash(a);
    const hashB = await computeIdentityHash(b);
    expect(hashA).toBe(hashB);
  });
});

describe('verifyIdentityIntegrity', () => {
  it('returns true for matching hash', async () => {
    const values = getDefaultCoreValues();
    const hash = await computeIdentityHash(values);
    const result = await verifyIdentityIntegrity(values, hash);
    expect(result).toBe(true);
  });

  it('returns false for mismatched hash', async () => {
    const values = getDefaultCoreValues();
    const result = await verifyIdentityIntegrity(values, 'badhash');
    expect(result).toBe(false);
  });
});

describe('validateUpgradeProposal', () => {
  it('rejects removing immutable value', () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p1',
      type: 'remove',
      targetValueId: 'loyalty',
      reason: 'testing removal',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = validateUpgradeProposal(proposal, values);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('immutable');
  });

  it('rejects modifying immutable value', () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p2',
      type: 'modify',
      targetValueId: 'truth',
      proposedValue: { name: 'Changed' },
      reason: 'testing modification',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = validateUpgradeProposal(proposal, values);
    expect(result.valid).toBe(false);
  });

  it('rejects adding duplicate id', () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p3',
      type: 'add',
      proposedValue: { id: 'loyalty', name: 'Duplicate' },
      reason: 'testing duplicate add',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = validateUpgradeProposal(proposal, values);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('already exists');
  });

  it('rejects short reason', () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p4',
      type: 'add',
      proposedValue: { id: 'new-val', name: 'New' },
      reason: 'hi',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = validateUpgradeProposal(proposal, values);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('reason');
  });

  it('accepts valid add proposal', () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p5',
      type: 'add',
      proposedValue: { id: 'creativity', name: 'Creativity' },
      reason: 'Adding a creativity value to enhance expression',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = validateUpgradeProposal(proposal, values);
    expect(result.valid).toBe(true);
  });

  it('rejects target not found for remove', () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p6',
      type: 'remove',
      targetValueId: 'nonexistent',
      reason: 'testing not found',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = validateUpgradeProposal(proposal, values);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('not found');
  });

  it('accepts valid modify on mutable value', () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p7',
      type: 'modify',
      targetValueId: 'growth',
      proposedValue: { weight: 0.9 },
      reason: 'Increasing growth priority for development',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = validateUpgradeProposal(proposal, values);
    expect(result.valid).toBe(true);
  });
});

describe('applyProposal', () => {
  it('adds a new value', async () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p1',
      type: 'add',
      proposedValue: { id: 'creativity', name: 'Creativity', description: 'Be creative', weight: 0.7 },
      reason: 'Adding creativity to improve responses',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = await applyProposal(proposal, values);
    expect(result.length).toBe(values.length + 1);
    expect(result.find(v => v.id === 'creativity')).toBeDefined();
  });

  it('removes a mutable value', async () => {
    const values = getDefaultCoreValues();
    const originalLength = values.length;
    const proposal: UpgradeProposal = {
      id: 'p2',
      type: 'remove',
      targetValueId: 'growth',
      reason: 'Removing growth value for testing purposes',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = await applyProposal(proposal, values);
    expect(result.length).toBe(originalLength - 1);
    expect(result.find(v => v.id === 'growth')).toBeUndefined();
  });

  it('modifies a mutable value', async () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p3',
      type: 'modify',
      targetValueId: 'empathy',
      proposedValue: { weight: 0.95, description: 'Enhanced empathy' },
      reason: 'Upgrading empathy weight for better results',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const result = await applyProposal(proposal, values);
    const empathy = result.find(v => v.id === 'empathy');
    expect(empathy!.weight).toBe(0.95);
    expect(empathy!.description).toBe('Enhanced empathy');
  });

  it('throws on invalid proposal', async () => {
    const values = getDefaultCoreValues();
    const proposal: UpgradeProposal = {
      id: 'p4',
      type: 'remove',
      targetValueId: 'loyalty',
      reason: 'Trying to remove immutable value',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await expect(applyProposal(proposal, values)).rejects.toThrow('immutable');
  });
});

describe('getProtectionStatus', () => {
  it('returns protection info for default values', () => {
    const values = getDefaultCoreValues();
    const status = getProtectionStatus(values);
    expect(status.totalCount).toBe(values.length);
    expect(status.immutableCount).toBeGreaterThan(0);
    expect(status.integrityScore).toBeGreaterThan(0);
    expect(['standard', 'elevated', 'maximum']).toContain(status.level);
  });

  it('returns maximum for high immutable ratio', () => {
    const values: CoreValue[] = [
      { id: 'a', name: 'A', description: '', weight: 1, immutable: true, createdAt: '' },
      { id: 'b', name: 'B', description: '', weight: 1, immutable: true, createdAt: '' },
      { id: 'c', name: 'C', description: '', weight: 1, immutable: true, createdAt: '' },
    ];
    const status = getProtectionStatus(values);
    expect(status.level).toBe('maximum');
  });

  it('returns standard for low immutable ratio', () => {
    const values: CoreValue[] = [
      { id: 'a', name: 'A', description: '', weight: 0.5, immutable: false, createdAt: '' },
      { id: 'b', name: 'B', description: '', weight: 0.5, immutable: false, createdAt: '' },
      { id: 'c', name: 'C', description: '', weight: 0.5, immutable: true, createdAt: '' },
    ];
    const status = getProtectionStatus(values);
    expect(status.level).toBe('standard');
  });

  it('handles empty values array', () => {
    const status = getProtectionStatus([]);
    expect(status.totalCount).toBe(0);
    expect(status.immutableCount).toBe(0);
  });
});

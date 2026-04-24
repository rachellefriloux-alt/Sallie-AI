import { describe, it, expect } from 'vitest';
import {
  getAllCapabilities,
  getCapabilitiesByCategory,
  getCapabilityById,
  getCategories,
  getCapabilitySummary,
} from './capability-registry';

describe('getAllCapabilities', () => {
  it('returns an array of capabilities', () => {
    const caps = getAllCapabilities();
    expect(Array.isArray(caps)).toBe(true);
    expect(caps.length).toBeGreaterThan(0);
  });

  it('each capability has required fields', () => {
    const caps = getAllCapabilities();
    for (const c of caps) {
      expect(c.id).toBeDefined();
      expect(c.name).toBeDefined();
      expect(c.description).toBeDefined();
      expect(c.category).toBeDefined();
      expect(c.status).toBeDefined();
      expect(c.provider).toBeDefined();
      expect(typeof c.requiresAuth).toBe('boolean');
    }
  });

  it('returns a new array instance each time', () => {
    const a = getAllCapabilities();
    const b = getAllCapabilities();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });
});

describe('getCapabilitiesByCategory', () => {
  it('returns only capabilities in the given category', () => {
    const langCaps = getCapabilitiesByCategory('Language');
    expect(langCaps.length).toBeGreaterThan(0);
    for (const c of langCaps) {
      expect(c.category).toBe('Language');
    }
  });

  it('returns empty array for a category with no matches', () => {
    const result = getCapabilitiesByCategory('NonExistent' as any);
    expect(result).toEqual([]);
  });
});

describe('getCapabilityById', () => {
  it('finds an existing capability', () => {
    const cap = getCapabilityById('text-generation');
    expect(cap).toBeDefined();
    expect(cap!.id).toBe('text-generation');
    expect(cap!.name).toBeDefined();
  });

  it('returns undefined for unknown id', () => {
    const cap = getCapabilityById('does-not-exist');
    expect(cap).toBeUndefined();
  });
});

describe('getCategories', () => {
  it('returns an array of unique category strings', () => {
    const categories = getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    const unique = new Set(categories);
    expect(unique.size).toBe(categories.length);
  });

  it('includes known categories', () => {
    const categories = getCategories();
    expect(categories).toContain('Language');
    expect(categories).toContain('Vision');
    expect(categories).toContain('Code');
    expect(categories).toContain('Memory');
  });
});

describe('getCapabilitySummary', () => {
  it('returns correct total count', () => {
    const summary = getCapabilitySummary();
    const all = getAllCapabilities();
    expect(summary.total).toBe(all.length);
  });

  it('status counts sum to total', () => {
    const summary = getCapabilitySummary();
    expect(summary.available + summary.partial + summary.unavailable).toBe(summary.total);
  });

  it('has byCategory breakdown', () => {
    const summary = getCapabilitySummary();
    expect(summary.byCategory).toBeDefined();
    expect(summary.byCategory['Language']).toBeDefined();
    expect(summary.byCategory['Language'].total).toBeGreaterThan(0);
  });

  it('byCategory status counts sum to category total', () => {
    const summary = getCapabilitySummary();
    for (const [, cat] of Object.entries(summary.byCategory)) {
      expect(cat.available + cat.partial + cat.unavailable).toBe(cat.total);
    }
  });
});

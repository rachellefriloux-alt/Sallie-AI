import { describe, it, expect } from 'vitest';
import {
  KNOWLEDGE_SOURCES,
  OMNIS_TIERS,
  OMNIS_MODES,
  KNOWLEDGE_DOMAINS,
} from './omnis-knowledge';

describe('KNOWLEDGE_SOURCES', () => {
  it('has 12 Wikimedia sources', () => {
    expect(KNOWLEDGE_SOURCES.length).toBe(12);
  });

  it('each source has id, name, description, url', () => {
    for (const s of KNOWLEDGE_SOURCES) {
      expect(s.id).toBeDefined();
      expect(s.name).toBeDefined();
      expect(s.description).toBeDefined();
      expect(s.url).toContain('http');
    }
  });

  it('includes Wikipedia', () => {
    const ids = KNOWLEDGE_SOURCES.map((s) => s.id);
    expect(ids).toContain('wikipedia');
  });
});

describe('OMNIS_TIERS', () => {
  it('has 6 tiers', () => {
    expect(OMNIS_TIERS.length).toBe(6);
  });

  it('each tier has id, name, description, color', () => {
    for (const t of OMNIS_TIERS) {
      expect(t.id).toBeDefined();
      expect(t.name).toBeDefined();
      expect(t.description).toBeDefined();
      expect(t.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('OMNIS_MODES', () => {
  it('has 3 modes', () => {
    expect(OMNIS_MODES.length).toBe(3);
  });

  it('includes architect, oracle, optimizer', () => {
    const ids = OMNIS_MODES.map((m) => m.id);
    expect(ids).toContain('architect');
    expect(ids).toContain('oracle');
    expect(ids).toContain('optimizer');
  });
});

describe('KNOWLEDGE_DOMAINS', () => {
  it('has 33 domains', () => {
    expect(KNOWLEDGE_DOMAINS.length).toBe(33);
  });

  it('each domain has required fields', () => {
    for (const d of KNOWLEDGE_DOMAINS) {
      expect(d.id).toBeDefined();
      expect(d.title).toBeDefined();
      expect(d.tier).toBeDefined();
      expect(d.description).toBeDefined();
      expect(d.expertise).toBeGreaterThanOrEqual(0);
      expect(d.expertise).toBeLessThanOrEqual(100);
      expect(d.topics.length).toBeGreaterThan(0);
    }
  });

  it('all domain IDs are unique', () => {
    const ids = KNOWLEDGE_DOMAINS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all tiers are referenced', () => {
    const tierIds = new Set(KNOWLEDGE_DOMAINS.map((d) => d.tier.id));
    for (const t of OMNIS_TIERS) {
      expect(tierIds.has(t.id)).toBe(true);
    }
  });
});

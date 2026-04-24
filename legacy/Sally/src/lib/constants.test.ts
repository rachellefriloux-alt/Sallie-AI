import { describe, it, expect } from 'vitest';
import { IMAGES, SOVEREIGN_MODES, CHAT_MODES } from './constants';

describe('IMAGES', () => {
  it('has hero image URL', () => {
    expect(IMAGES.hero).toBeDefined();
    expect(IMAGES.hero).toContain('http');
  });

  it('has avatar image URL', () => {
    expect(IMAGES.avatar).toBeDefined();
    expect(IMAGES.avatar).toContain('http');
  });

  it('has feature images', () => {
    expect(IMAGES.features.length).toBeGreaterThan(0);
    for (const url of IMAGES.features) {
      expect(url).toContain('http');
    }
  });

  it('has testimonial images', () => {
    expect(IMAGES.testimonials.length).toBeGreaterThan(0);
  });
});

describe('SOVEREIGN_MODES', () => {
  it('has 5 modes', () => {
    expect(SOVEREIGN_MODES.length).toBe(5);
  });

  it('each mode has required fields', () => {
    for (const mode of SOVEREIGN_MODES) {
      expect(mode.id).toBeDefined();
      expect(mode.name).toBeDefined();
      expect(mode.role).toBeDefined();
      expect(mode.bio).toBeDefined();
    }
  });

  it('includes key roles', () => {
    const names = SOVEREIGN_MODES.map((m) => m.name);
    expect(names).toContain('The CEO');
    expect(names).toContain('The Matriarch');
    expect(names).toContain('The Healer');
  });
});

describe('CHAT_MODES', () => {
  it('has multiple modes', () => {
    expect(CHAT_MODES.length).toBeGreaterThan(3);
  });

  it('each mode has id, label, icon, color', () => {
    for (const mode of CHAT_MODES) {
      expect(mode.id).toBeDefined();
      expect(mode.label).toBeDefined();
      expect(mode.icon).toBeDefined();
      expect(mode.color).toBeDefined();
    }
  });

  it('includes general mode', () => {
    const ids = CHAT_MODES.map((m) => m.id);
    expect(ids).toContain('general');
  });
});

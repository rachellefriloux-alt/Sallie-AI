import { describe, it, expect } from 'vitest';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS, ANIMATIONS, GRADIENTS } from './design-tokens';

describe('COLORS', () => {
  it('has primary palette colors', () => {
    expect(COLORS.primary).toBeDefined();
    expect(COLORS.primaryLight).toBeDefined();
    expect(COLORS.primaryDark).toBeDefined();
    expect(COLORS.accent).toBeDefined();
  });

  it('has genesis mode colors', () => {
    expect(COLORS.obsidian.bg).toBeDefined();
    expect(COLORS.leopard.bg).toBeDefined();
    expect(COLORS.peacock.bg).toBeDefined();
    expect(COLORS.celestial.bg).toBeDefined();
    expect(COLORS.void.bg).toBeDefined();
  });

  it('has power role colors', () => {
    expect(COLORS.business.accent).toBeDefined();
    expect(COLORS.mom.accent).toBeDefined();
    expect(COLORS.spouse.accent).toBeDefined();
    expect(COLORS.friend.accent).toBeDefined();
    expect(COLORS.me.accent).toBeDefined();
  });

  it('has limbic dimension colors', () => {
    expect(COLORS.limbic.trust).toBeDefined();
    expect(COLORS.limbic.warmth).toBeDefined();
    expect(COLORS.limbic.arousal).toBeDefined();
    expect(COLORS.limbic.valence).toBeDefined();
    expect(COLORS.limbic.curiosity).toBeDefined();
  });

  it('has heritage scale', () => {
    expect(COLORS.heritage[50]).toBeDefined();
    expect(COLORS.heritage[900]).toBeDefined();
  });

  it('primary color is valid hex', () => {
    expect(COLORS.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('SPACING', () => {
  it('has ascending values', () => {
    expect(SPACING.xs).toBeLessThan(SPACING.sm);
    expect(SPACING.sm).toBeLessThan(SPACING.md);
    expect(SPACING.md).toBeLessThan(SPACING.lg);
    expect(SPACING.lg).toBeLessThan(SPACING.xl);
  });
});

describe('RADIUS', () => {
  it('has ascending values', () => {
    expect(RADIUS.sm).toBeLessThan(RADIUS.md);
    expect(RADIUS.md).toBeLessThan(RADIUS.lg);
    expect(RADIUS.lg).toBeLessThan(RADIUS.xl);
    expect(RADIUS.full).toBe(9999);
  });
});

describe('TYPOGRAPHY', () => {
  it('has font sizes', () => {
    expect(TYPOGRAPHY.fontSize.base).toBe(16);
    expect(TYPOGRAPHY.fontSize.xs).toBeLessThan(TYPOGRAPHY.fontSize.base);
    expect(TYPOGRAPHY.fontSize['3xl']).toBeGreaterThan(TYPOGRAPHY.fontSize.base);
  });

  it('has font weights', () => {
    expect(TYPOGRAPHY.fontWeight.normal).toBe('400');
    expect(TYPOGRAPHY.fontWeight.bold).toBe('700');
  });
});

describe('SHADOWS', () => {
  it('has standard shadows', () => {
    expect(SHADOWS.sm).toContain('rgba');
    expect(SHADOWS.md).toContain('rgba');
    expect(SHADOWS.lg).toContain('rgba');
  });

  it('has theme shadows', () => {
    expect(SHADOWS.peacock).toBeDefined();
    expect(SHADOWS.leopard).toBeDefined();
  });
});

describe('ANIMATIONS', () => {
  it('has duration values', () => {
    expect(ANIMATIONS.duration.fast).toBeLessThan(ANIMATIONS.duration.normal);
    expect(ANIMATIONS.duration.normal).toBeLessThan(ANIMATIONS.duration.slow);
  });

  it('has breathing animation config', () => {
    expect(ANIMATIONS.breathing.duration).toBeGreaterThan(0);
    expect(ANIMATIONS.breathing.minScale).toBeLessThan(ANIMATIONS.breathing.maxScale);
  });
});

describe('GRADIENTS', () => {
  it('has gradient strings', () => {
    expect(GRADIENTS.peacock).toContain('linear-gradient');
    expect(GRADIENTS.leopard).toContain('linear-gradient');
    expect(GRADIENTS.sallie).toContain('linear-gradient');
  });
});

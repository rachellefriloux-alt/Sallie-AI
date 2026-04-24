import { describe, it, expect } from 'vitest';
import { getAvatarById, AVATAR_OPTIONS } from './avatar-options';

describe('avatar-options', () => {
  it('exports non-empty AVATAR_OPTIONS', () => {
    expect(AVATAR_OPTIONS.length).toBeGreaterThanOrEqual(1);
  });

  it('getAvatarById returns option for peacock_elegant', () => {
    const found = getAvatarById('peacock_elegant');
    expect(found).not.toBeNull();
    expect(found?.theme).toBe('peacock');
  });

  it('getAvatarById returns null for unknown id', () => {
    expect(getAvatarById('unknown')).toBeNull();
  });
});

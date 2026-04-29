import { describe, it, expect, beforeEach } from 'vitest';
import {
  getControlState,
  pauseActions,
  resumeActions,
  setAutonomyLevel,
  addOverride,
  removeOverride,
  isActionAllowed,
  resetControlState,
} from './control-system';

const TEST_USER = 'test-user-ctrl';

beforeEach(() => {
  resetControlState(TEST_USER);
});

describe('getControlState', () => {
  it('returns default state for new user', () => {
    const state = getControlState(TEST_USER);
    expect(state.paused).toBe(false);
    expect(state.autonomyLevel).toBe(0.7);
    expect(state.pausedAt).toBeNull();
    expect(state.resumedAt).toBeNull();
    expect(Object.keys(state.overrides).length).toBe(0);
    expect(state.allowedActions).toEqual([]);
  });

  it('returns a copy so mutations do not affect internal state', () => {
    const a = getControlState(TEST_USER);
    a.paused = true;
    const b = getControlState(TEST_USER);
    expect(b.paused).toBe(false);
  });
});

describe('pauseActions', () => {
  it('sets paused to true', () => {
    const state = pauseActions(TEST_USER);
    expect(state.paused).toBe(true);
    expect(state.pausedAt).not.toBeNull();
  });

  it('accepts allowed actions list', () => {
    const state = pauseActions(TEST_USER, ['read', 'status']);
    expect(state.allowedActions).toEqual(['read', 'status']);
  });
});

describe('resumeActions', () => {
  it('sets paused to false after pause', () => {
    pauseActions(TEST_USER);
    const state = resumeActions(TEST_USER);
    expect(state.paused).toBe(false);
    expect(state.resumedAt).not.toBeNull();
    expect(state.allowedActions).toEqual([]);
  });
});

describe('setAutonomyLevel', () => {
  it('sets the autonomy level', () => {
    const state = setAutonomyLevel(TEST_USER, 0.5);
    expect(state.autonomyLevel).toBe(0.5);
  });

  it('clamps values above 1 to 1', () => {
    const state = setAutonomyLevel(TEST_USER, 1.5);
    expect(state.autonomyLevel).toBe(1);
  });

  it('clamps values below 0 to 0', () => {
    const state = setAutonomyLevel(TEST_USER, -0.3);
    expect(state.autonomyLevel).toBe(0);
  });
});

describe('addOverride', () => {
  it('adds an override to the state', () => {
    const state = addOverride(TEST_USER, 'action-1', 'old', 'new', 'testing');
    expect(state.overrides['action-1']).toBeDefined();
    expect(state.overrides['action-1'].originalValue).toBe('old');
    expect(state.overrides['action-1'].overrideValue).toBe('new');
    expect(state.overrides['action-1'].reason).toBe('testing');
  });

  it('overwrites existing override for same actionId', () => {
    addOverride(TEST_USER, 'action-1', 'old', 'new', 'first');
    const state = addOverride(TEST_USER, 'action-1', 'old2', 'new2', 'second');
    expect(state.overrides['action-1'].reason).toBe('second');
  });
});

describe('removeOverride', () => {
  it('removes an existing override', () => {
    addOverride(TEST_USER, 'action-1', 'old', 'new', 'testing');
    const state = removeOverride(TEST_USER, 'action-1');
    expect(state.overrides['action-1']).toBeUndefined();
  });

  it('does not throw when removing non-existent override', () => {
    const state = removeOverride(TEST_USER, 'nonexistent');
    expect(state.overrides['nonexistent']).toBeUndefined();
  });
});

describe('isActionAllowed', () => {
  it('allows all actions when not paused', () => {
    expect(isActionAllowed(TEST_USER, 'anything')).toBe(true);
  });

  it('blocks non-allowed actions when paused', () => {
    pauseActions(TEST_USER, ['read']);
    expect(isActionAllowed(TEST_USER, 'write')).toBe(false);
  });

  it('allows whitelisted actions when paused', () => {
    pauseActions(TEST_USER, ['read', 'status']);
    expect(isActionAllowed(TEST_USER, 'read')).toBe(true);
    expect(isActionAllowed(TEST_USER, 'status')).toBe(true);
  });
});

describe('resetControlState', () => {
  it('restores default state', () => {
    pauseActions(TEST_USER);
    setAutonomyLevel(TEST_USER, 0.2);
    addOverride(TEST_USER, 'x', 1, 2, 'reason');
    const state = resetControlState(TEST_USER);
    expect(state.paused).toBe(false);
    expect(state.autonomyLevel).toBe(0.7);
    expect(Object.keys(state.overrides).length).toBe(0);
    expect(state.pausedAt).toBeNull();
    expect(state.resumedAt).toBeNull();
  });
});

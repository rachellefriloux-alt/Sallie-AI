import { describe, it, expect, beforeEach } from 'vitest';
import { useLimbicStore } from './useLimbicStore';

describe('useLimbicStore', () => {
  beforeEach(() => {
    useLimbicStore.getState().resetToDefaults();
  });

  it('has default state', () => {
    const { state } = useLimbicStore.getState();
    expect(state.trust).toBe(0.5);
    expect(state.warmth).toBe(0.6);
    expect(state.posture).toBe('COMPANION');
    expect(state.loyalty).toBe(1.0);
  });

  it('updateState merges partial updates', () => {
    useLimbicStore.getState().updateState({ trust: 0.9, posture: 'COPILOT' });
    const { state } = useLimbicStore.getState();
    expect(state.trust).toBe(0.9);
    expect(state.posture).toBe('COPILOT');
    expect(state.warmth).toBe(0.6);
  });

  it('incrementVariable clamps between 0 and 1', () => {
    useLimbicStore.getState().incrementVariable('trust', 0.8);
    expect(useLimbicStore.getState().state.trust).toBeLessThanOrEqual(1);

    useLimbicStore.getState().incrementVariable('trust', -2.0);
    expect(useLimbicStore.getState().state.trust).toBeGreaterThanOrEqual(0);
  });

  it('decayVariables decreases arousal, energy, focus', () => {
    useLimbicStore.getState().updateState({ arousal: 0.8, energy: 0.8, focus: 0.8 });
    const before = { ...useLimbicStore.getState().state };
    useLimbicStore.getState().decayVariables();
    const after = useLimbicStore.getState().state;

    expect(after.arousal).toBeLessThan(before.arousal);
    expect(after.energy).toBeLessThan(before.energy);
    expect(after.focus).toBeLessThan(before.focus);
  });

  it('decayVariables does not decay below 0.1', () => {
    useLimbicStore.getState().updateState({ arousal: 0.05, energy: 0.05 });
    useLimbicStore.getState().decayVariables();
    const { state } = useLimbicStore.getState();
    expect(state.arousal).toBe(0.05);
    expect(state.energy).toBe(0.05);
  });

  it('resetToDefaults restores initial state', () => {
    useLimbicStore.getState().updateState({ trust: 0.99, posture: 'EXPERT' });
    useLimbicStore.getState().resetToDefaults();
    const { state } = useLimbicStore.getState();
    expect(state.trust).toBe(0.5);
    expect(state.posture).toBe('COMPANION');
  });
});

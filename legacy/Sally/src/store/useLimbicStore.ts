'use client';

import { create } from 'zustand';

export interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
  loyalty: number;
  curiosity: number;
  focus: number;
  creativity: number;
  empathy: number;
  resilience: number;
  intuition: number;
  energy: number;
}

type NumericKey = Exclude<keyof LimbicState, 'posture'>;

interface LimbicStore {
  state: LimbicState;
  updateState: (partial: Partial<LimbicState>) => void;
  incrementVariable: (name: NumericKey, delta: number) => void;
  decayVariables: () => void;
  resetToDefaults: () => void;
  syncFromApi: () => Promise<void>;
  syncToApi: () => Promise<void>;
}

const defaultState: LimbicState = {
  trust: 0.5,
  warmth: 0.6,
  arousal: 0.5,
  valence: 0.6,
  posture: 'COMPANION',
  loyalty: 1.0,
  curiosity: 0.7,
  focus: 0.6,
  creativity: 0.6,
  empathy: 0.5,
  resilience: 0.7,
  intuition: 0.5,
  energy: 0.8,
};

function clamp(val: number): number {
  return Math.max(0, Math.min(1, val));
}

export const useLimbicStore = create<LimbicStore>((set, get) => ({
  state: { ...defaultState },

  updateState: (partial) =>
    set((store) => ({
      state: { ...store.state, ...partial },
    })),

  incrementVariable: (name, delta) =>
    set((store) => ({
      state: {
        ...store.state,
        [name]: clamp((store.state[name] as number) + delta),
      },
    })),

  decayVariables: () =>
    set((store) => ({
      state: {
        ...store.state,
        arousal: store.state.arousal > 0.1 ? clamp(store.state.arousal - 0.01) : store.state.arousal,
        energy: store.state.energy > 0.1 ? clamp(store.state.energy - 0.01) : store.state.energy,
        focus: store.state.focus > 0.1 ? clamp(store.state.focus - 0.01) : store.state.focus,
      },
    })),

  resetToDefaults: () => set({ state: { ...defaultState } }),

  syncFromApi: async () => {
    try {
      const res = await fetch('/api/limbic/state');
      if (!res.ok) return;
      const data = await res.json();
      if (data.state) {
        set({ state: { ...defaultState, ...data.state } });
      }
    } catch (e) {
      console.error('[limbicStore] syncFromApi failed:', e);
    }
  },

  syncToApi: async () => {
    try {
      const { state } = get();
      await fetch('/api/limbic/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
    } catch (e) {
      console.error('[limbicStore] syncToApi failed:', e);
    }
  },
}));

if (typeof window !== 'undefined') {
  setInterval(() => {
    const store = useLimbicStore.getState();
    const { arousal, energy } = store.state;
    if (arousal > 0.1 || energy > 0.1) {
      store.updateState({
        arousal: arousal > 0.1 ? clamp(arousal - 0.005) : arousal,
        energy: energy > 0.1 ? clamp(energy - 0.003) : energy,
      });
    }
  }, 60_000);
}

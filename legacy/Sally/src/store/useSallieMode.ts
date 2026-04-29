'use client';

import { create } from 'zustand';

export type SallieMode =
  | 'dashboard'
  | 'empire'
  | 'matriarch'
  | 'partner'
  | 'confidante'
  | 'source'
  | 'workspace'
  | 'sanctuary'
  | 'settings';

export interface ModeConfig {
  id: SallieMode;
  accent: string;
  accentGlow: string;
  voiceTone: string;
  bgGlow: string;
  label: string;
  salutation: string;
}

export const MODE_CONFIGS: Record<SallieMode, ModeConfig> = {
  dashboard: {
    id: 'dashboard',
    accent: '#C8A84E',
    accentGlow: 'rgba(200,168,78,0.15)',
    voiceTone: 'commanding',
    bgGlow: 'radial-gradient(ellipse at 30% 20%, rgba(200,168,78,0.04) 0%, transparent 60%)',
    label: 'Command Center',
    salutation: "What's the play today, love?",
  },
  empire: {
    id: 'empire',
    accent: '#D4AF37',
    accentGlow: 'rgba(212,175,55,0.15)',
    voiceTone: 'aggressive',
    bgGlow: 'radial-gradient(ellipse at 20% 30%, rgba(212,175,55,0.05) 0%, transparent 60%)',
    label: 'War Room',
    salutation: "Let's build something that lasts.",
  },
  matriarch: {
    id: 'matriarch',
    accent: '#FF8C42',
    accentGlow: 'rgba(255,140,66,0.15)',
    voiceTone: 'nurturing',
    bgGlow: 'radial-gradient(ellipse at 40% 20%, rgba(255,140,66,0.04) 0%, transparent 60%)',
    label: 'Family Ops',
    salutation: "Your household, your kingdom.",
  },
  partner: {
    id: 'partner',
    accent: '#FF6B9D',
    accentGlow: 'rgba(255,107,157,0.15)',
    voiceTone: 'warm',
    bgGlow: 'radial-gradient(ellipse at 50% 30%, rgba(255,107,157,0.04) 0%, transparent 60%)',
    label: 'Love Space',
    salutation: "Love on purpose, not on autopilot.",
  },
  confidante: {
    id: 'confidante',
    accent: '#06B6D4',
    accentGlow: 'rgba(6,182,212,0.15)',
    voiceTone: 'supportive',
    bgGlow: 'radial-gradient(ellipse at 60% 20%, rgba(6,182,212,0.04) 0%, transparent 60%)',
    label: 'Inner Circle',
    salutation: "Who's really riding for you?",
  },
  source: {
    id: 'source',
    accent: '#9D8DF1',
    accentGlow: 'rgba(157,141,241,0.15)',
    voiceTone: 'reflective',
    bgGlow: 'radial-gradient(ellipse at 30% 40%, rgba(157,141,241,0.04) 0%, transparent 60%)',
    label: 'Soul Space',
    salutation: "Let's go inward, love.",
  },
  workspace: {
    id: 'workspace',
    accent: '#14B8A6',
    accentGlow: 'rgba(20,184,166,0.15)',
    voiceTone: 'focused',
    bgGlow: 'radial-gradient(ellipse at 50% 20%, rgba(20,184,166,0.04) 0%, transparent 60%)',
    label: 'Creation Hub',
    salutation: "You don't just dream it — you build it.",
  },
  sanctuary: {
    id: 'sanctuary',
    accent: '#00A896',
    accentGlow: 'rgba(0,168,150,0.15)',
    voiceTone: 'ethereal',
    bgGlow: 'radial-gradient(ellipse at 40% 50%, rgba(0,168,150,0.03) 0%, rgba(139,92,246,0.02) 50%, transparent 80%)',
    label: 'Deep Space',
    salutation: "Welcome to my inner world.",
  },
  settings: {
    id: 'settings',
    accent: '#6B7280',
    accentGlow: 'rgba(107,114,128,0.15)',
    voiceTone: 'neutral',
    bgGlow: 'radial-gradient(ellipse at 50% 50%, rgba(107,114,128,0.03) 0%, transparent 60%)',
    label: 'Systems',
    salutation: "Under the hood.",
  },
};

export interface HeritageDNA {
  core: Record<string, string>;
  preferences: Record<string, string>;
  learned: Record<string, string>;
  history: Array<{ question: string; answer: string; phase: string }>;
}

interface SallieModeStore {
  mode: SallieMode;
  config: ModeConfig;
  heritageDNA: HeritageDNA | null;
  heritageDNALoaded: boolean;
  focusMode: boolean;
  degradationState: 'FULL' | 'FADING' | 'DORMANT' | 'DREAMING';
  nudges: Array<{ id: string; type: string; title: string; message: string; priority: string; domain?: string }>;

  setMode: (mode: SallieMode) => void;
  setHeritageDNA: (dna: HeritageDNA) => void;
  setFocusMode: (on: boolean) => void;
  setDegradationState: (state: 'FULL' | 'FADING' | 'DORMANT' | 'DREAMING') => void;
  addNudge: (nudge: { id: string; type: string; title: string; message: string; priority: string; domain?: string }) => void;
  dismissNudge: (id: string) => void;
  clearNudges: () => void;
  loadHeritageDNA: () => Promise<void>;
}

export const useSallieMode = create<SallieModeStore>((set, get) => ({
  mode: 'dashboard',
  config: MODE_CONFIGS.dashboard,
  heritageDNA: null,
  heritageDNALoaded: false,
  focusMode: false,
  degradationState: 'FULL',
  nudges: [],

  setMode: (mode) => set({ mode, config: MODE_CONFIGS[mode] }),

  setHeritageDNA: (dna) => set({ heritageDNA: dna, heritageDNALoaded: true }),

  setFocusMode: (on) => set({ focusMode: on }),

  setDegradationState: (state) => set({ degradationState: state }),

  addNudge: (nudge) => set((s) => ({
    nudges: s.nudges.some(n => n.id === nudge.id) ? s.nudges : [...s.nudges, nudge],
  })),

  dismissNudge: (id) => set((s) => ({ nudges: s.nudges.filter(n => n.id !== id) })),

  clearNudges: () => set({ nudges: [] }),

  loadHeritageDNA: async () => {
    if (get().heritageDNALoaded) return;
    try {
      const res = await fetch('/api/heritage/dna');
      if (res.ok) {
        const data = await res.json();
        set({ heritageDNA: data, heritageDNALoaded: true });
      }
    } catch {
      set({ heritageDNALoaded: true });
    }
  },
}));

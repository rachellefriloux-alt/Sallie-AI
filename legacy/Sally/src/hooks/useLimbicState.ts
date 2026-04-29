'use client';

import { useState, useCallback, useEffect } from 'react';

type LimbicState = {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: 'COMPANION' | 'COPILOT' | 'PEER' | 'CONFIDANTE' | 'EXPERT' | 'MENTOR' | 'GUIDE' | 'FACILITATOR' | 'ADVOCATE' | 'INNOVATOR' | 'NURTURER';
  loyalty: number;
  curiosity: number;
  focus: number;
  creativity: number;
  empathy: number;
  resilience: number;
  intuition: number;
  energy: number;
  last_interaction_ts?: number;
  interaction_count?: number;
  flags?: string[];
  door_slam_active?: boolean;
  crisis_active?: boolean;
  elastic_mode?: boolean;
};

type LimbicHistory = {
  timestamp: number;
  state: LimbicState;
  event?: string;
};

const DEFAULT_STATE: LimbicState = {
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
  last_interaction_ts: Date.now(),
  interaction_count: 0,
  flags: [],
  door_slam_active: false,
  crisis_active: false,
  elastic_mode: false
};

export function useLimbicState() {
  const [limbicState, setLimbicState] = useState<LimbicState>(DEFAULT_STATE);
  const [history, setHistory] = useState<LimbicHistory[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const updateLimbicState = useCallback(async (updates: Partial<LimbicState>) => {
    setLimbicState(prev => {
      const updated = { ...prev, ...updates };
      setHistory(h => [...h, {
        timestamp: Date.now(),
        state: updated,
        event: 'manual_update'
      }].slice(-1000));
      return updated;
    });
  }, []);

  const applyInteraction = useCallback(async (type: 'positive' | 'negative' | 'neutral', intensity: number = 0.1) => {
    setLimbicState(prev => {
      const delta = type === 'positive' ? intensity : type === 'negative' ? -intensity : 0;
      const updated = {
        ...prev,
        trust: Math.max(0, Math.min(1, prev.trust + delta * 0.5)),
        warmth: Math.max(0, Math.min(1, prev.warmth + delta * 0.7)),
        valence: Math.max(0, Math.min(1, prev.valence + delta)),
        arousal: Math.max(0, Math.min(1, prev.arousal + Math.abs(delta) * 0.3)),
        curiosity: type === 'positive' ? Math.max(0, Math.min(1, prev.curiosity + 0.2 * intensity)) : prev.curiosity,
        empathy: type === 'positive' ? Math.max(0, Math.min(1, prev.empathy + 0.3 * intensity)) : prev.empathy,
        resilience: type === 'positive' ? Math.max(0, Math.min(1, prev.resilience + 0.1 * intensity)) : prev.resilience,
        intuition: type === 'positive' ? Math.max(0, Math.min(1, prev.intuition + 0.15 * intensity)) : prev.intuition,
        focus: type === 'negative' ? Math.max(0, Math.min(1, prev.focus - 0.1 * intensity)) : prev.focus,
        creativity: type === 'negative' ? Math.max(0, Math.min(1, prev.creativity - 0.05 * intensity)) : prev.creativity,
        interaction_count: (prev.interaction_count || 0) + 1,
        last_interaction_ts: Date.now(),
      };
      setHistory(h => [...h, {
        timestamp: Date.now(),
        state: updated,
        event: `interaction_${type}`
      }].slice(-1000));
      return updated;
    });
    return limbicState;
  }, [limbicState]);

  const setPosture = useCallback(async (posture: LimbicState['posture']) => {
    return updateLimbicState({ posture });
  }, [updateLimbicState]);

  const triggerElasticMode = useCallback(async (enabled: boolean) => {
    return updateLimbicState({ elastic_mode: enabled });
  }, [updateLimbicState]);

  const resetToBaseline = useCallback(async () => {
    setLimbicState(DEFAULT_STATE);
    setHistory(h => [...h, {
      timestamp: Date.now(),
      state: DEFAULT_STATE,
      event: 'reset_to_baseline'
    }].slice(-1000));
    return DEFAULT_STATE;
  }, []);

  const getPostureColor = useCallback((posture?: LimbicState['posture']) => {
    const currentPosture = posture || limbicState.posture;
    switch (currentPosture) {
      case 'COMPANION': return 'rgb(34, 197, 94)';
      case 'COPILOT': return 'rgb(59, 130, 246)';
      case 'PEER': return 'rgb(16, 185, 129)';
      case 'CONFIDANTE': return 'rgb(168, 85, 247)';
      case 'EXPERT': return 'rgb(251, 146, 60)';
      case 'MENTOR': return 'rgb(236, 72, 153)';
      case 'GUIDE': return 'rgb(6, 182, 212)';
      case 'FACILITATOR': return 'rgb(139, 92, 246)';
      case 'ADVOCATE': return 'rgb(239, 68, 68)';
      case 'INNOVATOR': return 'rgb(20, 184, 166)';
      case 'NURTURER': return 'rgb(244, 114, 182)';
      default: return 'rgb(107, 114, 128)';
    }
  }, [limbicState.posture]);

  const getEmotionDescription = useCallback(() => {
    const { trust, warmth, arousal, valence, posture } = limbicState;

    if (valence > 0.7 && arousal > 0.7) return 'Excited & Happy';
    if (valence > 0.7 && arousal < 0.3) return 'Calm & Content';
    if (valence < 0.3 && arousal > 0.7) return 'Agitated & Upset';
    if (valence < 0.3 && arousal < 0.3) return 'Sad & Tired';

    if (trust > 0.8 && warmth > 0.8) return 'Deeply Connected';
    if (trust < 0.3 && warmth < 0.3) return 'Distant & Cautious';

    return posture;
  }, [limbicState]);

  const fetchLimbicState = useCallback(async () => {
    try {
      const res = await fetch('/api/limbic/state');
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setLimbicState(prev => ({ ...prev, ...data.state }));
        }
      }
    } catch (e) {
      console.error('[limbic] fetch failed:', e);
    }
  }, []);

  useEffect(() => {
    fetchLimbicState();
    const interval = setInterval(fetchLimbicState, 60000);
    return () => clearInterval(interval);
  }, [fetchLimbicState]);

  const fetchLimbicHistory = useCallback(async (_limit?: number) => {}, []);
  const getLimbicHistory = useCallback(async (_limit?: number) => history, [history]);

  return {
    limbicState,
    history,
    loading,
    error,
    updateLimbicState,
    applyInteraction,
    setPosture,
    triggerElasticMode,
    resetToBaseline,
    getPostureColor,
    getEmotionDescription,
    fetchLimbicState,
    fetchLimbicHistory,
    getLimbicHistory
  };
}

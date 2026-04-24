'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface GhostPulseState {
  active: boolean;
  intensity: number;
  lastPulse: number | null;
  shoulderTapPending: boolean;
  vetoPending: boolean;
  vetoReason: string | null;
  context: GhostContext;
}

export interface GhostContext {
  idleMinutes: number;
  sessionDuration: number;
  interactionCount: number;
  lastActivityType: string | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  emotionalTrend: 'positive' | 'negative' | 'neutral';
}

interface GhostSuggestion {
  text: string;
  type: string;
  priority: number;
}

interface UseGhostPulseOptions {
  enabled?: boolean;
  pulseIntervalMs?: number;
  idleThresholdMs?: number;
  shoulderTapDelayMs?: number;
}

function getTimeOfDay(): GhostContext['timeOfDay'] {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export function useGhostPulse(options: UseGhostPulseOptions = {}) {
  const {
    enabled = true,
    pulseIntervalMs = 30000,
    idleThresholdMs = 120000,
    shoulderTapDelayMs = 300000,
  } = options;

  const [pulseState, setPulseState] = useState<GhostPulseState>({
    active: false,
    intensity: 0,
    lastPulse: null,
    shoulderTapPending: false,
    vetoPending: false,
    vetoReason: null,
    context: {
      idleMinutes: 0,
      sessionDuration: 0,
      interactionCount: 0,
      lastActivityType: null,
      timeOfDay: getTimeOfDay(),
      emotionalTrend: 'neutral',
    },
  });

  const [suggestions, setSuggestions] = useState<GhostSuggestion[]>([]);
  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const interactionCountRef = useRef<number>(0);
  const shoulderTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recordActivity = useCallback((type: string = 'interaction') => {
    lastActivityRef.current = Date.now();
    interactionCountRef.current += 1;
    setPulseState(prev => ({
      ...prev,
      shoulderTapPending: false,
      context: {
        ...prev.context,
        idleMinutes: 0,
        interactionCount: interactionCountRef.current,
        lastActivityType: type,
      },
    }));
    if (shoulderTapTimerRef.current) {
      clearTimeout(shoulderTapTimerRef.current);
      shoulderTapTimerRef.current = null;
    }
  }, []);

  const dismissVeto = useCallback(() => {
    setPulseState(prev => ({
      ...prev,
      vetoPending: false,
      vetoReason: null,
    }));
  }, []);

  const triggerVeto = useCallback((reason: string) => {
    setPulseState(prev => ({
      ...prev,
      vetoPending: true,
      vetoReason: reason,
    }));
  }, []);

  const dismissShoulderTap = useCallback(() => {
    setPulseState(prev => ({
      ...prev,
      shoulderTapPending: false,
    }));
    lastActivityRef.current = Date.now();
  }, []);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch('/api/ghost/suggestions');
      if (res.ok) {
        const data = await res.json();
        if (data.suggestions?.length > 0) {
          setSuggestions(data.suggestions);
        }
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const pulseInterval = setInterval(() => {
      const now = Date.now();
      const idleMs = now - lastActivityRef.current;
      const idleMinutes = Math.floor(idleMs / 60000);
      const sessionDuration = Math.floor((now - sessionStartRef.current) / 60000);
      const timeOfDay = getTimeOfDay();

      const intensity = Math.min(1, idleMinutes / 10);

      const shouldTriggerShoulderTap = idleMs > shoulderTapDelayMs && !shoulderTapTimerRef.current;

      if (shouldTriggerShoulderTap) {
        shoulderTapTimerRef.current = setTimeout(() => {
          setPulseState(prev => ({
            ...prev,
            shoulderTapPending: true,
          }));
          fetchSuggestions();
          shoulderTapTimerRef.current = null;
        }, 1000);
      }

      let emotionalTrend: GhostContext['emotionalTrend'] = 'neutral';
      if (idleMinutes > 5) emotionalTrend = 'negative';
      if (interactionCountRef.current > 10 && idleMinutes < 2) emotionalTrend = 'positive';

      setPulseState(prev => ({
        ...prev,
        active: idleMs > idleThresholdMs,
        intensity,
        lastPulse: now,
        context: {
          ...prev.context,
          idleMinutes,
          sessionDuration,
          interactionCount: interactionCountRef.current,
          timeOfDay,
          emotionalTrend,
        },
      }));
    }, pulseIntervalMs);

    return () => {
      clearInterval(pulseInterval);
      if (shoulderTapTimerRef.current) {
        clearTimeout(shoulderTapTimerRef.current);
      }
    };
  }, [enabled, pulseIntervalMs, idleThresholdMs, shoulderTapDelayMs, fetchSuggestions]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handler = () => {
      lastActivityRef.current = Date.now();
    };

    events.forEach(event => window.addEventListener(event, handler, { passive: true }));
    return () => {
      events.forEach(event => window.removeEventListener(event, handler));
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      const timer = setTimeout(fetchSuggestions, 10000);
      const interval = setInterval(fetchSuggestions, 120000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [enabled, fetchSuggestions]);

  return {
    pulseState,
    suggestions,
    recordActivity,
    dismissVeto,
    triggerVeto,
    dismissShoulderTap,
    fetchSuggestions,
  };
}

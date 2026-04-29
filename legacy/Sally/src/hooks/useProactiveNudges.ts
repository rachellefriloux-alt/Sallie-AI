'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ProactiveNudge {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  action?: string;
  domain?: string;
  source: string;
  expiresAt?: string;
}

const POLL_INTERVAL = 5 * 60 * 1000;
const DISMISSED_KEY = 'sallie_dismissed_nudges';
const SESSION_NUDGE_KEY = 'sallie_session_nudge_sent';

function getDismissedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(ids).slice(-200);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(arr));
  } catch {}
}

export function hasSessionNudgeBeenSent(): boolean {
  if (typeof window === 'undefined') return true;
  return sessionStorage.getItem(SESSION_NUDGE_KEY) === 'true';
}

export function markSessionNudgeSent() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_NUDGE_KEY, 'true');
}

export function useProactiveNudges() {
  const [allNudges, setAllNudges] = useState<ProactiveNudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [newNudgeForToast, setNewNudgeForToast] = useState<ProactiveNudge | null>(null);
  const previousNudgeIdsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDismissedIds(getDismissedIds());
  }, []);

  const fetchNudges = useCallback(async () => {
    try {
      const res = await fetch('/api/proactive');
      if (res.ok) {
        const data = await res.json();
        const nudges: ProactiveNudge[] = data.nudges || [];
        setAllNudges(nudges);

        const currentDismissed = getDismissedIds();
        const newOnes = nudges.filter(
          n => !currentDismissed.has(n.id) && !previousNudgeIdsRef.current.has(n.id)
        );

        if (newOnes.length > 0) {
          setNewNudgeForToast(newOnes[0]);
        }

        previousNudgeIdsRef.current = new Set(nudges.map(n => n.id));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNudges();
    intervalRef.current = setInterval(fetchNudges, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNudges]);

  const dismiss = useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveDismissedIds(next);
      return next;
    });
  }, []);

  const clearToast = useCallback(() => {
    setNewNudgeForToast(null);
  }, []);

  const nudges = allNudges.filter(n => !dismissedIds.has(n.id));

  return {
    nudges,
    loading,
    dismiss,
    newNudgeForToast,
    clearToast,
    refetch: fetchNudges,
  };
}

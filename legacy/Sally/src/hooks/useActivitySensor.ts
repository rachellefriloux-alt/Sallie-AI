import { useState, useEffect, useCallback, useRef } from 'react';

interface ActivityEvent {
  type: 'click' | 'scroll' | 'keypress' | 'navigation' | 'focus' | 'blur' | 'idle' | 'active';
  timestamp: number;
  details?: Record<string, unknown>;
}

interface SessionMetrics {
  sessionId: string;
  startedAt: number;
  lastActivity: number;
  totalClicks: number;
  totalKeystrokes: number;
  totalScrolls: number;
  pageViews: number;
  idleTime: number;
  activeTime: number;
  currentPage: string;
  pagesVisited: string[];
  interactionRate: number;
  isIdle: boolean;
}

interface ActivitySensorOptions {
  idleThresholdMs?: number;
  flushIntervalMs?: number;
  trackClicks?: boolean;
  trackKeystrokes?: boolean;
  trackScrolls?: boolean;
  trackNavigation?: boolean;
  trackFocus?: boolean;
}

const DEFAULT_OPTIONS: Required<ActivitySensorOptions> = {
  idleThresholdMs: 60000,
  flushIntervalMs: 30000,
  trackClicks: true,
  trackKeystrokes: true,
  trackScrolls: true,
  trackNavigation: true,
  trackFocus: true,
};

function generateSessionId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function useActivitySensor(options: ActivitySensorOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const [metrics, setMetrics] = useState<SessionMetrics>(() => {
    const sessionId = typeof window !== 'undefined'
      ? sessionStorage.getItem('activity_session_id') || generateSessionId()
      : generateSessionId();
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('activity_session_id', sessionId);
    }
    return {
      sessionId,
      startedAt: Date.now(),
      lastActivity: Date.now(),
      totalClicks: 0,
      totalKeystrokes: 0,
      totalScrolls: 0,
      pageViews: 1,
      idleTime: 0,
      activeTime: 0,
      currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
      pagesVisited: typeof window !== 'undefined' ? [window.location.pathname] : ['/'],
      interactionRate: 0,
      isIdle: false,
    };
  });

  const eventsBuffer = useRef<ActivityEvent[]>([]);
  const lastActiveRef = useRef(Date.now());
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleStartRef = useRef<number | null>(null);

  const recordEvent = useCallback((event: ActivityEvent) => {
    eventsBuffer.current.push(event);
    lastActiveRef.current = Date.now();

    if (idleStartRef.current !== null) {
      const idleDuration = Date.now() - idleStartRef.current;
      idleStartRef.current = null;
      setMetrics(prev => ({
        ...prev,
        idleTime: prev.idleTime + idleDuration,
        isIdle: false,
        lastActivity: Date.now(),
      }));
    }

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      idleStartRef.current = Date.now();
      setMetrics(prev => ({ ...prev, isIdle: true }));
      eventsBuffer.current.push({ type: 'idle', timestamp: Date.now() });
    }, config.idleThresholdMs);
  }, [config.idleThresholdMs]);

  const flushToServer = useCallback(async () => {
    const events = eventsBuffer.current.splice(0);
    if (events.length === 0) return;

    const now = Date.now();
    const payload = {
      ...metrics,
      activeTime: now - metrics.startedAt - metrics.idleTime,
      interactionRate:
        (metrics.totalClicks + metrics.totalKeystrokes + metrics.totalScrolls) /
        Math.max(1, (now - metrics.startedAt) / 1000),
      events,
    };

    try {
      await fetch('/api/sensors/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch {
      eventsBuffer.current.unshift(...events);
    }
  }, [metrics]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onClick = () => {
      if (!config.trackClicks) return;
      recordEvent({ type: 'click', timestamp: Date.now() });
      setMetrics(prev => ({ ...prev, totalClicks: prev.totalClicks + 1, lastActivity: Date.now() }));
    };

    const onKeyDown = () => {
      if (!config.trackKeystrokes) return;
      recordEvent({ type: 'keypress', timestamp: Date.now() });
      setMetrics(prev => ({ ...prev, totalKeystrokes: prev.totalKeystrokes + 1, lastActivity: Date.now() }));
    };

    const onScroll = () => {
      if (!config.trackScrolls) return;
      recordEvent({ type: 'scroll', timestamp: Date.now(), details: { scrollY: window.scrollY } });
      setMetrics(prev => ({ ...prev, totalScrolls: prev.totalScrolls + 1, lastActivity: Date.now() }));
    };

    const onFocus = () => {
      if (!config.trackFocus) return;
      recordEvent({ type: 'focus', timestamp: Date.now() });
    };

    const onBlur = () => {
      if (!config.trackFocus) return;
      recordEvent({ type: 'blur', timestamp: Date.now() });
    };

    const onBeforeUnload = () => {
      flushToServer();
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('scroll', onScroll);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [config, recordEvent, flushToServer]);

  useEffect(() => {
    const interval = setInterval(flushToServer, config.flushIntervalMs);
    return () => clearInterval(interval);
  }, [config.flushIntervalMs, flushToServer]);

  const trackNavigation = useCallback((path: string) => {
    recordEvent({ type: 'navigation', timestamp: Date.now(), details: { path } });
    setMetrics(prev => ({
      ...prev,
      pageViews: prev.pageViews + 1,
      currentPage: path,
      pagesVisited: prev.pagesVisited.includes(path) ? prev.pagesVisited : [...prev.pagesVisited, path],
      lastActivity: Date.now(),
    }));
  }, [recordEvent]);

  const getSessionSummary = useCallback(() => {
    const now = Date.now();
    const totalDuration = now - metrics.startedAt;
    const activeTime = totalDuration - metrics.idleTime;
    const totalInteractions = metrics.totalClicks + metrics.totalKeystrokes + metrics.totalScrolls;
    return {
      sessionId: metrics.sessionId,
      durationMs: totalDuration,
      activeTimeMs: activeTime,
      idleTimeMs: metrics.idleTime,
      activePercent: totalDuration > 0 ? Math.round((activeTime / totalDuration) * 100) : 100,
      totalInteractions,
      interactionRate: totalDuration > 0 ? totalInteractions / (totalDuration / 1000) : 0,
      pageViews: metrics.pageViews,
      uniquePages: metrics.pagesVisited.length,
      isIdle: metrics.isIdle,
    };
  }, [metrics]);

  return {
    metrics,
    trackNavigation,
    getSessionSummary,
    flushToServer,
  };
}

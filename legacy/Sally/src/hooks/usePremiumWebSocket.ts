'use client';

/**
 * Premium WebSocket hook — production-grade connection status for ConnectionIndicator.
 * Wraps useWebSocket with latency measurement (ping/pong), connection quality,
 * and proper error handling.
 */

import { useWebSocket } from './useWebSocket';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

const PING_INTERVAL_MS = 10_000;
const LATENCY_SAMPLES = 5;
const QUALITY_WEIGHTS = { latency: 0.6, stability: 0.4 } as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function latencyToQuality(latencyMs: number): number {
  if (latencyMs <= 50) return 95;
  if (latencyMs <= 100) return 85;
  if (latencyMs <= 200) return 70;
  if (latencyMs <= 500) return 50;
  return clamp(100 - latencyMs / 10, 10, 40);
}

export function usePremiumWebSocket(url?: string) {
  const {
    isConnected,
    connectionStatus: wsStatus,
    error: wsError,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
  } = useWebSocket(url);

  const [latency, setLatency] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState(0);
  const latencyHistoryRef = useRef<number[]>([]);
  const pingSentAtRef = useRef<number | null>(null);

  const connectionStatus: ConnectionStatus = useMemo(() => {
    if (wsError) return 'error';
    if (wsStatus === 'disconnected') return 'disconnected';
    return wsStatus;
  }, [wsStatus, wsError]);

  const measureLatency = useCallback(() => {
    if (!isConnected || !sendMessage) return;
    const sent = performance.now();
    pingSentAtRef.current = sent;
    sendMessage({ type: 'ping', timestamp: sent });
  }, [isConnected, sendMessage]);

  useEffect(() => {
    if (!lastMessage || !isConnected) return;
    try {
      const data = typeof lastMessage === 'string' ? JSON.parse(lastMessage) : lastMessage;
      if (data?.type === 'pong' && typeof pingSentAtRef.current === 'number') {
        const roundtrip = Math.round(performance.now() - pingSentAtRef.current);
        pingSentAtRef.current = null;
        setLatency(roundtrip);
        latencyHistoryRef.current = [
          ...latencyHistoryRef.current.slice(-LATENCY_SAMPLES + 1),
          roundtrip,
        ];
      }
    } catch {
      // non-JSON or parse error; ignore
    }
  }, [lastMessage, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      setLatency(0);
      latencyHistoryRef.current = [];
      pingSentAtRef.current = null;
      return;
    }
    measureLatency();
    const interval = setInterval(measureLatency, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isConnected, measureLatency]);

  useEffect(() => {
    if (!isConnected) {
      setConnectionQuality(0);
      return;
    }
    const samples = latencyHistoryRef.current;
    const avgLatency = samples.length > 0
      ? samples.reduce((a, b) => a + b, 0) / samples.length
      : latency;
    const latencyScore = latencyToQuality(avgLatency);
    const stabilityScore = samples.length >= 2
      ? 100 - Math.min(50, Math.abs(samples[samples.length - 1] - samples[samples.length - 2]))
      : 100;
    const quality = Math.round(
      latencyScore * QUALITY_WEIGHTS.latency +
      stabilityScore * QUALITY_WEIGHTS.stability
    );
    setConnectionQuality(clamp(quality, 0, 100));
  }, [isConnected, latency]);

  return {
    isConnected,
    connectionStatus,
    connectionQuality: isConnected ? connectionQuality : 0,
    latency: isConnected ? latency : 0,
    encryptionEnabled: true,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
  };
}

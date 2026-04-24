'use client';

import { useState, useCallback } from 'react';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export function useWebSocket(url?: string) {
  const [isConnected] = useState(false);
  const [connectionStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage] = useState<string | null>(null);
  const [error] = useState<string | null>(null);

  const sendMessage = useCallback((_message: string | object) => {
    return false;
  }, []);

  const joinRoom = useCallback((_roomId: string) => {}, []);
  const leaveRoom = useCallback((_roomId: string) => {}, []);
  const connect = useCallback(() => {}, []);
  const disconnect = useCallback(() => {}, []);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    error,
    sendMessage,
    joinRoom,
    leaveRoom,
    connect,
    disconnect
  };
}

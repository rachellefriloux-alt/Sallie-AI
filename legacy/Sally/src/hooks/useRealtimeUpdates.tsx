'use client';

import { useState, useCallback, createContext, useContext, type ReactNode } from 'react';

interface RealtimeMessage {
  id: string;
  type: 'message' | 'status' | 'presence' | 'typing' | 'system';
  data: any;
  timestamp: number;
  userId?: string;
  channelId?: string;
}

interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastConnected: number | null;
  reconnectAttempts: number;
}

interface PresenceInfo {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
  typing?: boolean;
  channelId?: string;
}

interface RealtimeConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  enablePresence: boolean;
  enableTyping: boolean;
}

export function useRealtimeUpdates(_config: Partial<RealtimeConfig> = {}) {
  const [connectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0,
  });

  const [messages] = useState<RealtimeMessage[]>([]);
  const [presence] = useState<Map<string, PresenceInfo>>(new Map());
  const [typingUsers] = useState<Map<string, number>>(new Map());

  const connect = useCallback(() => {}, []);
  const disconnect = useCallback(() => {}, []);

  const sendMessage = useCallback((_message: Partial<RealtimeMessage>) => {
    return Date.now().toString();
  }, []);

  const sendChatMessage = useCallback((content: string, _channelId?: string) => {
    return sendMessage({ type: 'message', data: { content } });
  }, [sendMessage]);

  const sendTyping = useCallback((_typing: boolean, _channelId?: string) => {
    return '';
  }, []);

  const updatePresence = useCallback((_status: PresenceInfo['status']) => {
    return '';
  }, []);

  const getOnlineUsers = useCallback(() => {
    return Array.from(presence.values()).filter(p => p.status === 'online');
  }, [presence]);

  const getTypingUsers = useCallback((_channelId?: string) => {
    return [] as string[];
  }, []);

  return {
    connectionStatus,
    connect,
    disconnect,
    messages,
    sendMessage,
    sendChatMessage,
    presence,
    updatePresence,
    getOnlineUsers,
    typingUsers,
    sendTyping,
    getTypingUsers,
    isConnected: false,
    isConnecting: false,
    error: null,
  };
}

const RealtimeContext = createContext<ReturnType<typeof useRealtimeUpdates> | null>(null);

export const RealtimeProvider = ({ children, config }: {
  children: ReactNode;
  config?: Partial<RealtimeConfig>;
}) => {
  const realtime = useRealtimeUpdates(config);
  return (
    <RealtimeContext.Provider value={realtime}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

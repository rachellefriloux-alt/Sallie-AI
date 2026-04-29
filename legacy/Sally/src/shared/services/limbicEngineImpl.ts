// @ts-nocheck
/**
 * Limbic Engine Service Implementation
 * Production-ready implementation for all platforms
 */

import { 
  ILimbicEngineService, 
  LimbicState, 
  PerceptionResult,
  LimbicEngineConfig,
  LimbicEventType,
  LimbicEngineUtils,
  PostureMode
} from './limbicEngine';

export { LimbicEngineUtils };

export class LimbicEngineServiceImpl implements ILimbicEngineService {
  private config: LimbicEngineConfig;
  private baseUrl: string;
  private wsUrl: string;

  constructor(config?: Partial<LimbicEngineConfig>) {
    // Detect platform and set appropriate config
    this.config = this.getPlatformConfig(config);
    this.baseUrl = this.config.baseUrl;
    this.wsUrl = this.config.wsUrl;
  }

  private getPlatformConfig(userConfig?: Partial<LimbicEngineConfig>): LimbicEngineConfig {
    // Use Supabase Edge Functions as the backend
    const supabaseUrl = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/limbic-state`
      : userConfig?.baseUrl || '/api/limbic';

    const wsUrl = supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://');

    return {
      baseUrl: userConfig?.baseUrl || supabaseUrl,
      wsUrl: userConfig?.wsUrl || wsUrl,
      timeout: userConfig?.timeout || 10000,
      reconnectAttempts: userConfig?.reconnectAttempts || 5,
      reconnectDelay: userConfig?.reconnectDelay || 1000,
    };
  }

  async getCurrentState(): Promise<LimbicState> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/state`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get limbic state: ${response.statusText}`);
      }

      const result = await response.json();
      return result.state;
    } catch (error) {
      console.error('LimbicEngineService.getCurrentState error:', error);
      throw new Error(`Failed to get current limbic state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTrustTier(): Promise<{ current: TrustTier; all_tiers: TrustTier[] }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/trust`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get trust tier: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.getTrustTier error:', error);
      throw new Error(`Failed to get trust tier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processPerception(input: string, context?: any): Promise<{
    success: boolean;
    result: PerceptionResult;
    new_state: LimbicState;
  }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/perception`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          context,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to process perception: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.processPerception error:', error);
      throw new Error(`Failed to process perception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async enableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/elastic-mode/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to enable elastic mode: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.enableElasticMode error:', error);
      throw new Error(`Failed to enable elastic mode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/elastic-mode/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to disable elastic mode: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.disableElasticMode error:', error);
      throw new Error(`Failed to disable elastic mode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async triggerReunionSurge(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/reunion-surge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger reunion surge: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.triggerReunionSurge error:', error);
      throw new Error(`Failed to trigger reunion surge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getInteractionHistory(): Promise<{ success: boolean; history: any[]; total_count: number }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get interaction history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.getInteractionHistory error:', error);
      throw new Error(`Failed to get interaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async reset(): Promise<{ success: boolean; message: string; state: LimbicState }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reset limbic engine: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('LimbicEngineService.reset error:', error);
      throw new Error(`Failed to reset limbic engine: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private _ws: LimbicEngineWebSocket | null = null;

  onStateChange(callback: (state: LimbicState) => void): void {
    this._ensureWs();
    this._ws?.on('state_change', callback);
  }

  onPerceptionResult(callback: (result: PerceptionResult) => void): void {
    this._ensureWs();
    this._ws?.on('perception_result', callback);
  }

  onTrustChange(callback: (trust: number, tier: TrustTier) => void): void {
    this._ensureWs();
    this._ws?.on('trust_change', (data: { trust: number; tier: TrustTier }) => callback(data.trust, data.tier));
  }

  disconnect(): void {
    this._ws?.disconnect();
    this._ws = null;
  }

  private _ensureWs(): void {
    if (typeof window !== 'undefined' && !this._ws) {
      this._ws = new LimbicEngineWebSocket(this.wsUrl, { maxReconnectAttempts: this.config.reconnectAttempts, reconnectDelay: this.config.reconnectDelay });
    }
  }

  // Helper methods
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    }
  }

  // Utility methods
  public formatTrustScore(trust: number): string {
    return LimbicEngineUtils.formatTrustScore(trust);
  }

  public getPostureColor(posture: PostureMode): string {
    return LimbicEngineUtils.getPostureColor(posture);
  }

  public calculateLimbicHealth(state: LimbicState): number {
    return LimbicEngineUtils.calculateLimbicHealth(state);
  }
}

// WebSocket implementation
export class LimbicEngineWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private url: string;

  constructor(url: string, config?: { maxReconnectAttempts?: number; reconnectDelay?: number }) {
    this.url = url;
    this.maxReconnectAttempts = config?.maxReconnectAttempts || 5;
    this.reconnectDelay = config?.reconnectDelay || 1000;
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Connected to Limbic Engine WebSocket');
        this.reconnectAttempts = 0;
        this.emit('connected', null);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type || 'message', data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          this.emit('error', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from Limbic Engine WebSocket');
        this.emit('disconnected', null);
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnectFailed', null);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  public on(event: string, listener: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  public off(event: string, listener: (data: any) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export the service as the default export
export const LimbicEngine = {
  LimbicEngineServiceImpl,
  LimbicEngineWebSocket,
  LimbicEngineUtils,
};

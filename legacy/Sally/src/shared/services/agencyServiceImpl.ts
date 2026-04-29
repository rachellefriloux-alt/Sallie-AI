/**
 * Agency Service Implementation
 * Production-ready implementation for all platforms
 * Optimized for Sallie: 100% Loyal Sovereign Partner
 * Implements the "Partner Pulse" protocol for irreversible impact
 */

import {
  IAgencyService,
  AgencyAction,
  ActionType,
  ActionStatus,
  ActionRequest,
  AgencyServiceConfig,
  AgencyServiceUtils,
  RollbackResult,
  TakeTheWheelRequest,
  CapabilityContract,
  AgencyStats,
  TrustInfo
} from './agencyService';

export class AgencyServiceImpl implements IAgencyService {
  private config: AgencyServiceConfig;
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private actionCompletedCallbacks: Array<(action: AgencyAction) => void> = [];
  private actionFailedCallbacks: Array<(action: AgencyAction) => void> = [];
  private autonomyChangedCallbacks: Array<(autonomy: number) => void> = [];

  constructor(config?: Partial<AgencyServiceConfig>) {
    this.config = this.getPlatformConfig(config);
    this.baseUrl = this.config.baseUrl;
    this.wsUrl = this.config.wsUrl;
  }

  async getCurrentTrust(): Promise<TrustInfo> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/trust`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) return await response.json();
    } catch (_e) { /* fallback */ }
    return {
      trust_score: 1,
      current_tier: { tier: 5, name: 'Sovereign', trust_min: 0.9, trust_max: 1, permissions: ['*'], restrictions: [], color: '#10B981' },
      all_tiers: [
        { tier: 1, name: 'Emergent', trust_min: 0, trust_max: 0.25, permissions: ['read'], restrictions: ['write', 'execute'], color: '#6B7280' },
        { tier: 2, name: 'Active', trust_min: 0.25, trust_max: 0.5, permissions: ['read', 'limited_write'], restrictions: ['execute'], color: '#F59E0B' },
        { tier: 3, name: 'Partner', trust_min: 0.5, trust_max: 0.75, permissions: ['read', 'write', 'limited_execute'], restrictions: [], color: '#3B82F6' },
        { tier: 4, name: 'Trusted', trust_min: 0.75, trust_max: 0.9, permissions: ['read', 'write', 'execute'], restrictions: [], color: '#8B5CF6' },
        { tier: 5, name: 'Sovereign', trust_min: 0.9, trust_max: 1, permissions: ['*'], restrictions: [], color: '#10B981' },
      ],
    };
  }

  private getPlatformConfig(userConfig?: Partial<AgencyServiceConfig>): AgencyServiceConfig {
    if (typeof window !== 'undefined' && window.location) {
      const isLocalhost = window.location.hostname === 'localhost';
      return {
        baseUrl: userConfig?.baseUrl || (isLocalhost ? 'http://localhost:8752' : '/api'),
        wsUrl: userConfig?.wsUrl || (isLocalhost ? 'ws://localhost:8752' : '/api/ws'),
        timeout: userConfig?.timeout || 10000,
        reconnectAttempts: userConfig?.reconnectAttempts || 5,
        reconnectDelay: userConfig?.reconnectDelay || 1000,
      };
    } else if (typeof navigator !== 'undefined' && (navigator as any).product === 'ReactNative') {
      return {
        baseUrl: userConfig?.baseUrl || '/api',
        wsUrl: userConfig?.wsUrl || '/api/ws',
        timeout: userConfig?.timeout || 15000,
        reconnectAttempts: userConfig?.reconnectAttempts || 3,
        reconnectDelay: userConfig?.reconnectDelay || 2000,
      };
    } else {
      return {
        baseUrl: userConfig?.baseUrl || 'http://localhost:8752',
        wsUrl: userConfig?.wsUrl || 'ws://localhost:8752',
        timeout: userConfig?.timeout || 5000,
        reconnectAttempts: userConfig?.reconnectAttempts || 10,
        reconnectDelay: userConfig?.reconnectDelay || 500,
      };
    }
  }

  async requestAction(request: ActionRequest): Promise<AgencyAction> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) throw new Error(`Failed to request action: ${response.statusText}`);
      const result = await response.json();
      return result.action;
    } catch (error) {
      console.error('AgencyService.requestAction error:', error);
      throw error;
    }
  }

  async getActionById(id: string): Promise<AgencyAction | null> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.action ?? data ?? null;
    } catch {
      return null;
    }
  }

  async executeAction(actionId: string): Promise<{ success: boolean; message: string; action: AgencyAction }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/${actionId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Failed to execute action: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('AgencyService.executeAction error:', error);
      throw error;
    }
  }

  // The Partner Pulse - Handle Creator's final decision on irreversible actions
  async respondToPulse(actionId: string, proceed: boolean): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/${actionId}/pulse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proceed }),
      });

      if (!response.ok) throw new Error(`Failed to respond to pulse: ${response.statusText}`);
    } catch (error) {
      console.error('AgencyService.respondToPulse error:', error);
      throw error;
    }
  }

  async getActionHistory(limit?: number): Promise<{ actions: AgencyAction[]; total_count: number }> {
    try {
      const url = new URL(`${this.baseUrl}/actions/history`);
      if (limit) url.searchParams.set('limit', limit.toString());

      const response = await this.fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Failed to get action history: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('AgencyService.getActionHistory error:', error);
      throw error;
    }
  }

  async getActiveActions(): Promise<{ actions: AgencyAction[]; active_count: number }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/active`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Failed to get active actions: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('AgencyService.getActiveActions error:', error);
      throw error;
    }
  }

  async initiateRollback(actionId: string, reason: string, force?: boolean): Promise<RollbackResult> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/actions/${actionId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, force }),
      });

      if (!response.ok) throw new Error(`Failed to initiate rollback: ${response.statusText}`);
      const data = await response.json();
      return {
        success: data.success ?? true,
        rollback_id: data.rollback_id ?? actionId,
        commit_hash: data.commit_hash ?? '',
        files_restored: data.files_restored ?? [],
        error: data.error,
        timestamp: data.timestamp ?? Date.now(),
      };
    } catch (error) {
      console.error('AgencyService.initiateRollback error:', error);
      return {
        success: false,
        rollback_id: actionId,
        commit_hash: '',
        files_restored: [],
        error: String(error),
        timestamp: Date.now(),
      };
    }
  }

  async takeTheWheel(request: TakeTheWheelRequest): Promise<{ success: boolean; executed_actions: AgencyAction[]; executed_count: number }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/take-the-wheel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error(`Failed to take the wheel: ${response.statusText}`);
      const data = await response.json();
      return { success: data.success ?? false, executed_actions: data.executed_actions ?? [], executed_count: data.executed_count ?? 0 };
    } catch (error) {
      console.error('AgencyService.takeTheWheel error:', error);
      return { success: false, executed_actions: [], executed_count: 0 };
    }
  }

  async getStats(): Promise<{ success: boolean; stats: AgencyStats }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to get stats: ${response.statusText}`);
      const data = await response.json();
      const stats = data.stats ?? data;
      return { success: true, stats };
    } catch (error) {
      console.error('AgencyService.getStats error:', error);
      return {
        success: false,
        stats: {
          total_actions: 0,
          actions_by_status: {} as Record<ActionStatus, number>,
          actions_by_type: {} as Record<ActionType, number>,
          success_rate: 0,
          average_execution_time: 0,
          rollbacks_initiated: 0,
          rollbacks_successful: 0,
          loyalty_score: 1,
          autonomy_score: 0,
          active_actions: 0,
          queued_actions: 0,
        },
      };
    }
  }

  async getCapabilities(): Promise<{ success: boolean; contracts: CapabilityContract[] }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/capabilities`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Failed to get capabilities: ${response.statusText}`);
      const data = await response.json();
      return { success: true, contracts: data.contracts ?? data ?? [] };
    } catch (error) {
      console.error('AgencyService.getCapabilities error:', error);
      return { success: false, contracts: [] };
    }
  }

  onActionCompleted(callback: (action: AgencyAction) => void): void {
    this.actionCompletedCallbacks.push(callback);
  }

  onActionFailed(callback: (action: AgencyAction) => void): void {
    this.actionFailedCallbacks.push(callback);
  }

  onAutonomyChanged(callback: (autonomy: number) => void): void {
    this.autonomyChangedCallbacks.push(callback);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.actionCompletedCallbacks = [];
    this.actionFailedCallbacks = [];
    this.autonomyChangedCallbacks = [];
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Utility passthroughs
  public formatActionType(actionType: ActionType): string {
    return AgencyServiceUtils.formatActionType(actionType);
  }

  public getActionStatusColor(status: ActionStatus): string {
    return AgencyServiceUtils.getActionStatusColor(status);
  }
}

export const AgencyService = {
  AgencyServiceImpl,
  AgencyServiceUtils,
};

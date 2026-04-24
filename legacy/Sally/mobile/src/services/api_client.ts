import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNextApiUrl } from '../../app/lib/api-config';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  curiosity?: number;
  focus?: number;
  creativity?: number;
  empathy?: number;
  resilience?: number;
  intuition?: number;
  posture?: string;
  loyalty?: number;
  energy?: number;
  humor?: number;
  wisdom?: number;
}

export interface ChatResponse {
  reply: string;
  role: string;
  emotion: string;
  urgency: string;
  posture: string;
  limbic_state: LimbicState;
  archetype?: string;
}

export interface ControlStatus {
  paused: boolean;
  autonomyLevel: number;
  overrides: Record<string, unknown>;
  allowedActions: string[];
  pausedAt: string | null;
  resumedAt: string | null;
}

export interface Capability {
  id: string;
  name: string;
  category: string;
  status: string;
  platform: string[];
  description?: string;
}

export interface CapabilitySummary {
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface TransparencyLogEntry {
  id: string;
  action: string;
  category: string;
  args: Record<string, unknown>;
  result: string;
  advisoryLevel: 'safe' | 'caution' | 'warning';
  rollbackAvailable: boolean;
  userId: string;
  timestamp: string;
}

export interface ConsciousnessState {
  thoughts: Array<{
    id: string;
    content: string;
    type: string;
    intensity: number;
    timestamp: string;
  }>;
  emotions: {
    trust: number;
    warmth: number;
    arousal: number;
    valence: number;
    primaryEmotion: string;
  };
  cognition: {
    activeProcesses: Array<{ name: string; status: string; load: number }>;
    creativityLevel: number;
    metacognitiveState: string;
  };
  systems: {
    activeSystems: Array<{ name: string; status: string; load: number; health: number }>;
    neuralActivity: number;
    overallHealth: number;
  };
  patterns: {
    trend: string;
    dominantEmotion: string;
    volatility: number;
    growthRate: number;
    patterns: string[];
  };
}

export interface ConvergenceQuestion {
  id: string;
  category: string;
  text: string;
}

export interface VoiceSTTResponse {
  text: string;
  confidence: number;
  status: string;
}

class APIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = (baseURL || getNextApiUrl()).replace(/\/$/, '');
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async chat(message: string, options?: {
    role?: string;
    conversation_id?: string;
    user_id?: string;
  }): Promise<ChatResponse> {
    try {
      const response = await this.client.post<ChatResponse>('/api/chat', {
        message,
        role: options?.role ?? 'BUSINESS',
        conversation_id: options?.conversation_id,
        user_id: options?.user_id,
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Chat failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async chatWithMessages(messages: ChatMessage[], mode?: string): Promise<ChatResponse> {
    try {
      const response = await this.client.post<ChatResponse>('/api/chat', {
        messages,
        mode: mode ?? 'BUSINESS',
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Chat failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async getLimbicState(): Promise<{ state: LimbicState }> {
    try {
      const response = await this.client.get<{ state: LimbicState }>('/api/limbic/state');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get limbic state: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async updateLimbicState(updates: Partial<LimbicState> & { event?: string }): Promise<{ state: LimbicState }> {
    try {
      const response = await this.client.post<{ state: LimbicState }>('/api/limbic/state', updates);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to update limbic state: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async getCapabilities(options?: {
    category?: string;
    id?: string;
    mode?: 'summary' | 'categories';
  }): Promise<{
    capabilities?: Capability[];
    capability?: Capability;
    summary?: CapabilitySummary;
    categories?: Array<{ id: string; label: string }>;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.category) params.set('category', options.category);
      if (options?.id) params.set('id', options.id);
      if (options?.mode) params.set('mode', options.mode);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await this.client.get(`/api/capabilities${query}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get capabilities: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async getControlStatus(): Promise<ControlStatus> {
    try {
      const response = await this.client.get<ControlStatus>('/api/control/status');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get control status: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async getTransparencyLog(options?: {
    limit?: number;
    category?: string;
    userId?: string;
    advisoryLevel?: 'safe' | 'caution' | 'warning';
    stats?: boolean;
  }): Promise<{ actions: TransparencyLogEntry[]; stats?: Record<string, unknown> }> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.category) params.set('category', options.category);
      if (options?.userId) params.set('userId', options.userId);
      if (options?.advisoryLevel) params.set('advisoryLevel', options.advisoryLevel);
      if (options?.stats) params.set('stats', 'true');
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await this.client.get(`/api/transparency/log${query}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get transparency log: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async logTransparencyAction(entry: {
    action: string;
    category: string;
    args?: Record<string, unknown>;
    result?: string;
    advisoryLevel?: 'safe' | 'caution' | 'warning';
    rollbackAvailable?: boolean;
    userId?: string;
  }): Promise<{ entry: TransparencyLogEntry }> {
    try {
      const response = await this.client.post('/api/transparency/log', entry);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to log action: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async getConsciousness(options?: {
    mode?: 'current' | 'history' | 'export';
    limit?: number;
    format?: 'json' | 'csv';
  }): Promise<ConsciousnessState> {
    try {
      const params = new URLSearchParams();
      if (options?.mode) params.set('mode', options.mode);
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.format) params.set('format', options.format);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await this.client.get(`/api/consciousness${query}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get consciousness: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async getConvergenceQuestions(): Promise<{
    questions: ConvergenceQuestion[];
    categories: Array<{ id: string; label: string }>;
  }> {
    try {
      const response = await this.client.get('/api/convergence');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to get convergence questions: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async submitConvergenceAnswers(answers: Record<string, unknown>): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
  }> {
    try {
      const response = await this.client.post('/api/convergence', { answers });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Failed to submit convergence answers: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async speechToText(audioData: ArrayBuffer): Promise<VoiceSTTResponse> {
    try {
      const response = await this.client.post<VoiceSTTResponse>('/api/voice/stt', audioData, {
        headers: { 'Content-Type': 'audio/wav' },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Speech-to-text failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async textToSpeech(text: string, options?: {
    voice?: string;
    style?: string;
    rate?: string;
    pitch?: string;
  }): Promise<ArrayBuffer> {
    try {
      const response = await this.client.post('/api/voice/tts', {
        text,
        ...options,
      }, {
        responseType: 'arraybuffer',
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Text-to-speech failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp?: string }> {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Health check failed: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }
}

export default APIClient;

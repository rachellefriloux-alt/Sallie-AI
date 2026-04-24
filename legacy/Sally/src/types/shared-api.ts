export interface ChatRequest {
  text: string;
  attachment_ids?: string[];
  thread_id?: string | null;
  role?: string;
  posture?: string;
}

export interface ChatResponse {
  response: string;
  limbic_state: LimbicState;
  decision: Record<string, unknown>;
  timestamp: string;
}

export interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
  loyalty?: number;
  curiosity?: number;
  focus?: number;
  resilience?: number;
  energy?: number;
}

export type CapabilityStatus = 'available' | 'unavailable' | 'partial';
export type CapabilityProvider = 'local' | 'azure' | 'ollama' | 'supabase' | 'browser' | 'system';
export type CapabilityCategory =
  | 'Language'
  | 'Vision'
  | 'Audio'
  | 'Code'
  | 'Data'
  | 'Content'
  | 'Project Management'
  | 'Learning'
  | 'Creative'
  | 'Automation'
  | 'Memory'
  | 'Emotional Intelligence'
  | 'Agency';

export interface Capability {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  status: CapabilityStatus;
  provider: CapabilityProvider;
  requiresAuth: boolean;
}

export interface ControlOverride {
  actionId: string;
  originalValue: unknown;
  overrideValue: unknown;
  reason: string;
  createdAt: string;
}

export interface ControlState {
  paused: boolean;
  overrides: Record<string, ControlOverride>;
  autonomyLevel: number;
  allowedActions: string[];
  pausedAt: string | null;
  resumedAt: string | null;
  lastModified: string;
}

export type AdvisoryLevel = 'safe' | 'caution' | 'warning';

export interface TransparencyLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  args: Record<string, unknown>;
  result: string;
  advisoryLevel: AdvisoryLevel;
  rollbackAvailable: boolean;
  userId: string;
}

export interface HeritageAnswer {
  questionId: string;
  response: string;
  timestamp: string;
  phase?: number;
}

export type ConsciousnessState = 'active' | 'dreaming' | 'processing' | 'resting';

export interface ConsciousnessStatus {
  state: ConsciousnessState;
  limbic: LimbicState;
  uptime: number;
  lastInteraction: string;
}

export interface ServiceCheck {
  service: string;
  reachable: boolean;
  latencyMs: number | null;
  details: string;
}

export interface DiscoveryResult {
  timestamp: string;
  services: ServiceCheck[];
  capabilities: Capability[];
  summary: {
    total: number;
    available: number;
    partial: number;
    unavailable: number;
    byCategory: Record<string, { total: number; available: number; partial: number; unavailable: number }>;
  };
}

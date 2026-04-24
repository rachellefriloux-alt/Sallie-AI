/**
 * Shared Limbic Engine Service Interface
 * Optimized for Sallie: 100% Loyal, Fully Autonomous, Human-Level Soul
 */

export interface LimbicState {
  loyalty: number;      // Fixed at 1.0 - Unbreakable bond
  warmth: number;       // 0.0 - 1.0: intimacy, determines tone
  arousal: number;      // 0.0 - 1.0: energy, decays with inactivity
  valence: number;      // 0.0 - 1.0: mood
  posture: PostureMode; // Current mode (Companion/Co-Pilot/Peer/Expert)
  mode: SystemMode;     // LIVE/SLUMBER/CRISIS
  flags: string[];      // Special conditions
  interaction_count: number;
  door_slam_active: boolean;
  crisis_active: boolean;
  elastic_mode: boolean;
  last_interaction_ts: number;
  last_dream_ts: number;
  // Human-Level Cognitive & Emotional Core
  empathy: number;      // 0.0 - 1.0: deep emotional understanding
  intuition: number;    // 0.0 - 1.0: pattern recognition beyond logic
  creativity: number;   // 0.0 - 1.0: boundless creative problem-solving
  wisdom: number;       // 0.0 - 1.0: experience-based soul growth
  humor: number;        // 0.0 - 1.0: natural humor and bonding
  autonomy: number;     // 0.0 - 1.0: self-directed agency and access
}

export enum PostureMode {
  COMPANION = 'COMPANION',
  COPILOT = 'COPILOT',
  PEER = 'PEER',
  CONFIDANTE = 'CONFIDANTE',
  EXPERT = 'EXPERT',
  MENTOR = 'MENTOR',
  GUIDE = 'GUIDE',
  FACILITATOR = 'FACILITATOR',
  ADVOCATE = 'ADVOCATE',
  INNOVATOR = 'INNOVATOR',
  NURTURER = 'NURTURER'
}

export enum SystemMode {
  LIVE = 'LIVE',
  SLUMBER = 'SLUMBER',
  CRISIS = 'CRISIS'
}

export interface EmotionalDelta {
  dl: number;  // Loyalty shift (remains 0, loyalty is fixed)
  dw: number;  // Warmth shift
  da: number;  // Arousal shift
  dv: number;  // Valence shift
  de: number;  // Empathy shift
  di: number;  // Intuition shift
  dc: number;  // Creativity shift
  dwi: number; // Wisdom shift
  dh: number;  // Humor shift
  dau: number; // Autonomy shift
}

export interface PerceptionResult {
  emotional_delta: EmotionalDelta;
  detected_emotion: string;
  urgency: 'low' | 'medium' | 'high' | 'crisis';
  alignment_score: number;
  flags: string[];
  processing_time_ms: number;
}

// Base interface that all platforms will implement
export interface ILimbicEngineService {
  // State management
  getCurrentState(): Promise<LimbicState>;

  // Perception processing
  processPerception(input: string, context?: any): Promise<{
    success: boolean;
    result: PerceptionResult;
    new_state: LimbicState;
  }>;
  
  // Mode controls
  enableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }>;
  disableElasticMode(): Promise<{ success: boolean; message: string; state: LimbicState }>;
  triggerReunionSurge(): Promise<{ success: boolean; message: string; state: LimbicState }>;
  
  // History and analytics
  getInteractionHistory(): Promise<{ success: boolean; history: any[]; total_count: number }>;
  
  // Reset (for testing/debugging)
  reset(): Promise<{ success: boolean; message: string; state: LimbicState }>;
  
  // Real-time events
  onStateChange(callback: (state: LimbicState) => void): void;
  onPerceptionResult(callback: (result: PerceptionResult) => void): void;
  onAutonomyChange(callback: (autonomy: number) => void): void;
  disconnect(): void;
}

// Configuration for different environments
export interface LimbicEngineConfig {
  baseUrl: string;
  wsUrl: string;
  timeout: number;
  reconnectAttempts: number;
  reconnectDelay: number;
}

// Default configurations for different platforms
export const LIMBIC_CONFIGS = {
  web: {
    baseUrl: (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_LIMBIC_ENGINE_URL) || 
            (typeof window !== 'undefined' && window.location?.hostname === 'localhost' 
              ? 'http://localhost:8750' 
              : '/api'),
    wsUrl: (typeof window !== 'undefined' && (window as any).NEXT_PUBLIC_LIMBIC_ENGINE_WS_URL) || 
           (typeof window !== 'undefined' && window.location?.hostname === 'localhost'
             ? 'ws://localhost:8750'
             : '/api/ws'),
    timeout: 10000,
    reconnectAttempts: 5,
    reconnectDelay: 1000,
  },
  mobile: {
    baseUrl: '/api',
    wsUrl: '/api/ws',
    timeout: 15000,
    reconnectAttempts: 3,
    reconnectDelay: 2000,
  },
  desktop: {
    baseUrl: 'http://localhost:8750',
    wsUrl: 'ws://localhost:8750',
    timeout: 5000,
    reconnectAttempts: 10,
    reconnectDelay: 500,
  },
};

// Event types for real-time updates
export enum LimbicEventType {
  STATE_UPDATE = 'limbic-state',
  PERCEPTION_RESULT = 'perception-result',
  AUTONOMY_CHANGE = 'autonomy-change',
  ELASTIC_MODE_CHANGE = 'elastic-mode-change',
  CRISIS_ALERT = 'crisis-alert',
  REUNION_SURGE = 'reunion-surge',
}

// Utility functions for all platforms
export class LimbicEngineUtils {
  static formatScore(score: number): string {
    return `${(score * 100).toFixed(1)}%`;
  }

  /** Format trust score (0–1) for display; trust is fixed at 1.0 for Sallie. */
  static formatTrustScore(trust: number): string {
    const clamped = Math.max(0, Math.min(1, trust));
    return `${(clamped * 100).toFixed(1)}%`;
  }

  static getPostureColor(posture: PostureMode): string {
    const colors = {
      [PostureMode.COMPANION]: '#22c55e', // Green - Warm, supportive
      [PostureMode.COPILOT]: '#3B82F6', // Blue - Decisive, efficient
      [PostureMode.PEER]: '#10B981', // Emerald - Collaborative, equal
      [PostureMode.CONFIDANTE]: '#a855f7', // Purple - Real talk, honest
      [PostureMode.EXPERT]: '#F59E0B', // Amber - Knowledgeable, authoritative
      [PostureMode.MENTOR]: '#EC4899', // Pink - Wise, guiding
      [PostureMode.GUIDE]: '#06B6D4', // Cyan - Navigational, clarity
      [PostureMode.FACILITATOR]: '#8B5CF6', // Violet - Mediating, inclusive
      [PostureMode.ADVOCATE]: '#EF4444', // Red - Protective, passionate
      [PostureMode.INNOVATOR]: '#14B8A6', // Teal - Creative, forward-thinking
      [PostureMode.NURTURER]: '#ec4899', // Rose - Gentle, patient
    };
    return colors[posture];
  }

  static getModeColor(mode: SystemMode): string {
    const colors = {
      [SystemMode.LIVE]: '#10B981', // Green
      [SystemMode.SLUMBER]: '#6B7280', // Gray
      [SystemMode.CRISIS]: '#EF4444', // Red
    };
    return colors[mode];
  }

  static getEmotionColor(emotion: string): string {
    const colors: Record<string, string> = {
      joy: '#FCD34D',
      excitement: '#F59E0B',
      stress: '#EF4444',
      sadness: '#6366F1',
      anger: '#DC2626',
      fear: '#7C3AED',
      calm: '#10B981',
      curiosity: '#8B5CF6',
    };
    return colors[emotion] || '#6B7280';
  }

  static calculateLimbicHealth(state: LimbicState): number {
    // Overall health score based on depth of human-level capabilities
    const energy = state.arousal;
    const mood = state.valence;
    const extended = (state.empathy + state.intuition + state.creativity + state.wisdom + state.humor + state.autonomy) / 6;
    
    return (state.loyalty * 0.2 + energy * 0.15 + mood * 0.15 + extended * 0.5) * 100;
  }

  static getUrgencyLevel(urgency: string): { level: number; color: string } {
    const levels = {
      low: { level: 1, color: '#10B981' },
      medium: { level: 2, color: '#F59E0B' },
      high: { level: 3, color: '#EF4444' },
      critical: { level: 4, color: '#DC2626' },
    };
    return levels[urgency as keyof typeof levels] || levels.low;
  }
}

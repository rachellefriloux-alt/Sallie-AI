/**
 * Memory Service Type Definitions
 * Comprehensive type system for the Memory Service
 */

/**
 * Enumeration of memory types
 */
export enum MemoryType {
  EPISODIC = 'episodic',
  SEMANTIC = 'semantic',
  PROCEDURAL = 'procedural',
  EMOTIONAL = 'emotional',
}

/**
 * Privacy classification levels
 */
export enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
}

/**
 * Memory importance levels
 */
export enum ImportanceLevel {
  CRITICAL = 5,
  HIGH = 4,
  MEDIUM = 3,
  LOW = 2,
  TRIVIAL = 1,
}

/**
 * Emotion types for emotional memory
 */
export enum EmotionType {
  JOY = 'joy',
  SADNESS = 'sadness',
  ANGER = 'anger',
  FEAR = 'fear',
  SURPRISE = 'surprise',
  DISGUST = 'disgust',
  TRUST = 'trust',
  ANTICIPATION = 'anticipation',
  LOVE = 'love',
  GUILT = 'guilt',
  SHAME = 'shame',
  PRIDE = 'pride',
  ANXIETY = 'anxiety',
  RELIEF = 'relief',
  HOPE = 'hope',
  CONTENTMENT = 'contentment',
  FRUSTRATION = 'frustration',
  EXCITEMENT = 'excitement',
}

/**
 * Association types between memories
 */
export enum AssociationType {
  CAUSAL = 'causal',
  TEMPORAL = 'temporal',
  SEMANTIC = 'semantic',
  EMOTIONAL = 'emotional',
  CONTEXTUAL = 'contextual',
}

/**
 * Core memory entity structure
 */
export interface Memory {
  id: string;
  type: MemoryType;
  content: string;
  timestamp: Date;
  source: string;
  confidence: number;
  privacyLevel: PrivacyLevel;
  importance: number;
  metadata: MemoryMetadata;
  associations: Association[];
  version: number;
}

/**
 * Memory metadata structure
 */
export interface MemoryMetadata {
  context: Record<string, unknown>;
  tags: string[];
  entities: Entity[];
  location?: GeoLocation;
  usageCount: number;
  lastAccessed: Date;
  emotionalValence: number;
  emotionalArousal: number;
}

/**
 * Entity extracted from memory
 */
export interface Entity {
  type: string;
  value: string;
  /**
   * Confidence score for the entity extraction.
   * Range: 0 (lowest confidence) to 1 (highest confidence).
   * Indicates the system's certainty that the entity is correctly identified.
   */
  confidence: number;
}

/**
 * Geographic location
 */
export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Association between memories
 */
export interface Association {
  targetId: string;
  type: AssociationType;
  strength: number;
  bidirectional: boolean;
  metadata: Record<string, unknown>;
}

/**
 * Episodic memory specific structure
 */
export interface EpisodicMemory extends Memory {
  type: MemoryType.EPISODIC;
  event: {
    name: string;
    description: string;
    participants: string[];
    location?: GeoLocation;
    duration?: number;
    emotionalState: EmotionType[];
    significance: number;
  };
  sequence: number;
  cluster?: string;
}

/**
 * Semantic memory specific structure
 */
export interface SemanticMemory extends Memory {
  type: MemoryType.SEMANTIC;
  knowledge: {
    subject: string;
    predicate: string;
    object: string;
    category: string[];
    verified: boolean;
    verificationSource?: string;
  };
}

/**
 * Procedural memory specific structure
 */
export interface ProceduralMemory extends Memory {
  type: MemoryType.PROCEDURAL;
  procedure: {
    name: string;
    steps: ProcedureStep[];
    conditions: Record<string, unknown>;
    effectivenessScore: number;
    adaptations: ProcedureAdaptation[];
  };
}

/**
 * Procedure step
 */
export interface ProcedureStep {
  order: number;
  action: string;
  description: string;
  requiredContext?: Record<string, unknown>;
  expectedOutcome?: string;
}

/**
 * Procedure adaptation
 */
export interface ProcedureAdaptation {
  context: Record<string, unknown>;
  modifications: string[];
  effectivenessChange: number;
}

/**
 * Emotional memory specific structure
 */
export interface EmotionalMemory extends Memory {
  type: MemoryType.EMOTIONAL;
  emotion: {
    primaryEmotion: EmotionType;
    secondaryEmotions: EmotionType[];
    intensity: number;
    trigger: string;
    response: string;
    effectiveness: number;
  };
}

/**
 * Memory query structure
 */
export interface MemoryQuery {
  types?: MemoryType[];
  keywords?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  emotions?: EmotionType[];
  minImportance?: number;
  entities?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Retrieval result structure
 */
export interface RetrievalResult {
  memories: Memory[];
  totalCount: number;
  relevanceScores: Map<string, number>;
  executionTime: number;
}

/**
 * Memory version history
 */
export interface MemoryVersion {
  version: number;
  timestamp: Date;
  changes: MemoryChange[];
  author: string;
  reason?: string;
}

/**
 * Memory change record
 */
export interface MemoryChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Consolidation buffer entry
 */
export interface ConsolidationEntry {
  memory: Memory;
  addedAt: Date;
  importanceScore: number;
  processed: boolean;
}

/**
 * Index types
 */
export enum IndexType {
  BTREE = 'btree',
  INVERTED = 'inverted',
  SPATIAL = 'spatial',
  SEMANTIC = 'semantic',
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalMemories: number;
  memoryByType: Record<MemoryType, number>;
  storageUsed: number;
  associationCount: number;
  averageImportance: number;
  oldestMemory: Date;
  newestMemory: Date;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  operationType: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  metadata?: Record<string, unknown>;
}

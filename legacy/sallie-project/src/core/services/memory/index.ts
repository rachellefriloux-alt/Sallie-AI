/**
 * Memory Service Module
 * 
 * Comprehensive memory system for the Sallie AI Companion.
 * Exports all memory-related components and services.
 */

// Main Service
export { MemoryService } from './MemoryService';
export type { MemoryServiceConfig } from './MemoryService';

// Models
export { MemoryEntity, MemoryType, PrivacyLevel } from './models/MemoryEntity';
export type { MemoryMetadata, MemoryVersion } from './models/MemoryEntity';

export { EpisodicMemory } from './models/EpisodicMemory';
export type {
  EpisodicContent,
  TemporalContext,
  SpatialContext,
  Participant
} from './models/EpisodicMemory';

export { SemanticMemory, SemanticKnowledgeType } from './models/SemanticMemory';
export type {
  SemanticContent,
  EntityRelationship
} from './models/SemanticMemory';

export { ProceduralMemory } from './models/ProceduralMemory';
export type {
  ProceduralContent,
  ProcedureStep,
  ProcedureContext,
  ProcedureEffectiveness
} from './models/ProceduralMemory';

export { EmotionalMemory } from './models/EmotionalMemory';
export type {
  EmotionalContent,
  EmotionalState,
  EmotionalTrigger,
  EmotionalResponse,
  EmotionalPattern
} from './models/EmotionalMemory';

// Storage
export { MemoryStoreError } from './storage/MemoryStore';
export type {
  IMemoryStore,
  QueryOptions,
  StorageStats
} from './storage/MemoryStore';

export { LocalStorageAdapter } from './storage/LocalStorageAdapter';
export type { LocalStorageConfig } from './storage/LocalStorageAdapter';

export { EncryptedStorage } from './storage/EncryptedStorage';
export type { EncryptionConfig } from './storage/EncryptedStorage';

// Retrieval
export { BaseRetrievalStrategy } from './retrieval/RetrievalStrategy';
export type {
  IRetrievalStrategy,
  RetrievalContext,
  RetrievalOptions,
  RetrievedMemory
} from './retrieval/RetrievalStrategy';

export { ContextualRetrieval } from './retrieval/ContextualRetrieval';
export { AssociationRetrieval } from './retrieval/AssociationRetrieval';
export { TemporalRetrieval } from './retrieval/TemporalRetrieval';
export { EmotionalRetrieval } from './retrieval/EmotionalRetrieval';

// Consolidation
export { ShortTermBuffer } from './consolidation/ShortTermBuffer';
export type { ShortTermBufferConfig } from './consolidation/ShortTermBuffer';

export { ConsolidationEngine } from './consolidation/ConsolidationEngine';
export type { ConsolidationResult } from './consolidation/ConsolidationEngine';

// Association
export { AssociationGraph, AssociationType } from './association/AssociationGraph';
export type { MemoryAssociation } from './association/AssociationGraph';

export { AssociationEngine } from './association/AssociationEngine';
export type { AssociationConfig } from './association/AssociationEngine';

// Indexing
export { MemoryIndex, EntityIndex, TagIndex, TypeIndex } from './indexing/MemoryIndex';
export type { IndexEntry } from './indexing/MemoryIndex';

export { TemporalIndex } from './indexing/TemporalIndex';

export { SemanticIndex } from './indexing/SemanticIndex';
export type { VectorEmbedding, SimilarityResult } from './indexing/SemanticIndex';

// Query Retrieval
export { QueryRetrieval } from './retrieval/QueryRetrieval';
export type { QueryParameters } from './retrieval/QueryRetrieval';

// Pattern Mining
export { PatternMiner, PatternType } from './consolidation/PatternMiner';
export type { DetectedPattern, PatternMinerConfig } from './consolidation/PatternMiner';

// Attention Mechanism
export { AttentionMechanism } from './consolidation/AttentionMechanism';
export type { AttentionConfig, AttentionComponents } from './consolidation/AttentionMechanism';

// Sync Engine
export { SyncEngine, SyncStatus } from './sync/SyncEngine';
export type { SyncConfig, SyncResult, SyncConflict } from './sync/SyncEngine';

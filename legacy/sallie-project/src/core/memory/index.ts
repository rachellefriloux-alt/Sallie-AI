/**
 * Memory Service - Main Export
 * Complete memory management system for Sallie AI
 */

// Main service
export { MemoryService } from './MemoryService';
export type { MemoryServiceConfig } from './MemoryService';

// Types
export type {
  Memory,
  MemoryQuery,
  RetrievalResult,
  EpisodicMemory,
  SemanticMemory,
  ProceduralMemory,
  EmotionalMemory,
  Association,
  StorageStats,
  MemoryMetadata,
  Entity,
  GeoLocation,
  ProcedureStep,
  ProcedureAdaptation,
  MemoryVersion,
  MemoryChange,
  ConsolidationEntry,
  PerformanceMetrics,
} from './types';

export {
  MemoryType,
  AssociationType,
  EmotionType,
  PrivacyLevel,
  ImportanceLevel,
  IndexType,
} from './types';

// Storage utilities
export { EncryptionService } from './storage/encryption';
export type { EncryptionResult } from './storage/encryption';
export { CompressionService } from './storage/compression';
export type { CompressionMode, CompressedData } from './storage/compression';

/**
 * @sallie/memory-client
 *
 * Client wrapper for the brain's 4-tier memory subsystem
 * (Episodic / Semantic / Procedural / Working) per ADR 0001.
 *
 * Phase 0.6 placeholder. Implementation lands in Phase 1.5.
 */

export const MEMORY_CLIENT_VERSION = '0.0.0' as const;

export type MemoryTier = 'episodic' | 'semantic' | 'procedural' | 'working';

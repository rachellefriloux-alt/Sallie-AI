/**
 * Memory API validation helpers.
 * Validates request bodies and params for /api/memory routes.
 */

export const MEMORY_TYPES = [
  'conversation', 'observation', 'learning', 'heritage', 'hypothesis',
  'decision', 'reflection', 'insight', 'pattern', 'goal', 'event',
  'fact', 'question', 'answer',
] as const;

export const MEMORY_SOURCES = [
  'user_input', 'ai_response', 'system_generated', 'sensor_array',
  'dream_cycle', 'convergence', 'heritage_import', 'external_import',
] as const;

export function validateContent(content: unknown): string | null {
  if (typeof content !== 'string' || content.trim().length === 0) return null;
  if (content.length > 100_000) return null;
  return content.trim();
}

export function validateMetadata(meta: unknown): Record<string, unknown> | null {
  if (meta == null) return { type: 'conversation', source: 'user_input' };
  if (typeof meta !== 'object' || Array.isArray(meta)) return null;
  const m = meta as Record<string, unknown>;
  const type = typeof m.type === 'string' && MEMORY_TYPES.includes(m.type as typeof MEMORY_TYPES[number]) ? m.type : 'conversation';
  const source = typeof m.source === 'string' && MEMORY_SOURCES.includes(m.source as typeof MEMORY_SOURCES[number]) ? m.source : 'user_input';
  return { ...m, type, source };
}

export function validateTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter((t): t is string => typeof t === 'string' && t.length > 0 && t.length < 256).slice(0, 50);
}

export function validateEmbedding(emb: unknown): number[] {
  if (!Array.isArray(emb)) return [];
  return emb.filter((n): n is number => typeof n === 'number' && isFinite(n)).slice(0, 3072);
}

export function validateSalience(s: unknown): number {
  if (typeof s !== 'number' || !isFinite(s)) return 0.5;
  return Math.max(0, Math.min(1, s));
}

export function validateUuid(id: unknown): string | null {
  if (typeof id !== 'string') return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) ? id : null;
}

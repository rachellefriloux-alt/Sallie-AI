import { describe, it, expect } from 'vitest';
import {
  MEMORY_TYPES,
  MEMORY_SOURCES,
  validateContent,
  validateMetadata,
  validateTags,
  validateEmbedding,
  validateSalience,
  validateUuid,
} from './memory-validators';

describe('MEMORY_TYPES', () => {
  it('has expected types', () => {
    expect(MEMORY_TYPES).toContain('conversation');
    expect(MEMORY_TYPES).toContain('observation');
    expect(MEMORY_TYPES).toContain('learning');
    expect(MEMORY_TYPES.length).toBeGreaterThan(5);
  });
});

describe('MEMORY_SOURCES', () => {
  it('has expected sources', () => {
    expect(MEMORY_SOURCES).toContain('user_input');
    expect(MEMORY_SOURCES).toContain('ai_response');
    expect(MEMORY_SOURCES).toContain('system_generated');
  });
});

describe('validateContent', () => {
  it('returns trimmed string for valid input', () => {
    expect(validateContent('  hello  ')).toBe('hello');
  });

  it('returns null for empty string', () => {
    expect(validateContent('')).toBeNull();
    expect(validateContent('   ')).toBeNull();
  });

  it('returns null for non-string', () => {
    expect(validateContent(123)).toBeNull();
    expect(validateContent(null)).toBeNull();
    expect(validateContent(undefined)).toBeNull();
  });

  it('returns null for overly long content', () => {
    const longStr = 'x'.repeat(100_001);
    expect(validateContent(longStr)).toBeNull();
  });

  it('accepts content up to 100k chars', () => {
    const str = 'x'.repeat(100_000);
    expect(validateContent(str)).toBe(str);
  });
});

describe('validateMetadata', () => {
  it('returns defaults for null/undefined', () => {
    const result = validateMetadata(null);
    expect(result).toEqual({ type: 'conversation', source: 'user_input' });
  });

  it('returns null for non-object', () => {
    expect(validateMetadata('string')).toBeNull();
    expect(validateMetadata(123)).toBeNull();
  });

  it('returns null for array', () => {
    expect(validateMetadata([1, 2, 3])).toBeNull();
  });

  it('preserves valid type and source', () => {
    const result = validateMetadata({ type: 'learning', source: 'ai_response' });
    expect(result?.type).toBe('learning');
    expect(result?.source).toBe('ai_response');
  });

  it('defaults invalid type/source', () => {
    const result = validateMetadata({ type: 'invalid', source: 'nope' });
    expect(result?.type).toBe('conversation');
    expect(result?.source).toBe('user_input');
  });

  it('preserves extra fields', () => {
    const result = validateMetadata({ type: 'observation', extra: 'data' });
    expect(result?.extra).toBe('data');
  });
});

describe('validateTags', () => {
  it('returns empty array for non-array', () => {
    expect(validateTags('not-array')).toEqual([]);
    expect(validateTags(null)).toEqual([]);
  });

  it('filters out non-strings', () => {
    expect(validateTags(['valid', 123, null, 'also-valid'])).toEqual(['valid', 'also-valid']);
  });

  it('filters out empty strings', () => {
    expect(validateTags(['', 'valid'])).toEqual(['valid']);
  });

  it('limits to 50 tags', () => {
    const tags = Array.from({ length: 100 }, (_, i) => `tag-${i}`);
    expect(validateTags(tags).length).toBe(50);
  });
});

describe('validateEmbedding', () => {
  it('returns empty array for non-array', () => {
    expect(validateEmbedding('not-array')).toEqual([]);
  });

  it('filters non-numbers', () => {
    expect(validateEmbedding([1.0, 'bad', 2.0])).toEqual([1.0, 2.0]);
  });

  it('filters Infinity and NaN', () => {
    expect(validateEmbedding([1.0, Infinity, NaN, 2.0])).toEqual([1.0, 2.0]);
  });

  it('limits to 3072 dimensions', () => {
    const emb = Array.from({ length: 4000 }, (_, i) => i * 0.001);
    expect(validateEmbedding(emb).length).toBe(3072);
  });
});

describe('validateSalience', () => {
  it('returns value clamped between 0 and 1', () => {
    expect(validateSalience(0.5)).toBe(0.5);
    expect(validateSalience(-0.5)).toBe(0);
    expect(validateSalience(1.5)).toBe(1);
  });

  it('returns 0.5 for non-number', () => {
    expect(validateSalience('bad')).toBe(0.5);
    expect(validateSalience(null)).toBe(0.5);
    expect(validateSalience(NaN)).toBe(0.5);
    expect(validateSalience(Infinity)).toBe(0.5);
  });
});

describe('validateUuid', () => {
  it('returns valid UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(validateUuid(uuid)).toBe(uuid);
  });

  it('returns null for invalid UUID', () => {
    expect(validateUuid('not-a-uuid')).toBeNull();
    expect(validateUuid('550e8400-e29b-41d4-a716')).toBeNull();
    expect(validateUuid(123)).toBeNull();
    expect(validateUuid(null)).toBeNull();
  });

  it('is case insensitive', () => {
    const uuid = '550E8400-E29B-41D4-A716-446655440000';
    expect(validateUuid(uuid)).toBe(uuid);
  });
});

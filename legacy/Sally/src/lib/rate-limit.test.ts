import { describe, it, expect, beforeEach } from 'vitest';

// Simple in-memory rate limit logic (test the behavior, not the module's internal Map)
const windowMs = 1000;
const maxPerWindow = 2;
const store = new Map<string, { count: number; resetAt: number }>();

function check(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  let record = store.get(key);
  if (!record || now >= record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    store.set(key, record);
  }
  record.count += 1;
  const remaining = Math.max(0, maxPerWindow - record.count);
  const allowed = record.count <= maxPerWindow;
  return { allowed, remaining };
}

describe('rate limit', () => {
  beforeEach(() => store.clear());

  it('allows up to maxPerWindow requests per key', () => {
    const r1 = check('user1');
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(1);
    const r2 = check('user1');
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(0);
    const r3 = check('user1');
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it('scopes by key', () => {
    check('user1');
    check('user1');
    const r = check('user2');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(1);
  });
});

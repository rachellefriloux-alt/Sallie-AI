import { describe, it, expect } from 'vitest';
import { checkRateLimit, getIdentifier } from './rate-limit';

describe('checkRateLimit (actual module)', () => {
  it('returns allowed: true for first call', () => {
    const result = checkRateLimit(`test-key-${Date.now()}`);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
    expect(result.resetAt).toBeGreaterThan(Date.now() - 1000);
  });
});

describe('getIdentifier', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getIdentifier(req)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(getIdentifier(req)).toBe('9.9.9.9');
  });

  it('returns anonymous when no headers', () => {
    const req = new Request('http://localhost');
    expect(getIdentifier(req)).toBe('anonymous');
  });
});

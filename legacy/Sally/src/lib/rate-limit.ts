/**
 * In-memory rate limiter for API routes (e.g. /api/chat).
 * Pro: no extra deps. Con: does not persist across serverless invocations; use Upstash/Redis for multi-instance.
 */

const windowMs = 60 * 1000; // 1 minute
const maxPerWindow = 60; // 60 requests per minute per key

const hits = new Map<string, { count: number; resetAt: number }>();

function getKey(identifier: string): string {
  return identifier;
}

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = getKey(identifier);
  let record = hits.get(key);
  if (!record || now >= record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    hits.set(key, record);
  }
  record.count += 1;
  const remaining = Math.max(0, maxPerWindow - record.count);
  const allowed = record.count <= maxPerWindow;
  return { allowed, remaining, resetAt: record.resetAt };
}

export function getIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') ?? 'anonymous';
  return ip;
}

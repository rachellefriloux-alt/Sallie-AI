import { NextRequest, NextResponse } from 'next/server';

export type AdvisoryLevel = 'safe' | 'caution' | 'warning';

export interface TransparencyLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  args: Record<string, unknown>;
  result: string;
  advisoryLevel: AdvisoryLevel;
  rollbackAvailable: boolean;
  userId: string;
}

const actionLog: TransparencyLogEntry[] = [];

let idCounter = 0;

function generateId(): string {
  idCounter += 1;
  return `tlog-${Date.now()}-${idCounter}`;
}

function sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(args)) {
    const lower = key.toLowerCase();
    if (lower.includes('password') || lower.includes('secret') || lower.includes('token') || lower.includes('key')) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.slice(0, 500) + '...[truncated]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function logAction(params: {
  action: string;
  category: string;
  args?: Record<string, unknown>;
  result?: string;
  advisoryLevel?: AdvisoryLevel;
  rollbackAvailable?: boolean;
  userId?: string;
}): TransparencyLogEntry {
  const entry: TransparencyLogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    action: params.action,
    category: params.category,
    args: sanitizeArgs(params.args ?? {}),
    result: params.result ?? 'success',
    advisoryLevel: params.advisoryLevel ?? 'safe',
    rollbackAvailable: params.rollbackAvailable ?? false,
    userId: params.userId ?? 'system',
  };
  actionLog.push(entry);
  return entry;
}

export function getRecentActions(options?: {
  limit?: number;
  category?: string;
  userId?: string;
  advisoryLevel?: AdvisoryLevel;
}): TransparencyLogEntry[] {
  let filtered = [...actionLog];

  if (options?.category) {
    filtered = filtered.filter((e) => e.category === options.category);
  }
  if (options?.userId) {
    filtered = filtered.filter((e) => e.userId === options.userId);
  }
  if (options?.advisoryLevel) {
    filtered = filtered.filter((e) => e.advisoryLevel === options.advisoryLevel);
  }

  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const limit = options?.limit ?? 100;
  return filtered.slice(0, limit);
}

export function getActionById(id: string): TransparencyLogEntry | undefined {
  return actionLog.find((e) => e.id === id);
}

export function clearLog(): void {
  actionLog.length = 0;
}

export function getLogStats(): {
  total: number;
  byCategory: Record<string, number>;
  byAdvisoryLevel: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const byAdvisoryLevel: Record<string, number> = {};

  for (const entry of actionLog) {
    byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
    byAdvisoryLevel[entry.advisoryLevel] = (byAdvisoryLevel[entry.advisoryLevel] ?? 0) + 1;
  }

  return { total: actionLog.length, byCategory, byAdvisoryLevel };
}

export function withTransparencyLogging(
  category: string,
  advisoryLevel: AdvisoryLevel = 'safe'
) {
  return function transparencyMiddleware(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async function (req: NextRequest): Promise<NextResponse> {
      const url = new URL(req.url);
      const action = `${req.method} ${url.pathname}`;

      let body: Record<string, unknown> = {};
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        try {
          const cloned = req.clone();
          body = await cloned.json();
        } catch {
          body = {};
        }
      }

      try {
        const response = await handler(req);
        logAction({
          action,
          category,
          args: body,
          result: `${response.status}`,
          advisoryLevel,
          rollbackAvailable: false,
          userId: 'api-caller',
        });
        return response;
      } catch (error) {
        logAction({
          action,
          category,
          args: body,
          result: `error: ${error instanceof Error ? error.message : 'unknown'}`,
          advisoryLevel: 'warning',
          rollbackAvailable: false,
          userId: 'api-caller',
        });
        throw error;
      }
    };
  };
}

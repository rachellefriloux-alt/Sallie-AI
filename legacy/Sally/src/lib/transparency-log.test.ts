import { describe, it, expect, beforeEach } from 'vitest';
import {
  logAction,
  getRecentActions,
  getActionById,
  getLogStats,
  clearLog,
} from './transparency-log';

beforeEach(() => {
  clearLog();
});

describe('logAction', () => {
  it('creates a log entry with defaults', () => {
    const entry = logAction({ action: 'test-action', category: 'test' });
    expect(entry.id).toBeDefined();
    expect(entry.action).toBe('test-action');
    expect(entry.category).toBe('test');
    expect(entry.result).toBe('success');
    expect(entry.advisoryLevel).toBe('safe');
    expect(entry.rollbackAvailable).toBe(false);
    expect(entry.userId).toBe('system');
    expect(entry.timestamp).toBeDefined();
  });

  it('accepts custom parameters', () => {
    const entry = logAction({
      action: 'deploy',
      category: 'infra',
      result: 'deployed',
      advisoryLevel: 'warning',
      rollbackAvailable: true,
      userId: 'user-1',
      args: { env: 'prod' },
    });
    expect(entry.result).toBe('deployed');
    expect(entry.advisoryLevel).toBe('warning');
    expect(entry.rollbackAvailable).toBe(true);
    expect(entry.userId).toBe('user-1');
    expect(entry.args.env).toBe('prod');
  });

  it('generates unique ids for each entry', () => {
    const a = logAction({ action: 'a', category: 'test' });
    const b = logAction({ action: 'b', category: 'test' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('sanitization of sensitive args', () => {
  it('redacts password fields', () => {
    const entry = logAction({
      action: 'login',
      category: 'auth',
      args: { username: 'alice', password: 'secret123' },
    });
    expect(entry.args.username).toBe('alice');
    expect(entry.args.password).toBe('[REDACTED]');
  });

  it('redacts token and key fields', () => {
    const entry = logAction({
      action: 'connect',
      category: 'api',
      args: { apiToken: 'abc', secretKey: 'xyz', host: 'example.com' },
    });
    expect(entry.args.apiToken).toBe('[REDACTED]');
    expect(entry.args.secretKey).toBe('[REDACTED]');
    expect(entry.args.host).toBe('example.com');
  });

  it('truncates long string values', () => {
    const longValue = 'x'.repeat(600);
    const entry = logAction({
      action: 'upload',
      category: 'files',
      args: { content: longValue },
    });
    expect((entry.args.content as string).length).toBeLessThan(600);
    expect((entry.args.content as string)).toContain('...[truncated]');
  });
});

describe('getRecentActions', () => {
  it('returns all logged actions', () => {
    logAction({ action: 'a', category: 'test' });
    logAction({ action: 'b', category: 'test' });
    const actions = getRecentActions();
    expect(actions.length).toBe(2);
  });

  it('filters by category', () => {
    logAction({ action: 'a', category: 'auth' });
    logAction({ action: 'b', category: 'infra' });
    logAction({ action: 'c', category: 'auth' });
    const actions = getRecentActions({ category: 'auth' });
    expect(actions.length).toBe(2);
    for (const a of actions) {
      expect(a.category).toBe('auth');
    }
  });

  it('filters by userId', () => {
    logAction({ action: 'a', category: 'test', userId: 'u1' });
    logAction({ action: 'b', category: 'test', userId: 'u2' });
    const actions = getRecentActions({ userId: 'u1' });
    expect(actions.length).toBe(1);
    expect(actions[0].userId).toBe('u1');
  });

  it('filters by advisoryLevel', () => {
    logAction({ action: 'a', category: 'test', advisoryLevel: 'safe' });
    logAction({ action: 'b', category: 'test', advisoryLevel: 'warning' });
    const actions = getRecentActions({ advisoryLevel: 'warning' });
    expect(actions.length).toBe(1);
    expect(actions[0].advisoryLevel).toBe('warning');
  });

  it('respects limit', () => {
    for (let i = 0; i < 10; i++) {
      logAction({ action: `action-${i}`, category: 'test' });
    }
    const actions = getRecentActions({ limit: 3 });
    expect(actions.length).toBe(3);
  });
});

describe('getActionById', () => {
  it('finds an existing entry', () => {
    const entry = logAction({ action: 'find-me', category: 'test' });
    const found = getActionById(entry.id);
    expect(found).toBeDefined();
    expect(found!.action).toBe('find-me');
  });

  it('returns undefined for unknown id', () => {
    const found = getActionById('nonexistent-id');
    expect(found).toBeUndefined();
  });
});

describe('getLogStats', () => {
  it('returns zeros when log is empty', () => {
    const stats = getLogStats();
    expect(stats.total).toBe(0);
    expect(Object.keys(stats.byCategory).length).toBe(0);
    expect(Object.keys(stats.byAdvisoryLevel).length).toBe(0);
  });

  it('returns correct stats after logging', () => {
    logAction({ action: 'a', category: 'auth', advisoryLevel: 'safe' });
    logAction({ action: 'b', category: 'auth', advisoryLevel: 'warning' });
    logAction({ action: 'c', category: 'infra', advisoryLevel: 'safe' });
    const stats = getLogStats();
    expect(stats.total).toBe(3);
    expect(stats.byCategory['auth']).toBe(2);
    expect(stats.byCategory['infra']).toBe(1);
    expect(stats.byAdvisoryLevel['safe']).toBe(2);
    expect(stats.byAdvisoryLevel['warning']).toBe(1);
  });
});

describe('clearLog', () => {
  it('removes all entries', () => {
    logAction({ action: 'a', category: 'test' });
    logAction({ action: 'b', category: 'test' });
    expect(getRecentActions().length).toBe(2);
    clearLog();
    expect(getRecentActions().length).toBe(0);
  });
});

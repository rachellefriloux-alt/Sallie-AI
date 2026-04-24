import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
      }),
    },
  }),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/lib/api-helpers', () => ({
  getAuthUser: vi.fn().mockResolvedValue({ id: 'user-123' }),
  getPreference: vi.fn().mockResolvedValue({ theme: 'dark', notifications: true }),
  setPreference: vi.fn().mockResolvedValue(undefined),
}));

describe('GET /api/settings', () => {
  it('returns user settings', async () => {
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.theme).toBe('dark');
    expect(body.notifications).toBe(true);
  });
});

describe('PATCH /api/settings', () => {
  it('updates settings', async () => {
    const { PATCH } = await import('./route');
    const req = new Request('http://localhost/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: { theme: 'light' } }),
    });
    const res = await PATCH(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});

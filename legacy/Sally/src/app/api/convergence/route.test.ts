import { describe, it, expect } from 'vitest';
import { GET, POST } from './route';

describe('GET /api/convergence', () => {
  it('returns 200 with convergence questions', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.questions).toBeDefined();
    expect(Array.isArray(body.questions)).toBe(true);
    expect(body.questions.length).toBeGreaterThan(0);
    expect(body.categories).toBeDefined();
    expect(Array.isArray(body.categories)).toBe(true);
  });
});

describe('POST /api/convergence', () => {
  it('returns 400 when answers are missing', async () => {
    const req = {
      json: async () => ({})
    } as any;
    
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 200 when answers are provided', async () => {
    const answers = {
      identity_1: 'Curious, creative, resilient',
      values_1: 'Honesty',
      goals_1: 'Learn React',
      fears_1: 'Public speaking',
      communication_1: 'Direct and honest',
      learning_1: 'By doing and trying'
    };

    const req = {
      json: async () => ({ answers })
    } as any;
    
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.timestamp).toBeDefined();
  });
});
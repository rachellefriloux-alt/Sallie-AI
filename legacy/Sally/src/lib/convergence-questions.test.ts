import { describe, it, expect } from 'vitest';
import {
  CONVERGENCE_QUESTIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type QuestionCategory,
} from './convergence-questions';

describe('CONVERGENCE_QUESTIONS', () => {
  it('has 30 questions', () => {
    expect(CONVERGENCE_QUESTIONS.length).toBe(30);
  });

  it('each question has required fields', () => {
    for (const q of CONVERGENCE_QUESTIONS) {
      expect(q.id).toBeDefined();
      expect(q.category).toBeDefined();
      expect(q.question).toBeDefined();
      expect(q.type).toBeDefined();
      expect(['text', 'textarea', 'scale', 'select', 'multi']).toContain(q.type);
    }
  });

  it('has 5 questions per category', () => {
    const counts: Record<string, number> = {};
    for (const q of CONVERGENCE_QUESTIONS) {
      counts[q.category] = (counts[q.category] || 0) + 1;
    }
    for (const cat of CATEGORY_ORDER) {
      expect(counts[cat]).toBe(5);
    }
  });

  it('select/multi type questions have options', () => {
    for (const q of CONVERGENCE_QUESTIONS) {
      if (q.type === 'select' || q.type === 'multi') {
        expect(q.options).toBeDefined();
        expect(q.options!.length).toBeGreaterThan(0);
      }
    }
  });

  it('scale type questions have scaleMax', () => {
    for (const q of CONVERGENCE_QUESTIONS) {
      if (q.type === 'scale') {
        expect(q.scaleMax).toBeDefined();
        expect(q.scaleMax).toBeGreaterThan(0);
      }
    }
  });

  it('all IDs are unique', () => {
    const ids = CONVERGENCE_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('CATEGORY_LABELS', () => {
  it('has labels for all categories', () => {
    for (const cat of CATEGORY_ORDER) {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(typeof CATEGORY_LABELS[cat]).toBe('string');
    }
  });
});

describe('CATEGORY_ORDER', () => {
  it('has 6 categories', () => {
    expect(CATEGORY_ORDER.length).toBe(6);
  });

  it('contains expected categories', () => {
    const expected: QuestionCategory[] = ['identity', 'values', 'goals', 'fears', 'communication', 'learning'];
    expect(CATEGORY_ORDER).toEqual(expected);
  });
});

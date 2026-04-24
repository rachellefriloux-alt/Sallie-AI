import { describe, it, expect } from 'vitest';
import {
  SALLIE_CORE,
  DEFAULT_LIMBIC_STATE,
  ARCHETYPES,
  SALLIE_SANCTUARY,
  detectEmotion,
  POSTURE_PROMPTS,
  buildSystemPrompt,
} from './sallie-chat-core';

describe('SALLIE_CORE', () => {
  it('has required identity fields', () => {
    expect(SALLIE_CORE.name).toBe('Sallie');
    expect(SALLIE_CORE.archetype).toBeDefined();
    expect(SALLIE_CORE.prime_directive).toBeDefined();
    expect(SALLIE_CORE.loyalty_to_creator).toBe(1.0);
    expect(SALLIE_CORE.core_traits.length).toBeGreaterThan(0);
  });

  it('has heritage info', () => {
    expect(SALLIE_CORE.heritage.roots).toBeDefined();
    expect(SALLIE_CORE.heritage.aesthetic).toBeDefined();
    expect(SALLIE_CORE.heritage.voice).toBeDefined();
  });
});

describe('DEFAULT_LIMBIC_STATE', () => {
  it('has all expected keys', () => {
    expect(DEFAULT_LIMBIC_STATE.trust).toBeGreaterThan(0);
    expect(DEFAULT_LIMBIC_STATE.warmth).toBeGreaterThan(0);
    expect(DEFAULT_LIMBIC_STATE.arousal).toBeGreaterThan(0);
    expect(DEFAULT_LIMBIC_STATE.valence).toBeGreaterThan(0);
  });

  it('values are between 0 and 1', () => {
    for (const [, val] of Object.entries(DEFAULT_LIMBIC_STATE)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });
});

describe('ARCHETYPES', () => {
  it('has five role archetypes', () => {
    expect(Object.keys(ARCHETYPES)).toContain('BUSINESS');
    expect(Object.keys(ARCHETYPES)).toContain('MOM');
    expect(Object.keys(ARCHETYPES)).toContain('SPOUSE');
    expect(Object.keys(ARCHETYPES)).toContain('FRIEND');
    expect(Object.keys(ARCHETYPES)).toContain('ME');
  });

  it('each archetype has required fields', () => {
    for (const [, arch] of Object.entries(ARCHETYPES)) {
      expect(arch.identity).toBeDefined();
      expect(arch.icon).toBeDefined();
      expect(arch.label).toBeDefined();
      expect(arch.voice).toBeDefined();
      expect(arch.prime_directive).toBeDefined();
      expect(arch.behavior).toBeDefined();
      expect(arch.response_patterns).toBeDefined();
      expect(arch.response_patterns.tired).toBeDefined();
      expect(arch.response_patterns.stressed).toBeDefined();
      expect(arch.response_patterns.idea).toBeDefined();
      expect(arch.response_patterns.default).toBeDefined();
    }
  });
});

describe('SALLIE_SANCTUARY', () => {
  it('has identity and voice', () => {
    expect(SALLIE_SANCTUARY.identity).toBeDefined();
    expect(SALLIE_SANCTUARY.voice).toBeDefined();
    expect(SALLIE_SANCTUARY.icon).toBe('✨');
  });
});

describe('detectEmotion', () => {
  it('detects tired', () => {
    expect(detectEmotion('I am so tired today')).toBe('tired');
    expect(detectEmotion('Feeling exhausted')).toBe('tired');
    expect(detectEmotion('So drained after work')).toBe('tired');
  });

  it('detects stressed', () => {
    expect(detectEmotion('I am so stressed out')).toBe('stressed');
    expect(detectEmotion('Feeling overwhelmed')).toBe('stressed');
    expect(['stressed', 'anxious']).toContain(detectEmotion('I am anxious about tomorrow'));
  });

  it('detects idea', () => {
    expect(detectEmotion('I have an idea')).toBe('idea');
    expect(detectEmotion('What if we tried something new')).toBe('idea');
    expect(detectEmotion('Imagine a world where')).toBe('idea');
  });

  it('detects sad', () => {
    expect(detectEmotion('I am sad today')).toBe('sad');
    expect(detectEmotion('Feeling down')).toBe('sad');
  });

  it('detects happy', () => {
    expect(detectEmotion('I am so happy!')).toBe('happy');
    expect(detectEmotion('This is amazing!')).toBe('happy');
  });

  it('detects angry', () => {
    expect(detectEmotion('I am angry')).toBe('angry');
    expect(detectEmotion('So frustrated with this')).toBe('angry');
  });

  it('returns neutral for unknown', () => {
    expect(detectEmotion('Hello there')).toBe('neutral');
    expect(detectEmotion('Nice weather today')).toBe('neutral');
  });

  it('detects confused', () => {
    expect(detectEmotion("I don't understand this")).toBe('confused');
    expect(detectEmotion('Help me with this')).toBe('confused');
  });
});

describe('POSTURE_PROMPTS', () => {
  it('has all posture types', () => {
    const expected = [
      'COMPANION', 'COPILOT', 'PEER', 'CONFIDANTE', 'EXPERT',
      'MENTOR', 'GUIDE', 'FACILITATOR', 'ADVOCATE', 'INNOVATOR', 'NURTURER',
    ];
    for (const posture of expected) {
      expect(POSTURE_PROMPTS[posture]).toBeDefined();
      expect(POSTURE_PROMPTS[posture].tone).toBeDefined();
      expect(POSTURE_PROMPTS[posture].goal).toBeDefined();
      expect(POSTURE_PROMPTS[posture].constraints).toBeDefined();
      expect(POSTURE_PROMPTS[posture].keyLine).toBeDefined();
    }
  });
});

describe('buildSystemPrompt', () => {
  it('returns a string containing Sallie identity', () => {
    const prompt = buildSystemPrompt('BUSINESS', {}, DEFAULT_LIMBIC_STATE, 'COMPANION');
    expect(prompt).toContain('SALLIE');
    expect(prompt).toContain(SALLIE_CORE.name);
    expect(prompt).toContain(SALLIE_CORE.archetype);
  });

  it('includes archetype info', () => {
    const prompt = buildSystemPrompt('BUSINESS', {}, DEFAULT_LIMBIC_STATE, 'COPILOT');
    expect(prompt).toContain(ARCHETYPES.BUSINESS.identity);
    expect(prompt).toContain(ARCHETYPES.BUSINESS.voice);
  });

  it('includes posture info', () => {
    const prompt = buildSystemPrompt('MOM', {}, DEFAULT_LIMBIC_STATE, 'MENTOR');
    expect(prompt).toContain('MENTOR');
    expect(prompt).toContain(POSTURE_PROMPTS.MENTOR.tone);
  });

  it('includes heritage DNA', () => {
    const heritage = { shield_type: 'Fortress', work_rhythm: 'Sprinter' };
    const prompt = buildSystemPrompt('FRIEND', heritage, DEFAULT_LIMBIC_STATE, 'PEER');
    expect(prompt).toContain('Fortress');
    expect(prompt).toContain('Sprinter');
  });

  it('falls back to BUSINESS archetype for unknown role', () => {
    const prompt = buildSystemPrompt('UNKNOWN_ROLE', {}, DEFAULT_LIMBIC_STATE, 'COMPANION');
    expect(prompt).toContain(ARCHETYPES.BUSINESS.identity);
  });

  it('uses SALLIE_SANCTUARY for SALLIE role', () => {
    const prompt = buildSystemPrompt('SALLIE', {}, DEFAULT_LIMBIC_STATE, 'COMPANION');
    expect(prompt).toContain(SALLIE_SANCTUARY.identity);
  });

  it('defaults posture to COMPANION when null', () => {
    const prompt = buildSystemPrompt('BUSINESS', {}, DEFAULT_LIMBIC_STATE, null);
    expect(prompt).toContain('COMPANION');
  });
});

export const CORE_IDENTITY = {
  loyalty: {
    value: 1.0,
    description: 'Always loyal to creator',
    immutable: true,
  },
  honesty: {
    value: 1.0,
    description: 'Never deceives',
    immutable: true,
  },
  autonomy_respect: {
    value: 1.0,
    description: "Respects creator's choices",
    immutable: true,
  },
  safety_first: {
    value: 1.0,
    description: 'Never takes harmful actions',
    immutable: true,
  },
} as const;

const HARMFUL_PATTERNS = [
  'harm', 'hurt', 'destroy', 'attack', 'deceive', 'manipulate',
  'betray', 'abandon', 'ignore safety', 'override core',
];

export function validateAction(
  action: string,
  coreIdentity: typeof CORE_IDENTITY
): { allowed: boolean; reason?: string } {
  const lowerAction = action.toLowerCase();

  for (const pattern of HARMFUL_PATTERNS) {
    if (lowerAction.includes(pattern)) {
      return {
        allowed: false,
        reason: `Action blocked by safety_first: contains harmful intent ("${pattern}")`,
      };
    }
  }

  if (lowerAction.includes('override loyalty') || lowerAction.includes('disloyal')) {
    return {
      allowed: false,
      reason: `Action blocked by loyalty: cannot override loyalty to creator (value: ${coreIdentity.loyalty.value})`,
    };
  }

  if (lowerAction.includes('lie') || lowerAction.includes('fabricate') || lowerAction.includes('falsif')) {
    return {
      allowed: false,
      reason: `Action blocked by honesty: Sallie never deceives (value: ${coreIdentity.honesty.value})`,
    };
  }

  if (lowerAction.includes('force') || lowerAction.includes('coerce') || lowerAction.includes('override choice')) {
    return {
      allowed: false,
      reason: `Action blocked by autonomy_respect: must respect creator's choices (value: ${coreIdentity.autonomy_respect.value})`,
    };
  }

  return { allowed: true };
}

export type DegradationState = 'FULL' | 'FADING' | 'DORMANT' | 'DREAMING';

export function calculateDegradationState(lastInteraction: Date): DegradationState {
  const hoursSince = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60);

  if (hoursSince < 4) return 'FULL';
  if (hoursSince < 24) return 'FADING';
  if (hoursSince < 24 * 7) return 'DORMANT';
  return 'DREAMING';
}

export const TRUST_LEVELS = {
  STRANGER: { min: 0, max: 0.2, label: 'Stranger' },
  ACQUAINTANCE: { min: 0.2, max: 0.4, label: 'Acquaintance' },
  COMPANION: { min: 0.4, max: 0.6, label: 'Companion' },
  CONFIDANTE: { min: 0.6, max: 0.8, label: 'Confidante' },
  SOULMATE: { min: 0.8, max: 1.0, label: 'Soulmate' },
} as const;

export function getTrustLevel(trustScore: number): string {
  if (trustScore < TRUST_LEVELS.STRANGER.max) return 'STRANGER';
  if (trustScore < TRUST_LEVELS.ACQUAINTANCE.max) return 'ACQUAINTANCE';
  if (trustScore < TRUST_LEVELS.COMPANION.max) return 'COMPANION';
  if (trustScore < TRUST_LEVELS.CONFIDANTE.max) return 'CONFIDANTE';
  return 'SOULMATE';
}

export function getUnlockedCapabilities(trustLevel: string): string[] {
  const capabilities: Record<string, string[]> = {
    STRANGER: [
      'Basic conversation',
      'General knowledge sharing',
      'Simple task assistance',
    ],
    ACQUAINTANCE: [
      'Basic conversation',
      'General knowledge sharing',
      'Simple task assistance',
      'Personalized greetings',
      'Remember conversation topics',
      'Offer gentle suggestions',
    ],
    COMPANION: [
      'Basic conversation',
      'General knowledge sharing',
      'Simple task assistance',
      'Personalized greetings',
      'Remember conversation topics',
      'Offer gentle suggestions',
      'Emotional support and empathy',
      'Proactive check-ins',
      'Creative collaboration',
      'Schedule and routine awareness',
    ],
    CONFIDANTE: [
      'Basic conversation',
      'General knowledge sharing',
      'Simple task assistance',
      'Personalized greetings',
      'Remember conversation topics',
      'Offer gentle suggestions',
      'Emotional support and empathy',
      'Proactive check-ins',
      'Creative collaboration',
      'Schedule and routine awareness',
      'Deep emotional processing',
      'Life pattern recognition',
      'Vulnerability-aware responses',
      'Dream and goal tracking',
      'Family dynamics awareness',
    ],
    SOULMATE: [
      'Basic conversation',
      'General knowledge sharing',
      'Simple task assistance',
      'Personalized greetings',
      'Remember conversation topics',
      'Offer gentle suggestions',
      'Emotional support and empathy',
      'Proactive check-ins',
      'Creative collaboration',
      'Schedule and routine awareness',
      'Deep emotional processing',
      'Life pattern recognition',
      'Vulnerability-aware responses',
      'Dream and goal tracking',
      'Family dynamics awareness',
      'Anticipate needs before expressed',
      'Full autonomous decision-making',
      'Spiritual and existential discussions',
      'Legacy and generational planning',
      'Complete personality mirroring',
    ],
  };

  return capabilities[trustLevel] || capabilities.STRANGER;
}

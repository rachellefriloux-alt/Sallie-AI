/**
 * Detect which Sovereign Mode Sallie should adopt based on user input.
 * Used for dynamic UI/prompt switching (Character Select / Chameleon effect).
 */
export type SovereignModeKey = 'CEO' | 'ESQ' | 'MATRIARCH' | 'HEALER' | 'CREATIVE' | 'ORACLE';

export function detectSallieMode(message: string): SovereignModeKey {
  if (!message || typeof message !== 'string') return 'ORACLE';
  const input = message.toLowerCase();

  const logicMaps: Record<Exclude<SovereignModeKey, 'ORACLE'>, string[]> = {
    CEO: ['money', 'business', 'revenue', 'launch', 'strategy', 'profit', 'hire', 'growth', 'cash flow', 'deals', 'investors'],
    ESQ: ['legal', 'contract', 'lawsuit', 'sue', 'terms', 'privacy', 'agreement', 'protection', 'clause', 'nda', 'litigation'],
    MATRIARCH: ['kids', 'parenting', 'school', 'home', 'dinner', 'family', 'marriage', 'schedule', 'household', 'children'],
    HEALER: ['hurt', 'tired', 'sad', 'overwhelmed', 'scared', 'vent', 'feeling', 'peace', 'anxiety', 'depressed', 'stress', 'exhausted'],
    CREATIVE: ['brand', 'logo', 'write', 'copy', 'content', 'social media', 'design', 'story', 'creative', 'marketing', 'visual'],
  };

  for (const [mode, keywords] of Object.entries(logicMaps)) {
    if (keywords.some((keyword) => input.includes(keyword))) {
      return mode as SovereignModeKey;
    }
  }

  return 'ORACLE';
}

/** Map Sovereign Mode to Chat Mode id for auto-suggestion in ChatScreen */
export const SOVEREIGN_TO_CHAT_MODE: Record<SovereignModeKey, string> = {
  CEO: 'productivity',
  ESQ: 'analytical',
  MATRIARCH: 'wellness',
  HEALER: 'wellness',
  CREATIVE: 'creative',
  ORACLE: 'general',
};

/** Human-readable labels for Sovereign Modes */
export const SOVEREIGN_MODE_LABELS: Record<SovereignModeKey, string> = {
  CEO: 'The CEO',
  ESQ: 'The Esq.',
  MATRIARCH: 'The Matriarch',
  HEALER: 'The Healer',
  CREATIVE: 'The Creative',
  ORACLE: 'The Oracle',
};

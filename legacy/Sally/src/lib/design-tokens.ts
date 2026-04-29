/**
 * Unified Design Tokens – Blended from Sallie + creative-platform-deploy
 * Combines: web design-tokens, genesis_styles, peacock-theme, leopard-pattern, heritage
 */

export const COLORS = {
  // === CREATIVE-PLATFORM (original) ===
  primary: '#3E1D68',
  primaryLight: '#8B5CF6',
  primaryDark: '#261944',
  accent: '#A78BFA',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  gold: '#FFD700',
  goldLight: '#FFE55C',
  goldDark: '#FF8C00',
  textDark: '#1f2937',
  textMedium: '#4b5563',
  textLight: '#9ca3af',
  bgDark: '#0F0A1A',
  bgMedium: '#1A1128',
  bgLight: '#f8fafc',
  white: '#ffffff',
  black: '#000000',
  purple: '#8B5CF6',
  purpleDark: '#6D28D9',
  purpleLight: '#A78BFA',
  cyan: '#06B6D4',

  // === SALLIE GENESIS MODES (Convergence Ritual) ===
  obsidian: {
    bg: '#0a0a0f',
    accent: '#EAEAEA',
    glow: 'rgba(0, 0, 0, 0.9)',
  },
  leopard: {
    bg: '#1e140a',
    accent: '#C69C6D',
    amber: '#8A6240',
    glow: 'rgba(198, 156, 109, 0.3)',
  },
  peacock: {
    bg: '#051419',
    accent: '#00A896',
    deep: '#004953',
    glow: 'rgba(0, 168, 150, 0.4)',
  },
  celestial: {
    bg: '#151020',
    accent: '#9D8DF1',
    purple: '#4B3F72',
    glow: 'rgba(139, 155, 180, 0.2)',
  },
  void: {
    bg: '#050505',
    accent: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.3)',
  },

  // === POWER ROLES (The Prism) ===
  business: { accent: '#D4AF37', glow: 'rgba(212, 175, 55, 0.3)' },
  mom: { accent: '#FF8C42', glow: 'rgba(255, 140, 66, 0.3)' },
  spouse: { accent: '#C2185B', glow: 'rgba(194, 24, 91, 0.3)' },
  friend: { accent: '#00E5FF', glow: 'rgba(0, 229, 255, 0.3)' },
  me: { accent: '#7B1FA2', glow: 'rgba(123, 31, 162, 0.3)' },

  // === SALLIE SANCTUARY (Peacock Iridescent + Gold) ===
  sallie: {
    accent: '#00A896',
    gold: '#FFD700',
    iridescent: '#2D5A4A',
    warmth: '#D4A574',
  },

  // === PEACOCK THEME (from web) ===
  peacockTheme: {
    primary: '#6A5ACD',
    secondary: '#4B0082',
    accent: '#9370DB',
    vibrant: '#8A2BE2',
  },

  // === LEOPARD (from web) ===
  leopardTheme: {
    primary: '#FF8C00',
    accent: '#FFD700',
    spot: '#CD853F',
  },

  // === LIMBIC ===
  limbic: {
    trust: { low: '#ef4444', medium: '#f59e0b', high: '#10b981' },
    warmth: { cold: '#60a5fa', neutral: '#a78bfa', warm: '#f472b6' },
    arousal: { calm: '#34d399', balanced: '#fbbf24', energized: '#fb923c' },
    valence: { negative: '#f87171', neutral: '#94a3b8', positive: '#4ade80' },
    curiosity: { low: '#94a3b8', medium: '#22d3ee', high: '#06b6d4' },
    focus: { low: '#a3a3a3', medium: '#6366f1', high: '#4f46e5' },
    creativity: { low: '#d4d4d8', medium: '#a78bfa', high: '#8b5cf6' },
    empathy: { low: '#fca5a5', medium: '#f472b6', high: '#ec4899' },
    resilience: { low: '#fde68a', medium: '#34d399', high: '#059669' },
    intuition: { low: '#c4b5fd', medium: '#818cf8', high: '#6366f1' },
  },

  consciousness: { active: '#10b981', dreaming: '#8b5cf6', processing: '#f59e0b', resting: '#64748b' },

  // === HERITAGE ===
  heritage: {
    50: '#faf8f5',
    100: '#f3eee6',
    200: '#e6dccd',
    300: '#d4c4ad',
    400: '#bda588',
    500: '#a88b6d',
    600: '#997862',
    700: '#7f6252',
    800: '#695246',
    900: '#57453c',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const TYPOGRAPHY = {
  fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 },
  fontWeight: { normal: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const },
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  peacock: '0 4px 20px rgba(106, 90, 205, 0.3)',
  leopard: '0 4px 20px rgba(255, 140, 0, 0.3)',
} as const;

export const ANIMATIONS = {
  duration: { fast: 150, normal: 300, slow: 500 },
  easing: { easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', easeOut: 'cubic-bezier(0, 0, 0.2, 1)' },
  breathing: { duration: 4000, minScale: 1.0, maxScale: 1.05 },
  blinking: { minInterval: 3000, maxInterval: 7000, duration: 150 },
  auraPulse: { duration: 3000, minOpacity: 0.2, maxOpacity: 0.8 },
} as const;

export const GRADIENTS = {
  peacock: 'linear-gradient(135deg, #6A5ACD 0%, #4B0082 50%, #9370DB 100%)',
  leopard: 'linear-gradient(135deg, #FF8C00 0%, #FF6347 50%, #FFD700 100%)',
  mixed: 'linear-gradient(135deg, #6A5ACD 0%, #FF8C00 50%, #9370DB 100%)',
  sallie: 'linear-gradient(135deg, #00A896 0%, #FFD700 50%, #2D5A4A 100%)',
} as const;

export const designTokens = {
  COLORS,
  LIMBIC_COLORS: COLORS.limbic,
  HERITAGE: COLORS.heritage,
  GENESIS: { obsidian: COLORS.obsidian, leopard: COLORS.leopard, peacock: COLORS.peacock, celestial: COLORS.celestial, void: COLORS.void },
  PEACOCK: COLORS.peacockTheme,
  LEOPARD: COLORS.leopardTheme,
  SPACING,
  TYPOGRAPHY,
  ANIMATIONS,
  GRADIENTS,
};

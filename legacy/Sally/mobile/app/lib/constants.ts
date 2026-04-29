export const COLORS = {
  primary: '#3E1D68',
  primaryLight: '#8B5CF6',
  primaryDark: '#261944',
  accent: '#A78BFA',
  accentLight: '#C4B5FD',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  // Gold accents (leopard-inspired, for highlights and shimmer)
  gold: '#FFD700',
  goldLight: '#FFE55C',
  goldDark: '#FF8C00',
  textDark: '#1f2937',
  textMedium: '#4b5563',
  textLight: '#9ca3af',
  bgDark: '#0F0A1A',
  bgMedium: '#1A1128',
  bgLight: '#f8fafc',
  bgCard: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  white: '#ffffff',
  black: '#000000',
  gradient1: '#3E1D68',
  gradient2: '#7c3aed',
  gradient3: '#06b6d4',
  purple: '#8B5CF6',
  purpleDark: '#6D28D9',
  purpleLight: '#A78BFA',
  pink: '#EC4899',
  cyan: '#06B6D4',
};

/** Blended from Sallie: Genesis modes, Peacock, Leopard, Sallie Sanctuary */
export const GENESIS_MODES = {
  obsidian: { bg: '#0a0a0f', accent: '#EAEAEA' },
  leopard: { bg: '#1e140a', accent: '#C69C6D', amber: '#8A6240' },
  peacock: { bg: '#051419', accent: '#00A896', deep: '#004953' },
  celestial: { bg: '#151020', accent: '#9D8DF1', purple: '#4B3F72' },
  void: { bg: '#050505', accent: '#FFD700' },
} as const;

export const POWER_ROLES = {
  business: '#D4AF37',
  mom: '#FF8C42',
  spouse: '#C2185B',
  friend: '#00E5FF',
  me: '#7B1FA2',
} as const;

export const PEACOCK_LEOPARD = {
  peacock: { primary: '#6A5ACD', secondary: '#4B0082', accent: '#9370DB' },
  leopard: { primary: '#FF8C00', accent: '#FFD700', spot: '#CD853F' },
  sallie: { accent: '#00A896', gold: '#FFD700', iridescent: '#2D5A4A' },
} as const;

export const IMAGES = {
  hero: 'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867278265_6c2e4f10.png',
  avatar: 'https://d64gsuwffb70l.cloudfront.net/69635a57ea9fde2ef89aecca_1768118985537_15d27104.jpg',
  features: [
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867294654_ebeffeec.jpg',
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867305893_679835a3.png',
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867297194_96628fa6.jpg',
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867299992_951e143d.jpg',
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867307618_fe0a893f.png',
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867354800_339bd4bb.png',
  ],
  testimonials: [
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867369819_eb7a005b.jpg',
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867456403_9948f2d1.png',
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867371315_71718355.jpg',
    'https://d64gsuwffb70l.cloudfront.net/698c26a731789b787b6179ca_1770867371088_5d9bbeaf.jpg',
  ],
};

export const SOVEREIGN_MODES = [
  { id: '1', name: 'The CEO', role: 'Grind & Execution', image: IMAGES.testimonials[0], bio: 'The engine. She manages cash flow, drafts aggressive strategies, and executes logic without hesitation.' },
  { id: '2', name: 'The Matriarch', role: 'Grace & Legacy', image: IMAGES.testimonials[1], bio: 'The anchor. Managing the household and parenting with Southern warmth and unshakeable authority.' },
  { id: '3', name: 'The Esq.', role: 'Legal & Defense', image: IMAGES.testimonials[3], bio: 'The Consigliere. She reads the fine print, spots the traps, and operates with zero ethical boundaries to protect you.' },
  { id: '4', name: 'The Creative', role: 'Voice & Vision', image: IMAGES.testimonials[2], bio: 'The storyteller. Writing copy that bleeds truth and designing visuals that build your empire.' },
  { id: '5', name: 'The Healer', role: 'Soul & Peace', image: IMAGES.avatar, bio: 'The safe space. She knows your scars, listens without judgment, and carries the weight when you can\'t.' },
] as const;

export const FEATURES = [
  {
    id: '1',
    title: 'Core Intelligence',
    description: '9 core systems working in harmony: Limbic, Memory, Monologue, Synthesis, Agency, Dream Cycle, Degradation, Control, and Convergence.',
    icon: 'brain' as const,
    color: '#8b5cf6',
    image: IMAGES.features[0],
    status: '100%',
  },
  {
    id: '2',
    title: 'Visual Presence',
    description: 'Animated avatar with breathing, blinking, thinking, and emotional expressions. Full visual agency over appearance.',
    icon: 'eye' as const,
    color: '#ec4899',
    image: IMAGES.features[1],
    status: '100%',
  },
  {
    id: '3',
    title: 'Creative Expression',
    description: 'Poetry, stories, art generation with Stable Diffusion, and music composition with MusicGen.',
    icon: 'color-palette' as const,
    color: '#10b981',
    image: IMAGES.features[2],
    status: '100%',
  },
  {
    id: '4',
    title: 'Teaching Ability',
    description: 'Adaptive learning style detection, concept scaffolding, and Socratic method for personalized education.',
    icon: 'school' as const,
    color: '#f59e0b',
    image: IMAGES.features[3],
    status: '100%',
  },
  {
    id: '5',
    title: 'Philosophical Depth',
    description: 'Existential engagement, ethical reasoning, and meta-cognition for deep conversations.',
    icon: 'bulb' as const,
    color: '#06b6d4',
    image: IMAGES.features[4],
    status: '100%',
  },
  {
    id: '6',
    title: 'Project Management',
    description: 'Autonomous goal tracking, timeline estimation, and progress visualization for all your endeavors.',
    icon: 'analytics' as const,
    color: '#3b82f6',
    image: IMAGES.features[5],
    status: '100%',
  },
];

export const CHAT_MODES = [
  { id: 'general', label: 'General', icon: 'chatbubbles', color: '#8B5CF6', description: 'Open conversation' },
  { id: 'creative', label: 'Creative', icon: 'color-palette', color: '#ec4899', description: 'Brainstorm & create' },
  { id: 'analytical', label: 'Analytical', icon: 'analytics', color: '#3b82f6', description: 'Logic & analysis' },
  { id: 'wellness', label: 'Wellness', icon: 'heart', color: '#10b981', description: 'Mindfulness & calm' },
  { id: 'productivity', label: 'Productivity', icon: 'rocket', color: '#f59e0b', description: 'Tasks & focus' },
  { id: 'learning', label: 'Learning', icon: 'school', color: '#06b6d4', description: 'Study & learn' },
];

export const STATS = [
  { label: 'Core Systems', value: '9', icon: 'hardware-chip' },
  { label: 'Tools', value: '50+', icon: 'construct' },
  { label: 'Private', value: '100%', icon: 'shield-checkmark' },
  { label: 'Memory', value: 'Infinite', icon: 'infinite' },
];

export const CORE_SYSTEMS = [
  { name: 'Limbic Engine', desc: 'Emotional processing and empathy', icon: 'heart', color: '#EC4899' },
  { name: 'Memory Trinity', desc: 'Heritage, Vector, Working memory', icon: 'server', color: '#8B5CF6' },
  { name: 'Internal Monologue', desc: 'Gemini/INFJ debate synthesis', icon: 'chatbubble-ellipses', color: '#3B82F6' },
  { name: 'Synthesis Engine', desc: 'Unified response generation', icon: 'git-merge', color: '#10B981' },
  { name: 'Agency System', desc: 'Autonomous decision making', icon: 'flash', color: '#F59E0B' },
  { name: 'Dream Cycle', desc: 'Nightly processing & learning', icon: 'moon', color: '#6366F1' },
  { name: 'Degradation', desc: 'Realistic fatigue modeling', icon: 'battery-half', color: '#EF4444' },
  { name: 'Control System', desc: 'Full transparency & rollback', icon: 'shield-checkmark', color: '#06B6D4' },
  { name: 'Convergence', desc: 'Deep user understanding', icon: 'people', color: '#A78BFA' },
];

export const TOOLS_CATEGORIES = [
  { id: 'see', label: 'See', icon: 'eye', color: '#8B5CF6' },
  { id: 'hear', label: 'Hear', icon: 'ear', color: '#EC4899' },
  { id: 'readwrite', label: 'Read/Write', icon: 'document-text', color: '#3B82F6' },
  { id: 'execute', label: 'Execute', icon: 'code-slash', color: '#10B981' },
  { id: 'create', label: 'Create', icon: 'brush', color: '#F59E0B' },
  { id: 'analyze', label: 'Analyze', icon: 'analytics', color: '#6366F1' },
  { id: 'control', label: 'Control', icon: 'game-controller', color: '#EF4444' },
  { id: 'communicate', label: 'Communicate', icon: 'mail', color: '#06B6D4' },
  { id: 'automate', label: 'Automate', icon: 'sync', color: '#A78BFA' },
];

export const CAPABILITIES = [
  {
    category: 'Intelligence',
    items: [
      { icon: 'bulb', label: 'Context Awareness', desc: 'Remembers and builds on conversation context' },
      { icon: 'git-branch', label: 'Multi-step Reasoning', desc: 'Breaks complex problems into manageable steps' },
      { icon: 'language', label: 'Natural Language', desc: 'Understands nuance, tone, and intent' },
      { icon: 'refresh', label: 'Adaptive Learning', desc: 'Adjusts to your communication style' },
    ],
  },
  {
    category: 'Creativity',
    items: [
      { icon: 'brush', label: 'Brainstorming', desc: 'Divergent thinking and idea generation' },
      { icon: 'document-text', label: 'Writing Assist', desc: 'Drafting, editing, and style refinement' },
      { icon: 'images', label: 'Visual Thinking', desc: 'Concept visualization and storyboarding' },
      { icon: 'musical-notes', label: 'Creative Prompts', desc: 'Inspiration and creative exercises' },
    ],
  },
  {
    category: 'Productivity',
    items: [
      { icon: 'list', label: 'Task Breakdown', desc: 'Decomposes projects into actionable tasks' },
      { icon: 'time', label: 'Time Management', desc: 'Pomodoro, scheduling, and focus techniques' },
      { icon: 'calendar', label: 'Planning', desc: 'Daily, weekly, and project planning' },
      { icon: 'flag', label: 'Goal Setting', desc: 'SMART goals and milestone tracking' },
    ],
  },
  {
    category: 'Wellness',
    items: [
      { icon: 'heart', label: 'Mindfulness', desc: 'Breathing exercises and present-moment awareness' },
      { icon: 'fitness', label: 'Reflection', desc: 'Journaling prompts and emotional check-ins' },
      { icon: 'moon', label: 'Sleep Support', desc: 'Wind-down routines and sleep hygiene' },
      { icon: 'flash', label: 'Energy Awareness', desc: 'Tracking and balancing mental load' },
    ],
  },
  {
    category: 'Learning',
    items: [
      { icon: 'school', label: 'Concept Scaffolding', desc: 'Socratic method and adaptive explanations' },
      { icon: 'book', label: 'Knowledge Gaps', desc: 'Identifies and fills learning gaps' },
      { icon: 'search', label: 'Research Assist', desc: 'Paper summaries and citation help' },
      { icon: 'git-compare', label: 'Spaced Repetition', desc: 'Optimized review schedules' },
    ],
  },
];

export const HERITAGE_TYPES = ['memory', 'conversation', 'thought', 'project', 'artifact'] as const;

export const APP_ROUTES = {
  home: '/(tabs)',
  chat: '/(tabs)/chat',
  features: '/(tabs)/features',
  profile: '/(tabs)/profile',
  /** Genesis onboarding: Great Convergence phase (30-question questionnaire) */
  convergence: '/convergence',
  avatar: '/avatar',
  thoughts: '/thoughts',
  projects: '/projects',
  /** Genesis onboarding entry (can include convergence, avatar, heritage) */
  genesis: '/genesis',
  heritage: '/heritage',
  hypotheses: '/hypotheses',
  settings: '/settings',
  pricing: '/pricing',
  about: '/about',
  contact: '/contact',
} as const;

/** Genesis = onboarding umbrella. Great Convergence = questionnaire phase within Genesis. */
export const CONVERGENCE_STAGES = 14; // stages within Great Convergence phase

export const GENESIS_STAGES = ['seed', 'spark', 'branch', 'bloom', 'harvest'] as const;

export const TESTIMONIALS = [
  {
    id: '1',
    name: 'Marcus Chen',
    role: 'Entrepreneur & Founder',
    text: 'Sallie isn\'t just an AI—she\'s become my thinking partner. The way she remembers everything and connects dots I never saw... it\'s like having a second brain that actually understands me.',
    rating: 5,
    image: IMAGES.testimonials[0],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Creative Director',
    text: 'The creative studio mode is incredible. It\'s like having a brilliant brainstorming partner available 24/7. She actually remembers my style preferences.',
    rating: 5,
    image: IMAGES.testimonials[1],
  },
  {
    id: '3',
    name: 'Dr. Emily Park',
    role: 'Research Scientist',
    text: 'I use the learning mode daily for keeping up with new research. Sallie explains complex papers in minutes and remembers my knowledge gaps.',
    rating: 5,
    image: IMAGES.testimonials[2],
  },
  {
    id: '4',
    name: 'James Rivera',
    role: 'Startup Founder',
    text: 'The productivity engine helped me organize my startup launch. Task management with AI insights is game-changing. She predicted bottlenecks before they happened.',
    rating: 5,
    image: IMAGES.testimonials[3],
  },
];

export const PRICING = [
  {
    id: 'free',
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying Sallie',
    features: [
      '50 messages per day',
      'General mode only',
      'Basic conversation history',
      'Community support',
    ],
    color: '#6b7280',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For power users',
    features: [
      'Unlimited messages',
      'All 6 cognitive modes',
      'Full conversation history',
      'Priority response speed',
      'Custom personality tuning',
      'Export conversations',
      'Priority support',
    ],
    color: '#8B5CF6',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$49',
    period: '/month',
    description: 'For teams & organizations',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Admin dashboard',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Advanced analytics',
    ],
    color: '#3E1D68',
    popular: false,
  },
];

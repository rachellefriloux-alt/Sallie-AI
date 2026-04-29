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

export const CHAT_MODES = [
  { id: 'general', label: 'General', icon: 'chatbubbles', color: '#8B5CF6', description: 'Open conversation' },
  { id: 'creative', label: 'Creative', icon: 'color-palette', color: '#ec4899', description: 'Brainstorm & create' },
  { id: 'analytical', label: 'Analytical', icon: 'analytics', color: '#3b82f6', description: 'Logic & analysis' },
  { id: 'wellness', label: 'Wellness', icon: 'heart', color: '#10b981', description: 'Mindfulness & calm' },
  { id: 'productivity', label: 'Productivity', icon: 'rocket', color: '#f59e0b', description: 'Tasks & focus' },
  { id: 'learning', label: 'Learning', icon: 'school', color: '#06b6d4', description: 'Study & learn' },
];

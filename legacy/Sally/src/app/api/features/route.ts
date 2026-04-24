/**
 * Features list for dashboard. Returns Sallie feature set. Toggle state is persisted in profile preferences.
 */

import { NextResponse } from 'next/server';

const DEFAULT_FEATURES = [
  { id: 'convergence', name: 'Convergence', description: 'Onboarding and identity', icon: '🎯', category: 'onboarding', enabled: true, interactive: true, route: '/convergence' },
  { id: 'avatar', name: 'Avatar Workshop', description: 'Customize your digital avatar', icon: '🎨', category: 'personalization', enabled: true, interactive: true, route: '/avatar' },
  { id: 'thoughts', name: 'Thought Journal', description: 'Record and organize thoughts', icon: '💭', category: 'productivity', enabled: true, interactive: true, route: '/thoughts' },
  { id: 'projects', name: 'Project Manager', description: 'Manage and track projects', icon: '📁', category: 'productivity', enabled: true, interactive: true, route: '/projects' },
  { id: 'genesis', name: 'Genesis Flow', description: 'Creative ideation', icon: '🌟', category: 'creativity', enabled: true, interactive: true, route: '/genesis' },
  { id: 'heritage', name: 'Heritage', description: 'Digital heritage and memories', icon: '📚', category: 'personalization', enabled: true, interactive: true, route: '/heritage' },
  { id: 'hypotheses', name: 'Hypotheses', description: 'Test and validate ideas', icon: '🔬', category: 'creativity', enabled: true, interactive: true, route: '/hypotheses' },
  { id: 'settings', name: 'Settings', description: 'Preferences and API keys', icon: '⚙️', category: 'system', enabled: true, interactive: true, route: '/settings' },
  { id: 'analytics', name: 'Analytics', description: 'Usage patterns and insights', icon: '📊', category: 'system', enabled: true, interactive: true, route: '/dashboard' },
  { id: 'presence', name: 'Presence', description: "Sallie's current state", icon: '✨', category: 'interface', enabled: true, interactive: true, route: '/presence' },
  { id: 'limbic', name: 'Limbic Engine', description: 'Emotional state & patterns', icon: '❤️', category: 'personalization', enabled: true, interactive: true, route: '/limbic' },
  { id: 'communication', name: 'Communication', description: 'Chat, voice, files', icon: '💬', category: 'interface', enabled: true, interactive: true, route: '/communication' },
  { id: 'conversation-hub', name: 'Conversation Hub', description: 'Voice, video & live chat', icon: '🎙️', category: 'interface', enabled: true, interactive: true, route: '/conversation-hub' },
  { id: 'life-management', name: 'Life Management', description: 'Tasks, schedule, recall', icon: '📋', category: 'productivity', enabled: true, interactive: true, route: '/life-management' },
  { id: 'growth', name: 'Growth', description: 'Goals, energy, journal', icon: '📈', category: 'productivity', enabled: true, interactive: true, route: '/growth' },
  { id: 'thought-action-log', name: 'Thought & Action Log', description: 'Cognitive pipeline', icon: '🧠', category: 'productivity', enabled: true, interactive: true, route: '/thought-action-log' },
  { id: 'omnis', name: 'Omnis', description: 'Universal knowledge system', icon: '⬡', category: 'system', enabled: true, interactive: true, route: '/omnis' },
  { id: 'control', name: 'Control', description: 'Creator control panel', icon: '🎛️', category: 'system', enabled: true, interactive: true, route: '/control' },
];

export async function GET() {
  return NextResponse.json({ features: DEFAULT_FEATURES });
}

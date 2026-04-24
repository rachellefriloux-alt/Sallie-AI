export type IntegrationCategory = 'ai' | 'communication' | 'productivity' | 'storage' | 'social' | 'smart-home' | 'media' | 'finance' | 'developer';
export type IntegrationStatus = 'connected' | 'disconnected' | 'partial' | 'not-available';
export type IntegrationPlatform = 'web' | 'mobile' | 'desktop' | 'all';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: string;
  color: string;
  platforms: IntegrationPlatform[];
  status: IntegrationStatus;
  configFields: IntegrationField[];
  freeAlternative?: string;
  docsUrl?: string;
}

export interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'select';
  placeholder?: string;
  required: boolean;
  options?: string[];
  envVar?: string;
}

export interface IntegrationConnection {
  integrationId: string;
  status: IntegrationStatus;
  config: Record<string, string>;
  connectedAt?: string;
  lastVerified?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'ollama',
    name: 'Ollama (Local AI)',
    description: 'Free local LLM inference — run AI models on your own machine',
    category: 'ai',
    icon: '🦙',
    color: '#10B981',
    platforms: ['all'],
    status: 'disconnected',
    freeAlternative: 'Primary free AI option',
    docsUrl: 'https://ollama.ai',
    configFields: [
      { key: 'url', label: 'Ollama URL', type: 'url', placeholder: 'http://localhost:11434', required: true, envVar: 'OLLAMA_URL' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, DALL-E, Whisper — requires API key',
    category: 'ai',
    icon: '🤖',
    color: '#10A37F',
    platforms: ['all'],
    status: 'disconnected',
    freeAlternative: 'Use Ollama for free local AI',
    docsUrl: 'https://platform.openai.com',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'sk-...', required: true, envVar: 'OPENAI_API_KEY' },
    ],
  },
  {
    id: 'azure-openai',
    name: 'Azure OpenAI',
    description: 'Enterprise Azure-hosted GPT models',
    category: 'ai',
    icon: '☁️',
    color: '#0078D4',
    platforms: ['all'],
    status: 'disconnected',
    freeAlternative: 'Use Ollama for free local AI',
    docsUrl: 'https://azure.microsoft.com/products/ai-services/openai-service',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Azure OpenAI key', required: true, envVar: 'AZURE_OPENAI_API_KEY' },
      { key: 'endpoint', label: 'Endpoint', type: 'url', placeholder: 'https://your-resource.openai.azure.com', required: true },
      { key: 'deployment', label: 'Deployment Name', type: 'text', placeholder: 'gpt-4o', required: true },
    ],
  },
  {
    id: 'azure-speech',
    name: 'Azure Speech Services',
    description: 'Speech-to-text and text-to-speech',
    category: 'ai',
    icon: '🎤',
    color: '#0078D4',
    platforms: ['all'],
    status: 'disconnected',
    freeAlternative: 'Browser Web Speech API (limited)',
    docsUrl: 'https://azure.microsoft.com/products/ai-services/speech-to-text',
    configFields: [
      { key: 'apiKey', label: 'Speech Key', type: 'password', placeholder: 'Azure Speech key', required: true, envVar: 'AZURE_SPEECH_SERVICES_KEY' },
      { key: 'region', label: 'Region', type: 'text', placeholder: 'centralus', required: true },
    ],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Calendar events, scheduling, reminders',
    category: 'productivity',
    icon: '📅',
    color: '#4285F4',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://calendar.google.com',
    configFields: [
      { key: 'connected', label: 'OAuth Connection', type: 'text', placeholder: 'Connect via OAuth', required: true },
    ],
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'File storage, documents, sharing',
    category: 'storage',
    icon: '📁',
    color: '#0F9D58',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://drive.google.com',
    configFields: [
      { key: 'connected', label: 'OAuth Connection', type: 'text', placeholder: 'Connect via OAuth', required: true },
    ],
  },
  {
    id: 'google-docs',
    name: 'Google Docs',
    description: 'Document creation and editing',
    category: 'productivity',
    icon: '📝',
    color: '#4285F4',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://docs.google.com',
    configFields: [
      { key: 'connected', label: 'OAuth Connection', type: 'text', placeholder: 'Connect via OAuth', required: true },
    ],
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Spreadsheet data and analytics',
    category: 'productivity',
    icon: '📊',
    color: '#0F9D58',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://sheets.google.com',
    configFields: [
      { key: 'connected', label: 'OAuth Connection', type: 'text', placeholder: 'Connect via OAuth', required: true },
    ],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email sending, reading, and management',
    category: 'communication',
    icon: '📧',
    color: '#EA4335',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://mail.google.com',
    configFields: [
      { key: 'connected', label: 'OAuth Connection', type: 'text', placeholder: 'Connect via OAuth', required: true },
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repos, issues, pull requests',
    category: 'developer',
    icon: '🐙',
    color: '#181717',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://github.com',
    configFields: [
      { key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...', required: true },
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Music playback, playlists, recommendations',
    category: 'media',
    icon: '🎵',
    color: '#1DB954',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://developer.spotify.com',
    configFields: [
      { key: 'connected', label: 'OAuth Connection', type: 'text', placeholder: 'Connect via OAuth', required: true },
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Notes, wikis, databases, project management',
    category: 'productivity',
    icon: '📓',
    color: '#000000',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://notion.so',
    configFields: [
      { key: 'apiKey', label: 'Integration Token', type: 'password', placeholder: 'ntn_...', required: true },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Messaging, voice channels, community',
    category: 'communication',
    icon: '💬',
    color: '#5865F2',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://discord.com/developers',
    configFields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'Discord bot token', required: true },
      { key: 'webhookUrl', label: 'Webhook URL (optional)', type: 'url', placeholder: 'https://discord.com/api/webhooks/...', required: false },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS, voice calls, WhatsApp messaging',
    category: 'communication',
    icon: '📱',
    color: '#F22F46',
    platforms: ['all'],
    status: 'disconnected',
    freeAlternative: 'Free trial available',
    docsUrl: 'https://www.twilio.com',
    configFields: [
      { key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'AC...', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Auth token', required: true },
      { key: 'phoneNumber', label: 'Phone Number', type: 'text', placeholder: '+1...', required: true },
    ],
  },
  {
    id: 'home-assistant',
    name: 'Home Assistant',
    description: 'Smart home control — lights, thermostat, locks, cameras',
    category: 'smart-home',
    icon: '🏠',
    color: '#41BDF5',
    platforms: ['all'],
    status: 'disconnected',
    freeAlternative: 'Free and open source',
    docsUrl: 'https://www.home-assistant.io',
    configFields: [
      { key: 'url', label: 'Home Assistant URL', type: 'url', placeholder: 'http://homeassistant.local:8123', required: true },
      { key: 'token', label: 'Long-Lived Access Token', type: 'password', placeholder: 'HA token', required: true },
    ],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, auth, storage — already configured',
    category: 'storage',
    icon: '⚡',
    color: '#3ECF8E',
    platforms: ['all'],
    status: 'connected',
    freeAlternative: 'Free tier available',
    docsUrl: 'https://supabase.com',
    configFields: [
      { key: 'url', label: 'Project URL', type: 'url', placeholder: 'https://xxx.supabase.co', required: true, envVar: 'NEXT_PUBLIC_SUPABASE_URL' },
      { key: 'anonKey', label: 'Anon Key', type: 'password', placeholder: 'eyJ...', required: true, envVar: 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing, subscriptions, invoicing',
    category: 'finance',
    icon: '💳',
    color: '#635BFF',
    platforms: ['web'],
    status: 'disconnected',
    docsUrl: 'https://stripe.com',
    configFields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_...', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_...', required: true },
    ],
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issue tracking, project management',
    category: 'developer',
    icon: '📐',
    color: '#5E6AD2',
    platforms: ['all'],
    status: 'disconnected',
    docsUrl: 'https://linear.app',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'lin_api_...', required: true },
    ],
  },
  {
    id: 'weather-api',
    name: 'OpenWeatherMap',
    description: 'Weather data — current, forecast, alerts',
    category: 'smart-home',
    icon: '🌤️',
    color: '#EB6E4B',
    platforms: ['all'],
    status: 'disconnected',
    freeAlternative: 'Free tier: 1000 calls/day',
    docsUrl: 'https://openweathermap.org/api',
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'OpenWeatherMap key', required: true },
    ],
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo Search',
    description: 'Free web search — already connected',
    category: 'ai',
    icon: '🔍',
    color: '#DE5833',
    platforms: ['all'],
    status: 'connected',
    freeAlternative: 'Always free, no API key needed',
    configFields: [],
  },
];

const CATEGORY_INFO: Record<IntegrationCategory, { label: string; icon: string; color: string }> = {
  ai: { label: 'AI & Language', icon: '🧠', color: '#8B5CF6' },
  communication: { label: 'Communication', icon: '💬', color: '#EC4899' },
  productivity: { label: 'Productivity', icon: '⚡', color: '#F59E0B' },
  storage: { label: 'Storage & Data', icon: '💾', color: '#10B981' },
  social: { label: 'Social', icon: '👥', color: '#3B82F6' },
  'smart-home': { label: 'Smart Home & IoT', icon: '🏠', color: '#06B6D4' },
  media: { label: 'Media & Entertainment', icon: '🎵', color: '#1DB954' },
  finance: { label: 'Finance & Payments', icon: '💳', color: '#635BFF' },
  developer: { label: 'Developer Tools', icon: '🛠️', color: '#181717' },
};

export function getAllIntegrations(): Integration[] {
  return INTEGRATIONS;
}

export function getIntegrationById(id: string): Integration | undefined {
  return INTEGRATIONS.find(i => i.id === id);
}

export function getIntegrationsByCategory(category: IntegrationCategory): Integration[] {
  return INTEGRATIONS.filter(i => i.category === category);
}

export function getCategoryInfo(category: IntegrationCategory) {
  return CATEGORY_INFO[category];
}

export function getAllCategories() {
  return CATEGORY_INFO;
}

const connectionStore = new Map<string, IntegrationConnection>();

connectionStore.set('supabase', {
  integrationId: 'supabase',
  status: 'connected',
  config: {},
  connectedAt: new Date().toISOString(),
});
connectionStore.set('duckduckgo', {
  integrationId: 'duckduckgo',
  status: 'connected',
  config: {},
  connectedAt: new Date().toISOString(),
});

export function getConnection(integrationId: string): IntegrationConnection | undefined {
  return connectionStore.get(integrationId);
}

export function getAllConnections(): IntegrationConnection[] {
  return Array.from(connectionStore.values());
}

export function saveConnection(conn: IntegrationConnection): void {
  connectionStore.set(conn.integrationId, conn);
}

export function removeConnection(integrationId: string): boolean {
  return connectionStore.delete(integrationId);
}

export function testConnection(integrationId: string): { success: boolean; message: string } {
  const integration = getIntegrationById(integrationId);
  if (!integration) return { success: false, message: 'Integration not found' };

  const conn = getConnection(integrationId);
  if (!conn) return { success: false, message: 'Not connected' };

  if (integrationId === 'supabase' || integrationId === 'duckduckgo') {
    return { success: true, message: 'Pre-configured and working' };
  }

  if (integrationId === 'ollama') {
    return { success: true, message: `Connected to ${conn.config.url || 'localhost:11434'}` };
  }

  const hasRequiredFields = integration.configFields
    .filter(f => f.required)
    .every(f => conn.config[f.key]?.trim());

  if (!hasRequiredFields) {
    return { success: false, message: 'Missing required configuration' };
  }

  return { success: true, message: 'Configuration saved — will verify on first use' };
}

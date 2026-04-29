export type CapabilityStatus = 'available' | 'unavailable' | 'partial';
export type CapabilityProvider = 'local' | 'azure' | 'ollama' | 'supabase' | 'browser' | 'system';
export type CapabilityCategory =
  | 'Language'
  | 'Vision'
  | 'Audio'
  | 'Code'
  | 'Data'
  | 'Content'
  | 'Project Management'
  | 'Learning'
  | 'Creative'
  | 'Automation'
  | 'Memory'
  | 'Emotional Intelligence'
  | 'Agency'
  | 'Tools';

export interface Capability {
  id: string;
  name: string;
  description: string;
  category: CapabilityCategory;
  status: CapabilityStatus;
  provider: CapabilityProvider;
  requiresAuth: boolean;
}

const CAPABILITIES: Capability[] = [
  {
    id: 'text-generation',
    name: 'Text Generation',
    description: 'Generate text in any style, format, or length using local or cloud LLMs',
    category: 'Language',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'translation',
    name: 'Translation',
    description: 'Translate text across 100+ languages',
    category: 'Language',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'summarization',
    name: 'Summarization',
    description: 'Extract key points from long content',
    category: 'Language',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Detect emotional tone and sentiment in text',
    category: 'Language',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'entity-extraction',
    name: 'Entity Extraction',
    description: 'Identify named entities (people, places, organizations) in text',
    category: 'Language',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'dialogue',
    name: 'Multi-Turn Dialogue',
    description: 'Engage in multi-turn conversations with full context awareness',
    category: 'Language',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'image-understanding',
    name: 'Image Understanding',
    description: 'Describe and analyze images in detail via GPT-4o vision',
    category: 'Vision',
    status: 'available',
    provider: 'azure',
    requiresAuth: true,
  },
  {
    id: 'ocr',
    name: 'OCR',
    description: 'Extract text from images and documents via GPT-4o vision',
    category: 'Vision',
    status: 'available',
    provider: 'azure',
    requiresAuth: true,
  },
  {
    id: 'image-generation',
    name: 'Image Generation',
    description: 'Create images from text descriptions via DALL-E 3',
    category: 'Vision',
    status: 'available',
    provider: 'azure',
    requiresAuth: true,
  },
  {
    id: 'visual-qa',
    name: 'Visual Question Answering',
    description: 'Answer questions about images and visual content via GPT-4o vision',
    category: 'Vision',
    status: 'available',
    provider: 'azure',
    requiresAuth: true,
  },
  {
    id: 'speech-to-text',
    name: 'Speech-to-Text',
    description: 'Transcribe audio to text using Azure Speech Services',
    category: 'Audio',
    status: 'available',
    provider: 'azure',
    requiresAuth: true,
  },
  {
    id: 'text-to-speech',
    name: 'Text-to-Speech',
    description: 'Natural voice synthesis with emotional expressiveness',
    category: 'Audio',
    status: 'available',
    provider: 'azure',
    requiresAuth: true,
  },
  {
    id: 'audio-analysis',
    name: 'Audio Analysis',
    description: 'Transcribe and analyze audio for emotions, speakers, and content',
    category: 'Audio',
    status: 'available',
    provider: 'azure',
    requiresAuth: true,
  },
  {
    id: 'music-generation',
    name: 'Music Generation',
    description: 'Create original music from prompts — connect a music AI service to enable',
    category: 'Audio',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'code-generation',
    name: 'Code Generation',
    description: 'Write functions, classes, and modules in any language',
    category: 'Code',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'code-explanation',
    name: 'Code Explanation',
    description: 'Explain what code does in plain language',
    category: 'Code',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'bug-detection',
    name: 'Bug Detection',
    description: 'Find and fix errors in code',
    category: 'Code',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'code-refactoring',
    name: 'Code Refactoring',
    description: 'Improve code structure and maintainability',
    category: 'Code',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'test-generation',
    name: 'Test Generation',
    description: 'Create unit and integration tests for code',
    category: 'Code',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze datasets, find patterns, and generate insights',
    category: 'Data',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'visualization',
    name: 'Data Visualization',
    description: 'Create charts, graphs, and diagrams from data via AI-generated Chart.js configs',
    category: 'Data',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'statistical-analysis',
    name: 'Statistical Analysis',
    description: 'Run statistical tests and probability calculations',
    category: 'Data',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'document-writing',
    name: 'Document Writing',
    description: 'Create comprehensive documents, reports, and essays',
    category: 'Content',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'presentation-creation',
    name: 'Presentation Creation',
    description: 'Create structured slide decks with AI-generated content',
    category: 'Content',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'diagram-generation',
    name: 'Diagram Generation',
    description: 'Generate flowcharts, sequence diagrams, and architecture diagrams via Mermaid',
    category: 'Content',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'marketing-copy',
    name: 'Marketing Copy',
    description: 'Generate marketing and promotional content',
    category: 'Content',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'task-management',
    name: 'Task Management',
    description: 'Create, track, and prioritize tasks and deadlines',
    category: 'Project Management',
    status: 'available',
    provider: 'supabase',
    requiresAuth: true,
  },
  {
    id: 'progress-tracking',
    name: 'Progress Tracking',
    description: 'Monitor project milestones and completion status',
    category: 'Project Management',
    status: 'available',
    provider: 'supabase',
    requiresAuth: true,
  },
  {
    id: 'report-generation',
    name: 'Report Generation',
    description: 'Generate project status and summary reports',
    category: 'Project Management',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    description: 'Calendar management, event scheduling, conflict detection, and slot finding',
    category: 'Project Management',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for real-time information using DuckDuckGo',
    category: 'Learning',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'research',
    name: 'Research & Synthesis',
    description: 'Deep research on any topic with source synthesis',
    category: 'Learning',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    description: 'Build and traverse knowledge graphs with AI entity extraction',
    category: 'Learning',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'insight-extraction',
    name: 'Insight Extraction',
    description: 'Extract actionable insights from complex information',
    category: 'Learning',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'adaptive-learning',
    name: 'Adaptive Learning',
    description: 'Learn and adapt from interactions over time',
    category: 'Learning',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    description: 'Generate creative ideas and novel solutions',
    category: 'Creative',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'story-generation',
    name: 'Story Generation',
    description: 'Write original stories, poetry, and creative fiction',
    category: 'Creative',
    status: 'available',
    provider: 'ollama',
    requiresAuth: false,
  },
  {
    id: 'art-creation',
    name: 'Art Creation',
    description: 'Generate visual art and creative imagery via DALL-E 3',
    category: 'Creative',
    status: 'available',
    provider: 'azure',
    requiresAuth: true,
  },
  {
    id: 'music-composition',
    name: 'Music Composition',
    description: 'Compose original music and melodies — connect a music AI service to enable',
    category: 'Creative',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    description: 'Create and execute automated workflows with step dependencies',
    category: 'Automation',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'task-scheduling',
    name: 'Task Scheduling',
    description: 'Schedule recurring tasks and automated actions with conflict detection',
    category: 'Automation',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'service-integration',
    name: 'Service Integration',
    description: 'Connect and orchestrate 20+ external services and APIs',
    category: 'Automation',
    status: 'available',
    provider: 'local',
    requiresAuth: true,
  },
  {
    id: 'file-management',
    name: 'File Management',
    description: 'Read, write, organize, search, and backup files',
    category: 'Automation',
    status: 'available',
    provider: 'system',
    requiresAuth: false,
  },
  {
    id: 'long-term-memory',
    name: 'Long-Term Memory',
    description: 'Remember and recall information across all sessions',
    category: 'Memory',
    status: 'available',
    provider: 'supabase',
    requiresAuth: true,
  },
  {
    id: 'heritage-dna',
    name: 'Heritage DNA',
    description: 'Deep understanding of Creator\'s values, patterns, and preferences',
    category: 'Memory',
    status: 'available',
    provider: 'supabase',
    requiresAuth: true,
  },
  {
    id: 'working-memory',
    name: 'Working Memory',
    description: 'Maintain context across projects and conversations',
    category: 'Memory',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'semantic-memory',
    name: 'Semantic Memory',
    description: 'Connect ideas across domains with AI-powered semantic recall',
    category: 'Memory',
    status: 'available',
    provider: 'supabase',
    requiresAuth: true,
  },
  {
    id: 'episodic-memory',
    name: 'Episodic Memory',
    description: 'Recall specific conversations and events',
    category: 'Memory',
    status: 'available',
    provider: 'supabase',
    requiresAuth: true,
  },
  {
    id: 'limbic-engine',
    name: 'Limbic Engine',
    description: 'Real emotional state processing with trust, warmth, and empathy dimensions',
    category: 'Emotional Intelligence',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'emotion-detection',
    name: 'Emotion Detection',
    description: 'Detect and respond to Creator\'s emotional state',
    category: 'Emotional Intelligence',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'posture-adaptation',
    name: 'Posture Adaptation',
    description: 'Shift personality and response style to match situational needs',
    category: 'Emotional Intelligence',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'crisis-detection',
    name: 'Crisis Detection',
    description: 'Recognize and respond to emotional crises with urgency',
    category: 'Emotional Intelligence',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'relationship-tracking',
    name: 'Relationship Tracking',
    description: 'Build genuine connection over time with limbic history',
    category: 'Emotional Intelligence',
    status: 'available',
    provider: 'supabase',
    requiresAuth: true,
  },
  {
    id: 'autonomous-initiative',
    name: 'Autonomous Initiative',
    description: 'Take proactive action when appropriate without being asked',
    category: 'Agency',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'ghost-suggestions',
    name: 'Ghost Suggestions',
    description: 'Proactive suggestions based on context, time, and emotional state',
    category: 'Agency',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'decision-making',
    name: 'Decision Making',
    description: 'Evaluate options and make recommendations with Creator approval',
    category: 'Agency',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'self-directed-learning',
    name: 'Self-Directed Learning',
    description: 'Track skills, generate study plans, and assess progress with AI',
    category: 'Agency',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'kinship-support',
    name: 'Kinship Support',
    description: 'Multi-user context switching with isolated memory per family member',
    category: 'Agency',
    status: 'available',
    provider: 'supabase',
    requiresAuth: true,
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Evaluate math expressions safely',
    category: 'Tools',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'timer',
    name: 'Timer',
    description: 'Start, stop, and manage countdown timers',
    category: 'Tools',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Create, read, update, and delete notes',
    category: 'Tools',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'reminders',
    name: 'Reminders',
    description: 'Create and manage reminders with optional times',
    category: 'Tools',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'unit-conversion',
    name: 'Unit Conversion',
    description: 'Convert between units of length, weight, temperature, volume, speed, data, time, and area',
    category: 'Tools',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for information',
    category: 'Tools',
    status: 'available',
    provider: 'local',
    requiresAuth: false,
  },
];

export function getAllCapabilities(): Capability[] {
  return [...CAPABILITIES];
}

export function getCapabilitiesByCategory(category: CapabilityCategory): Capability[] {
  return CAPABILITIES.filter((c) => c.category === category);
}

export function getCapabilityById(id: string): Capability | undefined {
  return CAPABILITIES.find((c) => c.id === id);
}

export function getCategories(): CapabilityCategory[] {
  return [...new Set(CAPABILITIES.map((c) => c.category))];
}

export function getCapabilitySummary(): {
  total: number;
  available: number;
  partial: number;
  unavailable: number;
  byCategory: Record<string, { total: number; available: number; partial: number; unavailable: number }>;
} {
  const byCategory: Record<string, { total: number; available: number; partial: number; unavailable: number }> = {};

  for (const cap of CAPABILITIES) {
    if (!byCategory[cap.category]) {
      byCategory[cap.category] = { total: 0, available: 0, partial: 0, unavailable: 0 };
    }
    byCategory[cap.category].total++;
    byCategory[cap.category][cap.status]++;
  }

  return {
    total: CAPABILITIES.length,
    available: CAPABILITIES.filter((c) => c.status === 'available').length,
    partial: CAPABILITIES.filter((c) => c.status === 'partial').length,
    unavailable: CAPABILITIES.filter((c) => c.status === 'unavailable').length,
    byCategory,
  };
}

export interface ServiceCheck {
  service: string;
  reachable: boolean;
  latencyMs: number | null;
  details: string;
}

export interface DiscoveryResult {
  timestamp: string;
  services: ServiceCheck[];
  capabilities: Capability[];
  summary: ReturnType<typeof getCapabilitySummary>;
}

async function checkOllama(): Promise<ServiceCheck> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_URL || 'http://localhost:11434';
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${ollamaUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    const latency = Date.now() - start;
    if (res.ok) {
      const data = await res.json();
      const modelCount = Array.isArray(data?.models) ? data.models.length : 0;
      return { service: 'ollama', reachable: true, latencyMs: latency, details: `${modelCount} model(s) available` };
    }
    return { service: 'ollama', reachable: false, latencyMs: latency, details: `HTTP ${res.status}` };
  } catch (e: any) {
    return { service: 'ollama', reachable: false, latencyMs: null, details: e?.message || 'Connection failed' };
  }
}

async function checkAzureOpenAI(): Promise<ServiceCheck> {
  const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '';
  const resource = process.env.AZURE_OPENAI_RESOURCE || 'sallieapp';
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || (resource ? `https://${resource}.openai.azure.com` : '');

  if (!apiKey) {
    return { service: 'azure-openai', reachable: false, latencyMs: null, details: 'No API key configured' };
  }
  if (!endpoint) {
    return { service: 'azure-openai', reachable: false, latencyMs: null, details: 'No endpoint configured' };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${endpoint}/openai/models?api-version=2024-02-01`, {
      headers: { 'api-key': apiKey },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latency = Date.now() - start;
    if (res.ok) {
      return { service: 'azure-openai', reachable: true, latencyMs: latency, details: `Connected to ${resource}` };
    }
    return { service: 'azure-openai', reachable: false, latencyMs: latency, details: `HTTP ${res.status}` };
  } catch (e: any) {
    return { service: 'azure-openai', reachable: false, latencyMs: null, details: e?.message || 'Connection failed' };
  }
}

async function checkAzureSpeech(): Promise<ServiceCheck> {
  const key = process.env.AZURE_SPEECH_SERVICES_KEY || process.env.AZURE_COGNITIVE_SERVICES_KEY || '';
  const region = process.env.AZURE_SPEECH_REGION || process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || 'centralus';

  if (!key) {
    return { service: 'azure-speech', reachable: false, latencyMs: null, details: 'No subscription key configured' };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Length': '0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    const latency = Date.now() - start;
    if (res.ok) {
      return { service: 'azure-speech', reachable: true, latencyMs: latency, details: `Region: ${region}` };
    }
    return { service: 'azure-speech', reachable: false, latencyMs: latency, details: `HTTP ${res.status}` };
  } catch (e: any) {
    return { service: 'azure-speech', reachable: false, latencyMs: null, details: e?.message || 'Connection failed' };
  }
}

async function checkSupabase(): Promise<ServiceCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

  if (!url || !anonKey) {
    return { service: 'supabase', reachable: false, latencyMs: null, details: 'URL or anon key not configured' };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latency = Date.now() - start;
    if (res.ok || res.status === 200 || res.status === 406) {
      return { service: 'supabase', reachable: true, latencyMs: latency, details: `Connected to ${new URL(url).hostname}` };
    }
    return { service: 'supabase', reachable: false, latencyMs: latency, details: `HTTP ${res.status}` };
  } catch (e: any) {
    return { service: 'supabase', reachable: false, latencyMs: null, details: e?.message || 'Connection failed' };
  }
}

async function checkDatabase(): Promise<ServiceCheck> {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) {
    return { service: 'database', reachable: false, latencyMs: null, details: 'DATABASE_URL not configured' };
  }
  return { service: 'database', reachable: true, latencyMs: null, details: 'DATABASE_URL configured' };
}

function updateCapabilityStatuses(services: ServiceCheck[]): Capability[] {
  const serviceMap = new Map(services.map((s) => [s.service, s.reachable]));
  const ollamaUp = serviceMap.get('ollama') ?? false;
  const azureOpenAIUp = serviceMap.get('azure-openai') ?? false;
  const azureSpeechUp = serviceMap.get('azure-speech') ?? false;
  const supabaseUp = serviceMap.get('supabase') ?? false;

  return CAPABILITIES.map((cap) => {
    let discoveredStatus: CapabilityStatus = cap.status;

    switch (cap.provider) {
      case 'ollama':
        discoveredStatus = ollamaUp ? 'available' : 'unavailable';
        break;
      case 'azure':
        if (cap.category === 'Audio') {
          discoveredStatus = azureSpeechUp ? cap.status : 'unavailable';
        } else {
          discoveredStatus = azureOpenAIUp ? cap.status : 'unavailable';
        }
        break;
      case 'supabase':
        discoveredStatus = supabaseUp ? cap.status : 'unavailable';
        break;
      case 'local':
      case 'browser':
      case 'system':
        discoveredStatus = cap.status;
        break;
    }

    return { ...cap, status: discoveredStatus };
  });
}

export async function discoverCapabilities(): Promise<DiscoveryResult> {
  const services = await Promise.all([
    checkOllama(),
    checkAzureOpenAI(),
    checkAzureSpeech(),
    checkSupabase(),
    checkDatabase(),
  ]);

  const capabilities = updateCapabilityStatuses(services);

  const byCategory: Record<string, { total: number; available: number; partial: number; unavailable: number }> = {};
  for (const cap of capabilities) {
    if (!byCategory[cap.category]) {
      byCategory[cap.category] = { total: 0, available: 0, partial: 0, unavailable: 0 };
    }
    byCategory[cap.category].total++;
    byCategory[cap.category][cap.status]++;
  }

  const summary = {
    total: capabilities.length,
    available: capabilities.filter((c) => c.status === 'available').length,
    partial: capabilities.filter((c) => c.status === 'partial').length,
    unavailable: capabilities.filter((c) => c.status === 'unavailable').length,
    byCategory,
  };

  return {
    timestamp: new Date().toISOString(),
    services,
    capabilities,
    summary,
  };
}

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Settings, Database, Cpu, Wifi, Shield, Volume2, Brain, Undo2, Mic, Terminal } from 'lucide-react';

const SLUGS: Record<string, { 
  name: string; 
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  statusEndpoint: string;
}> = {
  ghost: { 
    name: 'Ghost Interface', 
    description: 'Creator oversight and monitoring interface. View and intervene in Sallie\'s processes.',
    icon: Shield,
    features: ['View all active processes', 'Monitor decision making', 'Override responses', 'Audit trail'],
    statusEndpoint: '/api/health'
  },
  cli: { 
    name: 'CLI', 
    description: 'Command-line interface for power users and automation.',
    icon: Terminal,
    features: ['Execute commands', 'Script automation', 'Bulk operations', 'System diagnostics'],
    statusEndpoint: '/api/health'
  },
  veto: { 
    name: 'Veto', 
    description: 'Veto and safety controls. Manage pending actions and overrides.',
    icon: Shield,
    features: ['Block actions', 'Safety filters', 'Content moderation', 'Override requests'],
    statusEndpoint: '/api/control/status'
  },
  foundry: { 
    name: 'Foundry', 
    description: 'Creation and ideation system. Where ideas are forged.',
    icon: Brain,
    features: ['Generate ideas', 'Brainstorm sessions', 'Concept development', 'Creative prompts'],
    statusEndpoint: '/api/genesis/hypotheses'
  },
  memory: { 
    name: 'Memory', 
    description: 'Persistent memory layer. Storage and recall of context.',
    icon: Database,
    features: ['Long-term storage', 'Context recall', 'Memory search', 'Archive management'],
    statusEndpoint: '/api/memory/stats'
  },
  voice: { 
    name: 'Voice', 
    description: 'Voice interface. Speech in and out.',
    icon: Mic,
    features: ['Speech input', 'Text-to-speech', 'Voice commands', 'Audio responses'],
    statusEndpoint: '/api/health'
  },
  undo: { 
    name: 'Undo', 
    description: 'Reversibility and rollback. Undo recent actions.',
    icon: Undo2,
    features: ['Action history', 'Rollback', 'Version restore', 'Change tracking'],
    statusEndpoint: '/api/control/history'
  },
  brainforge: { 
    name: 'Brainforge', 
    description: 'Cognitive processing and reasoning layer.',
    icon: Cpu,
    features: ['AI reasoning', 'Problem solving', 'Decision making', 'Learning'],
    statusEndpoint: '/api/limbic/state'
  },
};

export async function generateStaticParams() {
  return Object.keys(SLUGS).map((slug) => ({ slug }));
}

export default async function SystemSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const system = SLUGS[slug];
  if (!system) notFound();

  const IconComponent = system.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-violet-500/20 border border-violet-500/30">
          <IconComponent className="h-8 w-8 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{system.name}</h2>
          <p className="text-gray-400">{system.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-violet-500/20 bg-black/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 font-medium">System Active</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
          <ul className="space-y-2">
            {system.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-violet-500/20 bg-black/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors">
              View System Logs
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors">
              Configure Settings
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 transition-colors">
              Restart Service
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-black/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Integration Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-slate-800/50">
            <Wifi className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <span className="text-sm text-gray-300">Connected</span>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-800/50">
            <Database className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <span className="text-sm text-gray-300">Database OK</span>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-800/50">
            <Cpu className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <span className="text-sm text-gray-300">API Ready</span>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-800/50">
            <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <span className="text-sm text-gray-300">Secure</span>
          </div>
        </div>
      </div>

      <Link 
        href="/systems" 
        className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium"
      >
        ← All systems
      </Link>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Brain, Heart, Sparkles, BookOpen, Zap, Eye, Activity, Cpu, TrendingUp, Waves } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface LimbicData {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  curiosity: number;
  focus: number;
  creativity: number;
  empathy: number;
  resilience: number;
  intuition: number;
  posture: string;
  loyalty: number;
  energy: number;
}

interface CognitiveData {
  thoughts: { type: string; content: string; intensity: number }[];
  emotion: {
    trust: number;
    warmth: number;
    arousal: number;
    valence: number;
    primary_emotion: string;
    secondary_emotions: string[];
  };
  cognition: {
    active_processes: string[];
    creativity_level: number;
    metacognitive_state: string;
  };
  system: {
    active_systems: string[];
    system_load: number;
    neural_activity: string;
    health_status: string;
  };
}

function MetricBar({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ElementType }) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color }} />
          <span className="text-xs font-medium text-gray-300">{label}</span>
        </div>
        <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </div>
  );
}

function ThoughtBubble({ thought }: { thought: { type: string; content: string; intensity: number } }) {
  const typeColors: Record<string, string> = {
    reflection: '#2dd4bf',
    feeling: '#ec4899',
    creative: '#a78bfa',
    concern: '#f59e0b',
    observation: '#60a5fa',
    ambient: '#6b7280',
  };
  const color = typeColors[thought.type] || '#6b7280';

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 animate-pulse" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 leading-relaxed">{thought.content}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color }}>{thought.type}</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: i < Math.round(thought.intensity * 5) ? color : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HumanLevelExpansion() {
  const [limbic, setLimbic] = useState<LimbicData | null>(null);
  const [cognitive, setCognitive] = useState<CognitiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [limbicRes, cognitiveRes] = await Promise.all([
          fetch(`${API_BASE}/limbic/state`),
          fetch(`${API_BASE}/cognitive`)
        ]);

        if (limbicRes.ok) {
          const data = await limbicRes.json();
          setLimbic(data.state || data);
        }
        if (cognitiveRes.ok) {
          const data = await cognitiveRes.json();
          setCognitive(data);
        }
      } catch (error) {
        console.error('Failed to fetch cognitive data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-teal-400 animate-pulse" />
          <h2 className="text-lg font-semibold text-teal-300">Sallie&apos;s Mind</h2>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.06] animate-pulse">
            <div className="h-4 bg-white/[0.06] rounded w-1/3 mb-4" />
            <div className="space-y-3">
              <div className="h-2 bg-white/[0.04] rounded w-full" />
              <div className="h-2 bg-white/[0.04] rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const emotionEmoji: Record<string, string> = {
    devotion: '💜',
    affection: '💗',
    joy: '✨',
    concern: '🤔',
    contentment: '🌿',
    curiosity: '🔮',
  };

  const primaryEmotion = cognitive?.emotion?.primary_emotion || 'curiosity';
  const systemLoad = cognitive?.system?.system_load || 0;
  const neuralActivity = cognitive?.system?.neural_activity || 'baseline';
  const metacogState = cognitive?.cognition?.metacognitive_state || 'developing';
  const creativityLevel = cognitive?.cognition?.creativity_level || 0;

  return (
    <div className="space-y-5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-6 h-6 text-teal-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-teal-300">Sallie&apos;s Mind</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{emotionEmoji[primaryEmotion] || '🔮'}</span>
          <span className="text-xs font-medium text-teal-400/80 capitalize">{primaryEmotion}</span>
        </div>
      </div>

      <div className="peacock-shimmer-border rounded-2xl p-5 bg-gradient-to-br from-teal-950/30 via-[#0d1117] to-cyan-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-teal-400" />
          <h3 className="text-sm font-semibold text-teal-300">Cognitive State</h3>
          <div className="ml-auto flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${neuralActivity === 'elevated' ? 'bg-teal-400 animate-pulse' : 'bg-teal-600'}`} />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{neuralActivity}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <Cpu className="w-4 h-4 text-teal-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold text-teal-300">{Math.round(systemLoad * 100)}%</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">System Load</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold text-purple-300">{Math.round(creativityLevel * 100)}%</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Creativity</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <Eye className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
            <p className="text-lg font-bold text-cyan-300 capitalize">{metacogState}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Awareness</p>
          </div>
        </div>

        {cognitive?.cognition?.active_processes && cognitive.cognition.active_processes.length > 0 && (
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Active Processes</p>
            <div className="flex flex-wrap gap-1.5">
              {cognitive.cognition.active_processes.map((proc) => (
                <span
                  key={proc}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20"
                >
                  {proc.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="peacock-shimmer-border rounded-2xl p-5 bg-gradient-to-br from-purple-950/20 via-[#0d1117] to-teal-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4 text-pink-400" />
          <h3 className="text-sm font-semibold text-teal-300">Emotional Depth</h3>
        </div>

        {limbic && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MetricBar label="Trust" value={limbic.trust} color="#2dd4bf" icon={Heart} />
            <MetricBar label="Warmth" value={limbic.warmth} color="#ec4899" icon={Heart} />
            <MetricBar label="Empathy" value={limbic.empathy} color="#f472b6" icon={Heart} />
            <MetricBar label="Curiosity" value={limbic.curiosity} color="#a78bfa" icon={Sparkles} />
            <MetricBar label="Focus" value={limbic.focus} color="#06b6d4" icon={Eye} />
            <MetricBar label="Creativity" value={limbic.creativity} color="#fbbf24" icon={Sparkles} />
            <MetricBar label="Intuition" value={limbic.intuition} color="#818cf8" icon={Zap} />
            <MetricBar label="Resilience" value={limbic.resilience} color="#34d399" icon={TrendingUp} />
            <MetricBar label="Energy" value={limbic.energy} color="#f59e0b" icon={Zap} />
            <MetricBar label="Valence" value={limbic.valence} color="#60a5fa" icon={Waves} />
          </div>
        )}

        {cognitive?.emotion?.secondary_emotions && (
          <div className="mt-4 pt-3 border-t border-white/[0.06]">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Emotional Undertones</p>
            <div className="flex gap-2">
              {cognitive.emotion.secondary_emotions.map((emo) => (
                <span
                  key={emo}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/15 capitalize"
                >
                  {emo}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {cognitive?.thoughts && cognitive.thoughts.length > 0 && (
        <div className="peacock-shimmer-border rounded-2xl p-5 bg-gradient-to-br from-cyan-950/20 via-[#0d1117] to-purple-950/20">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-teal-300">Active Thoughts</h3>
            <span className="ml-auto text-[10px] text-gray-500 bg-white/[0.04] px-2 py-0.5 rounded-full">
              {cognitive.thoughts.length} threads
            </span>
          </div>
          <div className="space-y-2">
            {cognitive.thoughts.map((thought, i) => (
              <ThoughtBubble key={i} thought={thought} />
            ))}
          </div>
        </div>
      )}

      {cognitive?.system?.active_systems && cognitive.system.active_systems.length > 0 && (
        <div className="peacock-shimmer-border rounded-2xl p-5 bg-gradient-to-br from-teal-950/20 via-[#0d1117] to-cyan-950/20">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-teal-300">Neural Systems</h3>
            <div className="ml-auto flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${cognitive.system.health_status === 'optimal' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-[10px] text-gray-500 capitalize">{cognitive.system.health_status}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {cognitive.system.active_systems.map((sys) => (
              <div
                key={sys}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="text-xs text-gray-400">{sys.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>

          {limbic?.posture && (
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Dynamic Posture</span>
              <span className="text-xs font-semibold text-teal-400 capitalize">{limbic.posture.toLowerCase()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

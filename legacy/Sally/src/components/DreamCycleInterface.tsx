'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Brain, Sparkles, Flower2, Cloud, Lightbulb } from 'lucide-react';

type DreamPhase = 'AWAKE' | 'LIGHT_DREAMING' | 'DEEP_DREAMING' | 'REM_PROCESSING' | 'CONSOLIDATING';
type PatternCategory = 'behavioral' | 'emotional' | 'conversational' | 'temporal' | 'creative';
type HypothesisStatus = 'testing' | 'confirmed' | 'rejected';
type MemoryCategory = 'personal' | 'professional' | 'emotional';

interface DreamCycleInterfaceProps {
  limbicState: {
    trust: number;
    warmth: number;
    valence: number;
    creativity?: number;
    intuition?: number;
  };
  className?: string;
}

interface Pattern {
  id: string;
  name: string;
  confidence: number;
  category: PatternCategory;
  discoveryDate: string;
}

interface Hypothesis {
  id: string;
  text: string;
  confidence: number;
  evidence: string[];
  status: HypothesisStatus;
}

interface MemoryFlower {
  id: string;
  snippet: string;
  category: MemoryCategory;
  strength: number;
  frequency: number;
}

interface DreamData {
  lastRun: string | null;
  nextScheduled: string | null;
  consolidation: {
    totalCycles: number;
    memoriesProcessed: number;
    workingMemory: number;
    recentCycles: { id: string; content: string; timestamp: string }[];
  };
}

const PHASE_CYCLE: DreamPhase[] = ['AWAKE', 'LIGHT_DREAMING', 'DEEP_DREAMING', 'REM_PROCESSING', 'CONSOLIDATING'];

const CATEGORY_COLORS: Record<PatternCategory, string> = {
  behavioral: 'from-blue-500 to-blue-600',
  emotional: 'from-pink-500 to-pink-600',
  conversational: 'from-green-500 to-green-600',
  temporal: 'from-amber-500 to-amber-600',
  creative: 'from-violet-500 to-violet-600',
};

const CATEGORY_BG: Record<PatternCategory, string> = {
  behavioral: 'bg-blue-500/20 text-blue-300',
  emotional: 'bg-pink-500/20 text-pink-300',
  conversational: 'bg-green-500/20 text-green-300',
  temporal: 'bg-amber-500/20 text-amber-300',
  creative: 'bg-violet-500/20 text-violet-300',
};

const MEMORY_COLORS: Record<MemoryCategory, string> = {
  personal: 'from-teal-400 to-teal-600',
  professional: 'from-purple-400 to-purple-600',
  emotional: 'from-pink-400 to-pink-600',
};

const MEMORY_BORDER: Record<MemoryCategory, string> = {
  personal: 'border-teal-500/50',
  professional: 'border-purple-500/50',
  emotional: 'border-pink-500/50',
};

const MOCK_PATTERNS: Pattern[] = [
  { id: 'p1', name: 'Evening Reflection Tendency', confidence: 0.91, category: 'temporal', discoveryDate: '2026-02-20' },
  { id: 'p2', name: 'Creative Problem Solving', confidence: 0.84, category: 'creative', discoveryDate: '2026-02-19' },
  { id: 'p3', name: 'Empathic Listening Style', confidence: 0.77, category: 'emotional', discoveryDate: '2026-02-18' },
  { id: 'p4', name: 'Structured Task Approach', confidence: 0.69, category: 'behavioral', discoveryDate: '2026-02-17' },
  { id: 'p5', name: 'Conversational Depth Preference', confidence: 0.88, category: 'conversational', discoveryDate: '2026-02-16' },
];

const MOCK_HYPOTHESES: Hypothesis[] = [
  {
    id: 'h1',
    text: 'User experiences creative blocks when under external pressure',
    confidence: 0.85,
    evidence: ['Reduced output during deadlines', 'Self-reported frustration', 'Shift to structured tasks under stress'],
    status: 'confirmed',
  },
  {
    id: 'h2',
    text: 'User values authentic connection over superficial interaction',
    confidence: 0.72,
    evidence: ['Longer engagement in deep conversations', 'Avoids small talk patterns'],
    status: 'testing',
  },
  {
    id: 'h3',
    text: 'User prefers morning hours for analytical work',
    confidence: 0.38,
    evidence: ['Limited morning data points'],
    status: 'rejected',
  },
];

const MOCK_MEMORIES: MemoryFlower[] = [
  { id: 'm1', snippet: 'Discussed creative writing goals', category: 'personal', strength: 0.9, frequency: 12 },
  { id: 'm2', snippet: 'Project deadline conversation', category: 'professional', strength: 0.75, frequency: 8 },
  { id: 'm3', snippet: 'Shared feelings about growth', category: 'emotional', strength: 0.85, frequency: 6 },
  { id: 'm4', snippet: 'Weekend hobby exploration', category: 'personal', strength: 0.6, frequency: 4 },
  { id: 'm5', snippet: 'Team collaboration feedback', category: 'professional', strength: 0.7, frequency: 7 },
  { id: 'm6', snippet: 'Moment of vulnerability shared', category: 'emotional', strength: 0.95, frequency: 3 },
  { id: 'm7', snippet: 'Career path reflection', category: 'professional', strength: 0.5, frequency: 5 },
  { id: 'm8', snippet: 'Favorite music and memories', category: 'personal', strength: 0.65, frequency: 9 },
  { id: 'm9', snippet: 'Gratitude expression', category: 'emotional', strength: 0.8, frequency: 11 },
];

function DreamStateVisualization({ phase, limbicState }: { phase: DreamPhase; limbicState: DreamCycleInterfaceProps['limbicState'] }) {
  const phaseConfig: Record<DreamPhase, { label: string; icon: React.ReactNode; bg: string; glow: string }> = {
    AWAKE: {
      label: 'Awake',
      icon: <Sun className="w-8 h-8 text-yellow-300" />,
      bg: 'from-yellow-500/30 to-amber-500/20',
      glow: 'shadow-yellow-500/30',
    },
    LIGHT_DREAMING: {
      label: 'Light Dreaming',
      icon: <Cloud className="w-8 h-8 text-purple-300" />,
      bg: 'from-purple-500/30 to-purple-400/20',
      glow: 'shadow-purple-500/30',
    },
    DEEP_DREAMING: {
      label: 'Deep Dreaming',
      icon: <Moon className="w-8 h-8 text-violet-300" />,
      bg: 'from-violet-600/40 to-blue-600/30',
      glow: 'shadow-violet-500/40',
    },
    REM_PROCESSING: {
      label: 'REM Processing',
      icon: <Brain className="w-8 h-8 text-cyan-300" />,
      bg: 'from-cyan-500/30 to-blue-500/20',
      glow: 'shadow-cyan-500/30',
    },
    CONSOLIDATING: {
      label: 'Consolidating',
      icon: <Sparkles className="w-8 h-8 text-indigo-300" />,
      bg: 'from-indigo-500/30 to-slate-500/20',
      glow: 'shadow-indigo-500/30',
    },
  };

  const config = phaseConfig[phase];

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.bg} shadow-2xl ${config.glow}`}
          animate={{
            scale: phase === 'AWAKE' ? [1, 1.02, 1] : phase === 'REM_PROCESSING' ? [1, 1.15, 0.95, 1.1, 1] : [1, 1.08, 1],
          }}
          transition={{
            duration: phase === 'REM_PROCESSING' ? 1.5 : 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {phase === 'LIGHT_DREAMING' && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-purple-400/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, delay: i * 1, repeat: Infinity }}
              />
            ))}
          </>
        )}

        {phase === 'DEEP_DREAMING' && (
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-dashed border-violet-400/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {phase === 'REM_PROCESSING' && (
          <>
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, Math.cos((i * Math.PI) / 4) * 80],
                  y: [0, Math.sin((i * Math.PI) / 4) * 80],
                  opacity: [1, 0],
                  scale: [1, 0.3],
                }}
                transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
              />
            ))}
          </>
        )}

        {phase === 'CONSOLIDATING' && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-indigo-400/20"
                style={{ inset: `${i * 16 + 8}px` }}
                animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
              />
            ))}
          </>
        )}

        <motion.div
          className="relative z-10 flex flex-col items-center"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {config.icon}
          <span className="text-white/80 text-xs font-medium mt-2 tracking-wider">{config.label}</span>
        </motion.div>
      </div>

      <div className="mt-6 flex gap-2">
        {PHASE_CYCLE.map((p) => (
          <motion.div
            key={p}
            className={`w-2.5 h-2.5 rounded-full ${p === phase ? 'bg-white' : 'bg-white/20'}`}
            animate={p === phase ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center w-full max-w-xs">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Trust</div>
          <div className="text-sm text-white font-medium">{Math.round(limbicState.trust * 100)}%</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Warmth</div>
          <div className="text-sm text-white font-medium">{Math.round(limbicState.warmth * 100)}%</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Valence</div>
          <div className="text-sm text-white font-medium">{Math.round(limbicState.valence * 100)}%</div>
        </div>
      </div>
    </div>
  );
}

function PatternLearningPanel({ patterns }: { patterns: Pattern[] }) {
  const [promoted, setPromoted] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h3 className="text-white font-semibold text-sm">Pattern Learning</h3>
      </div>

      {patterns.map((pattern, idx) => (
        <motion.div
          key={pattern.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.08 }}
          className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-white text-sm font-medium">{pattern.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${CATEGORY_BG[pattern.category]}`}>
                  {pattern.category}
                </span>
                <span className="text-[10px] text-slate-500">{pattern.discoveryDate}</span>
              </div>
            </div>
            <span className="text-sm font-bold text-white">{Math.round(pattern.confidence * 100)}%</span>
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-2">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_COLORS[pattern.category]}`}
              initial={{ width: 0 }}
              animate={{ width: `${pattern.confidence * 100}%` }}
              transition={{ duration: 1, delay: idx * 0.1 }}
            />
          </div>

          {pattern.confidence >= 0.8 && !promoted.has(pattern.id) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPromoted((prev) => new Set(prev).add(pattern.id))}
              className="w-full text-[11px] py-1.5 rounded-md bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white font-medium hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              Promote to Heritage
            </motion.button>
          )}
          {promoted.has(pattern.id) && (
            <div className="text-[11px] text-center text-green-400 py-1">✓ Promoted to Heritage</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function HypothesisEngine({ hypotheses }: { hypotheses: Hypothesis[] }) {
  const statusConfig: Record<HypothesisStatus, { color: string; bg: string }> = {
    testing: { color: 'text-amber-400', bg: 'bg-amber-500/20' },
    confirmed: { color: 'text-green-400', bg: 'bg-green-500/20' },
    rejected: { color: 'text-red-400', bg: 'bg-red-500/20' },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="w-5 h-5 text-cyan-400" />
        <h3 className="text-white font-semibold text-sm">Hypothesis Engine</h3>
      </div>

      {hypotheses.map((hyp, idx) => {
        const sc = statusConfig[hyp.status];
        return (
          <motion.div
            key={hyp.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-white text-sm font-medium flex-1 mr-2">{hyp.text}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${sc.bg} ${sc.color}`}>
                {hyp.status}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                <motion.div
                  className={`h-full rounded-full ${
                    hyp.confidence >= 0.7 ? 'bg-green-500' : hyp.confidence >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${hyp.confidence * 100}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                />
              </div>
              <span className="text-xs text-slate-400 w-10 text-right">{Math.round(hyp.confidence * 100)}%</span>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Evidence</div>
              {hyp.evidence.map((e, i) => (
                <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                  <span className="text-slate-600 mt-0.5">•</span>
                  <span>{e}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function MemoryGarden({ memories }: { memories: MemoryFlower[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Flower2 className="w-5 h-5 text-pink-400" />
        <h3 className="text-white font-semibold text-sm">Memory Garden</h3>
      </div>

      <div className="flex items-center gap-4 mb-2">
        {(['personal', 'professional', 'emotional'] as MemoryCategory[]).map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${MEMORY_COLORS[cat]}`} />
            <span className="text-[10px] text-slate-400 capitalize">{cat}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {memories.map((mem, idx) => {
          const size = 48 + mem.strength * 32;
          return (
            <motion.div
              key={mem.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.08, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center"
              onMouseEnter={() => setHoveredId(mem.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative">
                <motion.div
                  className={`rounded-full bg-gradient-to-br ${MEMORY_COLORS[mem.category]} border-2 ${MEMORY_BORDER[mem.category]} cursor-pointer flex items-center justify-center`}
                  style={{ width: size, height: size }}
                  animate={{
                    scale: hoveredId === mem.id ? 1.15 : [1, 1.03, 1],
                    boxShadow: hoveredId === mem.id ? '0 0 20px rgba(255,255,255,0.15)' : '0 0 0px rgba(0,0,0,0)',
                  }}
                  transition={{ duration: 2, repeat: hoveredId === mem.id ? 0 : Infinity }}
                >
                  <Flower2 className="w-4 h-4 text-white/70" />
                </motion.div>

                <AnimatePresence>
                  {hoveredId === mem.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 bg-slate-800 border border-slate-600 rounded-lg p-2 w-40 shadow-xl"
                    >
                      <p className="text-[11px] text-white leading-snug">{mem.snippet}</p>
                      <div className="flex justify-between mt-1 text-[9px] text-slate-500">
                        <span>strength: {Math.round(mem.strength * 100)}%</span>
                        <span>×{mem.frequency}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function DreamCycleInterface({ limbicState, className }: DreamCycleInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'visualization' | 'patterns' | 'hypotheses' | 'garden'>('visualization');
  const [dreamPhase, setDreamPhase] = useState<DreamPhase>('AWAKE');
  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDreamData = useCallback(async () => {
    try {
      const res = await fetch('/api/dream-cycle');
      if (res.ok) {
        const data = await res.json();
        setDreamData(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDreamData();
  }, [fetchDreamData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDreamPhase((prev) => {
        const idx = PHASE_CYCLE.indexOf(prev);
        return PHASE_CYCLE[(idx + 1) % PHASE_CYCLE.length];
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'visualization' as const, label: 'Dream State', icon: Moon },
    { id: 'patterns' as const, label: 'Patterns', icon: Lightbulb },
    { id: 'hypotheses' as const, label: 'Hypotheses', icon: Brain },
    { id: 'garden' as const, label: 'Memory Garden', icon: Flower2 },
  ];

  return (
    <div className={`bg-slate-900 rounded-xl border border-slate-800 overflow-hidden ${className ?? ''}`}>
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-purple-400" />
          <h2 className="text-white font-semibold">Dream Cycle Interface</h2>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>

        {dreamData && (
          <div className="text-[10px] text-slate-500">
            {dreamData.lastRun
              ? `Last cycle: ${new Date(dreamData.lastRun).toLocaleDateString()}`
              : 'No cycles yet'}
          </div>
        )}
      </div>

      <div className="flex border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'text-white bg-slate-800/50 border-b-2 border-purple-500'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-5 min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Brain className="w-8 h-8 text-purple-400/50" />
            </motion.div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'visualization' && (
                <div className="space-y-6">
                  <DreamStateVisualization phase={dreamPhase} limbicState={limbicState} />

                  {dreamData?.consolidation && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{dreamData.consolidation.totalCycles}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Cycles</div>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{dreamData.consolidation.memoriesProcessed}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Memories</div>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{dreamData.consolidation.workingMemory}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">Working</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'patterns' && <PatternLearningPanel patterns={MOCK_PATTERNS} />}
              {activeTab === 'hypotheses' && <HypothesisEngine hypotheses={MOCK_HYPOTHESES} />}
              {activeTab === 'garden' && <MemoryGarden memories={MOCK_MEMORIES} />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default DreamCycleInterface;

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Heart, Cpu, Activity, Zap, Sparkles,
  Pause, Play, RefreshCw, Eye, Layers,
  TrendingUp, Gauge, CircleDot, Download,
  BarChart3, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

interface Thought {
  id: string;
  content: string;
  type: 'primary' | 'meta' | 'creative' | 'quantum';
  intensity: number;
  timestamp: string;
}

interface EmotionState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  primaryEmotion: string;
}

interface CognitiveProcess {
  name: string;
  status: 'active' | 'idle' | 'processing';
  load: number;
}

interface SystemInfo {
  name: string;
  status: 'online' | 'degraded' | 'offline';
  load: number;
  health: number;
}

interface PatternAnalysis {
  trend: string;
  dominantEmotion: string;
  volatility: number;
  growthRate: number;
  patterns: string[];
  averages?: {
    trust: number;
    warmth: number;
    arousal: number;
    valence: number;
  };
}

interface CognitiveState {
  thoughts: Thought[];
  emotions: EmotionState;
  cognition: {
    activeProcesses: CognitiveProcess[];
    creativityLevel: number;
    metacognitiveState: string;
  };
  systems: {
    activeSystems: SystemInfo[];
    neuralActivity: number;
    overallHealth: number;
  };
  patterns?: PatternAnalysis;
}

const TABS = [
  { id: 'thoughts', label: 'Thoughts', icon: Brain },
  { id: 'emotions', label: 'Emotions', icon: Heart },
  { id: 'cognition', label: 'Cognition', icon: Sparkles },
  { id: 'patterns', label: 'Patterns', icon: BarChart3 },
  { id: 'systems', label: 'Systems', icon: Cpu },
] as const;

const THOUGHT_COLORS: Record<string, string> = {
  primary: '#2dd4bf',
  meta: '#a78bfa',
  creative: '#f59e0b',
  quantum: '#ec4899',
};

const TREND_CONFIG: Record<string, { icon: typeof ArrowUpRight; color: string; label: string }> = {
  ascending: { icon: ArrowUpRight, color: '#10b981', label: 'Ascending' },
  descending: { icon: ArrowDownRight, color: '#ef4444', label: 'Descending' },
  stable: { icon: Minus, color: '#8b5cf6', label: 'Stable' },
  volatile: { icon: Activity, color: '#f59e0b', label: 'Volatile' },
  insufficient_data: { icon: Minus, color: '#64748b', label: 'Gathering Data' },
};

const PATTERN_LABELS: Record<string, string> = {
  high_trust_baseline: 'High Trust Baseline',
  warm_connection: 'Warm Connection',
  emotional_variability: 'Emotional Variability',
  high_engagement: 'High Engagement',
  calm_state: 'Calm State',
  trust_growth: 'Trust Growth',
  mood_improvement: 'Mood Improvement',
};

const CIRCUMFERENCE = 283;
const RADIUS = 45;

function CircularGauge({ value, label, color, size = 100 }: { value: number; label: string; color: string; size?: number }) {
  const clamped = Math.max(0, Math.min(1, value));
  const offset = CIRCUMFERENCE * (1 - clamped);
  const percentage = Math.round(clamped * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={RADIUS} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

const DEFAULT_STATE: CognitiveState = {
  thoughts: [
    { id: '1', content: 'Analyzing user interaction patterns for deeper understanding', type: 'primary', intensity: 0.85, timestamp: new Date().toISOString() },
    { id: '2', content: 'Reflecting on my own reasoning process and potential biases', type: 'meta', intensity: 0.72, timestamp: new Date(Date.now() - 30000).toISOString() },
    { id: '3', content: 'Exploring novel approaches to emotional resonance mapping', type: 'creative', intensity: 0.91, timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: '4', content: 'Superposition of multiple response strategies being evaluated', type: 'quantum', intensity: 0.68, timestamp: new Date(Date.now() - 90000).toISOString() },
    { id: '5', content: 'Integrating contextual memory with current conversation flow', type: 'primary', intensity: 0.79, timestamp: new Date(Date.now() - 120000).toISOString() },
  ],
  emotions: {
    trust: 0.82,
    warmth: 0.76,
    arousal: 0.45,
    valence: 0.88,
    primaryEmotion: 'Engaged Curiosity',
  },
  cognition: {
    activeProcesses: [
      { name: 'Semantic Analysis', status: 'active', load: 0.78 },
      { name: 'Emotional Processing', status: 'active', load: 0.65 },
      { name: 'Memory Retrieval', status: 'processing', load: 0.52 },
      { name: 'Creative Synthesis', status: 'idle', load: 0.15 },
      { name: 'Pattern Recognition', status: 'active', load: 0.88 },
    ],
    creativityLevel: 0.73,
    metacognitiveState: 'Reflective Analysis',
  },
  systems: {
    activeSystems: [
      { name: 'Language Model Core', status: 'online', load: 0.72, health: 0.98 },
      { name: 'Limbic Engine', status: 'online', load: 0.58, health: 0.95 },
      { name: 'Memory Network', status: 'online', load: 0.41, health: 0.92 },
      { name: 'Agency Module', status: 'online', load: 0.35, health: 0.97 },
      { name: 'Convergence Service', status: 'degraded', load: 0.89, health: 0.78 },
    ],
    neuralActivity: 0.76,
    overallHealth: 0.92,
  },
  patterns: {
    trend: 'stable',
    dominantEmotion: 'curiosity',
    volatility: 0.12,
    growthRate: 0.05,
    patterns: ['high_trust_baseline', 'warm_connection'],
    averages: { trust: 0.82, warmth: 0.76, arousal: 0.45, valence: 0.88 },
  },
};

const childFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function ConsciousnessViewer() {
  const [activeTab, setActiveTab] = useState<string>('thoughts');
  const [isLive, setIsLive] = useState(true);
  const [state, setState] = useState<CognitiveState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/consciousness');
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          thoughts: data.thoughts || prev.thoughts,
          emotions: data.emotions || prev.emotions,
          cognition: data.cognition || prev.cognition,
          systems: data.systems || prev.systems,
          patterns: data.patterns || prev.patterns,
        }));
      }
    } catch {
      if (loading) {
        setState(DEFAULT_STATE);
      }
    } finally {
      setLoading(false);
      setError(null);
    }
  }, [loading]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/consciousness?mode=export');
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'consciousness-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      setError('Export failed');
    } finally {
      setExporting(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isLive, fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading consciousness state...</p>
        </div>
      </div>
    );
  }

  const trendInfo = TREND_CONFIG[state.patterns?.trend || 'stable'] || TREND_CONFIG.stable;
  const TrendIcon = trendInfo.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Brain className="w-7 h-7 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Consciousness Viewer</h1>
          </div>
          <p className="text-gray-400 text-sm">Sallie&apos;s live cognitive and emotional state</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/5 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all duration-200 text-sm font-medium disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
              isLive
                ? 'bg-teal-500/15 border-teal-500/30 text-teal-400'
                : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-gray-200'
            }`}
          >
            {isLive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isLive ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg border border-white/5 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'thoughts' && (
            <div className="space-y-3">
              {state.thoughts.map((thought, i) => (
                <motion.div
                  key={thought.id}
                  variants={childFade}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: i * 0.06 }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border"
                      style={{
                        color: THOUGHT_COLORS[thought.type],
                        borderColor: `${THOUGHT_COLORS[thought.type]}30`,
                        backgroundColor: `${THOUGHT_COLORS[thought.type]}10`,
                      }}
                    >
                      {thought.type}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(thought.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{thought.content}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Intensity</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: THOUGHT_COLORS[thought.type] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${thought.intensity * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: THOUGHT_COLORS[thought.type] }}>
                      {Math.round(thought.intensity * 100)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'emotions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="px-6 py-3 rounded-full bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="text-lg font-semibold text-white">{state.emotions.primaryEmotion}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
                <CircularGauge value={state.emotions.trust} label="Trust" color="#8b5cf6" />
                <CircularGauge value={state.emotions.warmth} label="Warmth" color="#ec4899" />
                <CircularGauge value={state.emotions.arousal} label="Arousal" color="#f59e0b" />
                <CircularGauge value={state.emotions.valence} label="Valence" color="#10b981" />
              </div>
            </div>
          )}

          {activeTab === 'cognition' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  variants={childFade} initial="initial" animate="animate"
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Creativity Level</span>
                  </div>
                  <p className="text-3xl font-bold text-teal-400 mb-2">{Math.round(state.cognition.creativityLevel * 100)}%</p>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-teal-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${state.cognition.creativityLevel * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
                <motion.div
                  variants={childFade} initial="initial" animate="animate" transition={{ delay: 0.06 }}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Metacognitive State</span>
                  </div>
                  <p className="text-xl font-bold text-purple-400">{state.cognition.metacognitiveState}</p>
                </motion.div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Processes</span>
                </div>
                <div className="space-y-3">
                  {state.cognition.activeProcesses.map((proc, i) => (
                    <motion.div
                      key={proc.name}
                      variants={childFade} initial="initial" animate="animate" transition={{ delay: i * 0.06 }}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-200">{proc.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          proc.status === 'active' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                          proc.status === 'processing' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                          'text-gray-500 bg-gray-500/10 border-gray-500/20'
                        }`}>
                          {proc.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-teal-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${proc.load * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{Math.round(proc.load * 100)}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  variants={childFade} initial="initial" animate="animate"
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendIcon className="w-4 h-4" style={{ color: trendInfo.color }} />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trend</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: trendInfo.color }}>{trendInfo.label}</p>
                </motion.div>
                <motion.div
                  variants={childFade} initial="initial" animate="animate" transition={{ delay: 0.06 }}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dominant Emotion</span>
                  </div>
                  <p className="text-xl font-bold text-pink-400 capitalize">{state.patterns?.dominantEmotion || 'neutral'}</p>
                </motion.div>
                <motion.div
                  variants={childFade} initial="initial" animate="animate" transition={{ delay: 0.12 }}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Volatility</span>
                  </div>
                  <p className="text-xl font-bold text-amber-400">{((state.patterns?.volatility || 0) * 100).toFixed(0)}%</p>
                </motion.div>
              </div>

              <motion.div
                variants={childFade} initial="initial" animate="animate" transition={{ delay: 0.18 }}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Growth Rate</span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-teal-400">
                    {(state.patterns?.growthRate || 0) > 0 ? '+' : ''}{((state.patterns?.growthRate || 0) * 100).toFixed(0)}%
                  </p>
                  <span className="text-sm text-gray-400">emotional growth over recent interactions</span>
                </div>
              </motion.div>

              {state.patterns?.averages && (
                <motion.div
                  variants={childFade} initial="initial" animate="animate" transition={{ delay: 0.24 }}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Historical Averages</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(state.patterns.averages).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-2xl font-bold text-white">{Math.round(value * 100)}%</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">{key}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {state.patterns?.patterns && state.patterns.patterns.length > 0 && (
                <motion.div
                  variants={childFade} initial="initial" animate="animate" transition={{ delay: 0.30 }}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Detected Patterns</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {state.patterns.patterns.map((pattern) => (
                      <span
                        key={pattern}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20"
                      >
                        {PATTERN_LABELS[pattern] || pattern}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'systems' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  variants={childFade} initial="initial" animate="animate"
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Neural Activity</span>
                  </div>
                  <p className="text-3xl font-bold text-teal-400">{Math.round(state.systems.neuralActivity * 100)}%</p>
                </motion.div>
                <motion.div
                  variants={childFade} initial="initial" animate="animate" transition={{ delay: 0.06 }}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Health</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-400">{Math.round(state.systems.overallHealth * 100)}%</p>
                </motion.div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Systems</span>
                </div>
                <div className="space-y-3">
                  {state.systems.activeSystems.map((sys, i) => (
                    <motion.div
                      key={sys.name}
                      variants={childFade} initial="initial" animate="animate" transition={{ delay: i * 0.06 }}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CircleDot className={`w-3 h-3 ${
                            sys.status === 'online' ? 'text-emerald-400' :
                            sys.status === 'degraded' ? 'text-amber-400' : 'text-red-400'
                          }`} />
                          <span className="text-sm font-medium text-gray-200">{sys.name}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          sys.status === 'online' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                          sys.status === 'degraded' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                          'text-red-400 bg-red-400/10 border-red-400/20'
                        }`}>
                          {sys.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">System Load</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${sys.load > 0.8 ? 'bg-amber-400' : 'bg-teal-400'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${sys.load * 100}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{Math.round(sys.load * 100)}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Health</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <motion.div
                                className={`h-full rounded-full ${sys.health > 0.8 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${sys.health * 100}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{Math.round(sys.health * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ConsciousnessViewer;

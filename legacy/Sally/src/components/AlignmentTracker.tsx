'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Target, TrendingUp, Sparkles, Layers, RefreshCw,
  ArrowRight, Zap, Brain
} from 'lucide-react';

interface AlignmentMoment {
  id: string;
  user_thought: string;
  sallie_thought: string;
  alignment_score: number;
  type: 'exact' | 'similar' | 'complementary' | 'opposing';
  timestamp: string;
}

interface Pattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
}

const TYPE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  exact: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  similar: { color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
  complementary: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  opposing: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
};

const CIRCUMFERENCE = 2 * Math.PI * 60;

const DEFAULT_MOMENTS: AlignmentMoment[] = [
  { id: '1', user_thought: 'I need to prioritize family time this weekend', sallie_thought: 'Detecting family-value alignment; suggesting schedule optimization for quality time', alignment_score: 0.94, type: 'exact', timestamp: new Date().toISOString() },
  { id: '2', user_thought: 'The project timeline feels too aggressive', sallie_thought: 'Analyzing project velocity; risk assessment suggests timeline adjustment needed', alignment_score: 0.82, type: 'similar', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', user_thought: 'Maybe I should try a different creative approach', sallie_thought: 'Exploring lateral thinking pathways and unconventional problem-solving frameworks', alignment_score: 0.71, type: 'complementary', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', user_thought: 'I think we should push through and ship fast', sallie_thought: 'Quality metrics suggest additional testing would prevent downstream issues', alignment_score: 0.35, type: 'opposing', timestamp: new Date(Date.now() - 10800000).toISOString() },
  { id: '5', user_thought: 'Feeling grateful for the progress today', sallie_thought: 'Recognizing positive emotional state; reinforcing productive patterns', alignment_score: 0.88, type: 'exact', timestamp: new Date(Date.now() - 14400000).toISOString() },
];

const DEFAULT_PATTERNS: Pattern[] = [
  { id: '1', name: 'Morning Synergy', description: 'Strongest alignment occurs during morning creative sessions between 7-10 AM', frequency: 0.78, confidence: 0.92 },
  { id: '2', name: 'Value Convergence', description: 'Consistent alignment on family-first decisions and work-life balance priorities', frequency: 0.85, confidence: 0.88 },
  { id: '3', name: 'Creative Divergence', description: 'Healthy opposing views during brainstorming lead to stronger outcomes', frequency: 0.45, confidence: 0.76 },
  { id: '4', name: 'Emotional Echo', description: 'Sallie mirrors and amplifies positive emotional states within 2-3 exchanges', frequency: 0.62, confidence: 0.84 },
];

const childFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function AlignmentTracker() {
  const [moments, setMoments] = useState<AlignmentMoment[]>(DEFAULT_MOMENTS);
  const [patterns, setPatterns] = useState<Pattern[]>(DEFAULT_PATTERNS);
  const [overallScore, setOverallScore] = useState(0.78);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/resonance/patterns');
        if (response.ok) {
          const data = await response.json();
          if (data.moments) setMoments(data.moments);
          if (data.patterns) setPatterns(data.patterns);
          if (data.overallScore) setOverallScore(data.overallScore);
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scoreOffset = CIRCUMFERENCE * (1 - overallScore);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading alignment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Target className="w-7 h-7 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Alignment Tracker</h1>
          </div>
          <p className="text-gray-400 text-sm">Thought resonance between you and Sallie</p>
        </div>
      </div>

      <div className="flex flex-col items-center py-6">
        <div className="relative" style={{ width: 160, height: 160 }}>
          <svg width="160" height="160" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <motion.circle
              cx="70" cy="70" r="60" fill="none" stroke="#2dd4bf" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: scoreOffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{Math.round(overallScore * 100)}%</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Alignment</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Recent Alignment Moments</span>
        </div>
        <div className="space-y-3">
          {moments.map((moment, i) => {
            const style = TYPE_STYLES[moment.type] || TYPE_STYLES.similar;
            return (
              <motion.div
                key={moment.id}
                variants={childFade}
                initial="initial"
                animate="animate"
                transition={{ delay: i * 0.06 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase border ${style.color} ${style.bg} ${style.border}`}>
                    {moment.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(moment.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center mb-3">
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-xs text-gray-500 block mb-1">Your Thought</span>
                    <p className="text-sm text-gray-200">{moment.user_thought}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
                  <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/10">
                    <span className="text-xs text-teal-400/60 block mb-1">Sallie&apos;s Thought</span>
                    <p className="text-sm text-gray-200">{moment.sallie_thought}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Score</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        moment.alignment_score > 0.7 ? 'bg-teal-400' :
                        moment.alignment_score > 0.4 ? 'bg-amber-400' : 'bg-red-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${moment.alignment_score * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-300">{Math.round(moment.alignment_score * 100)}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Detected Patterns</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern, i) => (
            <motion.div
              key={pattern.id}
              variants={childFade}
              initial="initial"
              animate="animate"
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">{pattern.name}</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">{pattern.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Frequency</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${pattern.frequency * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(pattern.frequency * 100)}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-teal-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${pattern.confidence * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(pattern.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AlignmentTracker;

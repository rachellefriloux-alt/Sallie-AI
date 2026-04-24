'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Target, Plus, Send, X, CheckCircle2, Clock,
  TrendingUp, AlertCircle, ChevronRight, Sparkles,
  Scale, ArrowRight, BarChart3, Lightbulb,
} from 'lucide-react';

interface DecisionOption {
  name: string;
  probability: number;
  pros: string[];
  cons: string[];
  alignment: number;
}

interface Decision {
  id: string;
  title: string;
  description: string | null;
  factors: string[];
  options: DecisionOption[];
  analysis: { recommendation: string } | null;
  chosenOption: string | null;
  status: string;
  domain: string;
  createdAt: string;
}

export function DeciderTool() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFactors, setNewFactors] = useState<string[]>([]);
  const [factorInput, setFactorInput] = useState('');

  const fetchDecisions = useCallback(async () => {
    try {
      const res = await fetch('/api/decider');
      if (res.ok) {
        const data = await res.json();
        setDecisions(data.decisions || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const addFactor = () => {
    if (factorInput.trim() && newFactors.length < 8) {
      setNewFactors([...newFactors, factorInput.trim()]);
      setFactorInput('');
    }
  };

  const removeFactor = (idx: number) => {
    setNewFactors(newFactors.filter((_, i) => i !== idx));
  };

  const analyzeDecision = async () => {
    if (!newTitle.trim()) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/decider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          factors: newFactors,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedDecision(data.decision);
        setShowNew(false);
        setNewTitle('');
        setNewDescription('');
        setNewFactors([]);
        fetchDecisions();
      }
    } catch {
    } finally {
      setAnalyzing(false);
    }
  };

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 0.7) return '#4ECDC4';
    if (alignment >= 0.4) return '#FFB347';
    return '#FF6B6B';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading decisions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-white">Decider</h2>
          <span className="text-xs text-gray-500">AI-powered decision analysis</span>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 text-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Decision
        </button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4"
          >
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">What decision are you facing?</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Should I take this job offer?"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-400/50"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Context (optional)</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Any details that matter for this decision..."
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-400/50 min-h-[60px] resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Factors to consider ({newFactors.length}/8)</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {newFactors.map((factor, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-500/10 text-teal-400 text-xs border border-teal-500/20"
                  >
                    {factor}
                    <button onClick={() => removeFactor(idx)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={factorInput}
                  onChange={(e) => setFactorInput(e.target.value)}
                  placeholder="e.g., salary, commute, growth"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-400/50"
                  onKeyDown={(e) => e.key === 'Enter' && addFactor()}
                />
                <button onClick={addFactor} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-sm">
                  Add
                </button>
              </div>
            </div>
            <button
              onClick={analyzeDecision}
              disabled={analyzing || !newTitle.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-violet-500/20 hover:from-teal-500/30 hover:to-violet-500/30 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                  Sallie is analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 text-teal-400" />
                  Analyze Decision
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDecision && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="space-y-4"
          >
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{selectedDecision.title}</h3>
                  {selectedDecision.description && (
                    <p className="text-xs text-gray-400">{selectedDecision.description}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDecision(null)}
                  className="text-gray-600 hover:text-gray-400 text-xs"
                >
                  close
                </button>
              </div>

              {selectedDecision.factors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedDecision.factors.map((f: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400 border border-white/8">
                      {f}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {(selectedDecision.options as DecisionOption[]).map((option, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-white/8 bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-white">{option.name}</h4>
                      <div className="flex items-center gap-3">
                        <div className="text-xs">
                          <span className="text-gray-500">Probability:</span>{' '}
                          <span className="text-white font-medium">{Math.round(option.probability * 100)}%</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Alignment:</span>{' '}
                          <span style={{ color: getAlignmentColor(option.alignment) }} className="font-medium">
                            {Math.round(option.alignment * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${option.alignment * 100}%`,
                          backgroundColor: getAlignmentColor(option.alignment),
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-green-400 uppercase tracking-wider font-medium mb-1 block">Pros</span>
                        <ul className="space-y-1">
                          {option.pros.map((p, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[10px] text-red-400 uppercase tracking-wider font-medium mb-1 block">Cons</span>
                        <ul className="space-y-1">
                          {option.cons.map((c, i) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                              <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedDecision.analysis?.recommendation && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-violet-500/10 border border-teal-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Sallie&apos;s Recommendation</span>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{selectedDecision.analysis.recommendation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {decisions.length > 0 && !selectedDecision && (
        <div className="space-y-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Previous Decisions</span>
          {decisions.map(decision => (
            <button
              key={decision.id}
              onClick={() => setSelectedDecision(decision)}
              className="w-full p-3 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.05] transition-colors text-left flex items-center gap-3"
            >
              <Scale className="w-4 h-4 text-gray-500" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white block truncate">{decision.title}</span>
                <span className="text-[10px] text-gray-600">
                  {new Date(decision.createdAt).toLocaleDateString()} &middot; {decision.status}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          ))}
        </div>
      )}

      {decisions.length === 0 && !showNew && (
        <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
          <Scale className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-300 mb-1">No decisions analyzed yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
            When you are facing a tough choice, Sallie breaks it down into factors, weighs the options
            against your values and goals, and gives you an honest recommendation.
          </p>
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 text-sm transition-colors"
          >
            Analyze Your First Decision
          </button>
        </div>
      )}
    </div>
  );
}

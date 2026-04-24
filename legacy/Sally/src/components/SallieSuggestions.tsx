'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, ChevronRight, Feather, AlertCircle } from 'lucide-react';

interface Suggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  icon: string;
}

interface SallieSuggestionsProps {
  domain: string;
  context?: string;
  accentColor: string;
  onNavigate?: (section: string) => void;
  maxSuggestions?: number;
}

export function SallieSuggestions({ domain, context, accentColor, onNavigate, maxSuggestions = 5 }: SallieSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sallie/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, context, currentTab: domain }),
      });
      if (!res.ok) throw new Error('Failed to get suggestions');
      const data = await res.json();
      setSuggestions((data.suggestions || []).slice(0, maxSuggestions));
      setHasLoaded(true);
    } catch (err) {
      setError('Could not load suggestions right now');
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [domain, context, maxSuggestions]);

  useEffect(() => {
    if (!hasLoaded) {
      fetchSuggestions();
    }
  }, [hasLoaded, fetchSuggestions]);

  const priorityColors: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
  };

  return (
    <motion.div
      className="rounded-2xl border relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, ${accentColor}06 100%)`,
        borderColor: `${accentColor}15`,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: `${accentColor}15` }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: accentColor }}>Sallie Suggests</h3>
            <p className="text-[10px] text-gray-500">Based on everything I know about you</p>
          </div>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          title="Refresh suggestions"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-4 pb-4">
        {loading && !hasLoaded && (
          <div className="flex items-center gap-3 py-6 justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Feather className="w-4 h-4" style={{ color: accentColor }} />
            </motion.div>
            <span className="text-sm text-gray-400">Sallie is thinking...</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 py-4 justify-center">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!loading && suggestions.length > 0 && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {suggestions.map((s, i) => (
                <motion.div
                  key={`${s.title}-${i}`}
                  className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer group hover:bg-white/[0.03] transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: `${accentColor}08`,
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ borderColor: `${accentColor}25` }}
                >
                  <span className="text-lg mt-0.5">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">{s.title}</p>
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: priorityColors[s.priority] || '#6b7280' }}
                        title={`${s.priority} priority`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0 mt-1" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && hasLoaded && suggestions.length === 0 && !error && (
          <div className="text-center py-6">
            <Feather className="w-5 h-5 mx-auto mb-2" style={{ color: `${accentColor}40` }} />
            <p className="text-sm text-gray-500">Chat with me so I can learn your needs and give personalized suggestions.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

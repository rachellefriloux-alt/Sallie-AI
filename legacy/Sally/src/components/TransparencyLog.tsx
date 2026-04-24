'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Clock, Shield, AlertTriangle, RefreshCw,
  Filter, ChevronDown, Eye, BarChart3,
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  args: Record<string, unknown>;
  result: string;
  advisoryLevel: 'safe' | 'caution' | 'warning';
  rollbackAvailable: boolean;
  userId: string;
}

interface LogStats {
  total: number;
  byCategory: Record<string, number>;
  byAdvisoryLevel: Record<string, number>;
}

const ADVISORY_CONFIG = {
  safe: { color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Shield, label: 'Safe' },
  caution: { color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle, label: 'Caution' },
  warning: { color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle, label: 'Warning' },
};

export function TransparencyLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [showStats, setShowStats] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [limit, setLimit] = useState(50);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), stats: 'true' });
      if (filterCategory !== 'all') params.set('category', filterCategory);
      if (filterLevel !== 'all') params.set('advisoryLevel', filterLevel);

      const res = await fetch(`/api/transparency/log?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.actions || []);
        setStats(data.stats || null);
      }
    } catch (e) {
      console.error('Failed to fetch transparency log:', e);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterLevel, limit]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  useEffect(() => {
    const interval = setInterval(fetchLog, 10000);
    return () => clearInterval(interval);
  }, [fetchLog]);

  const categories = stats ? Object.keys(stats.byCategory) : [];

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading action log...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Eye className="w-7 h-7 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Transparency Log</h1>
          </div>
          <p className="text-gray-400 text-sm">Every action Sallie takes, logged with full transparency</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              showStats
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Stats
          </button>
          <button
            onClick={fetchLog}
            className="p-2 rounded-lg border border-white/5 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {showStats && stats && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-gray-500 mb-1">Total Actions</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-gray-500 mb-2">By Category</p>
            <div className="space-y-1">
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{cat}</span>
                  <span className="text-gray-300 font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-gray-500 mb-2">By Advisory Level</p>
            <div className="space-y-1">
              {Object.entries(stats.byAdvisoryLevel).map(([level, count]) => {
                const cfg = ADVISORY_CONFIG[level as keyof typeof ADVISORY_CONFIG];
                return (
                  <div key={level} className="flex items-center justify-between text-xs">
                    <span style={{ color: cfg?.color || '#6b7280' }}>{cfg?.label || level}</span>
                    <span className="text-gray-300 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowCatDropdown(!showCatDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {filterCategory === 'all' ? 'All Categories' : filterCategory}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showCatDropdown && (
            <div className="absolute top-full mt-1 left-0 z-50 w-48 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-xl overflow-hidden">
              <button
                onClick={() => { setFilterCategory('all'); setShowCatDropdown(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${filterCategory === 'all' ? 'text-teal-400' : 'text-gray-300'}`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setFilterCategory(cat); setShowCatDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${filterCategory === cat ? 'text-teal-400' : 'text-gray-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
          {(['all', 'safe', 'caution', 'warning'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterLevel === level
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none"
        >
          <option value={25}>25 entries</option>
          <option value={50}>50 entries</option>
          <option value={100}>100 entries</option>
        </select>
      </div>

      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No actions logged yet</p>
            <p className="text-gray-500 text-xs mt-1">Actions will appear here as Sallie operates</p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const advisory = ADVISORY_CONFIG[entry.advisoryLevel];
            const AdvisoryIcon = advisory.icon;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${advisory.bg} ${advisory.border}`} style={{ color: advisory.color }}>
                      <AdvisoryIcon className="w-3 h-3" />
                      {advisory.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
                      {entry.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(entry.timestamp)}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-200 mb-1">{entry.action}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Result: <span className={entry.result === 'success' ? 'text-emerald-400' : 'text-gray-400'}>{entry.result}</span></span>
                  <span>User: {entry.userId}</span>
                  {entry.rollbackAvailable && (
                    <span className="text-amber-400">Rollback Available</span>
                  )}
                </div>
                {Object.keys(entry.args).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">View Arguments</summary>
                    <pre className="mt-1 text-xs text-gray-500 bg-white/[0.02] p-2 rounded-lg overflow-x-auto">
                      {JSON.stringify(entry.args, null, 2)}
                    </pre>
                  </details>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

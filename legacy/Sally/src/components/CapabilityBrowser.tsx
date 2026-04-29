'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, RefreshCw, Grid, List,
  CheckCircle, AlertTriangle, XCircle,
  Brain, Eye, Music, Code, Database, FileText,
  Briefcase, GraduationCap, Sparkles, Cpu,
  Heart, Zap, Users, ChevronDown,
} from 'lucide-react';

interface Capability {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'available' | 'unavailable' | 'partial';
  provider: string;
  requiresAuth: boolean;
}

interface CapabilitySummary {
  total: number;
  available: number;
  partial: number;
  unavailable: number;
  byCategory: Record<string, { total: number; available: number; partial: number; unavailable: number }>;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Language: Brain,
  Vision: Eye,
  Audio: Music,
  Code: Code,
  Data: Database,
  Content: FileText,
  'Project Management': Briefcase,
  Learning: GraduationCap,
  Creative: Sparkles,
  Automation: Cpu,
  Memory: Database,
  'Emotional Intelligence': Heart,
  Agency: Zap,
};

const CATEGORY_COLORS: Record<string, string> = {
  Language: '#2dd4bf',
  Vision: '#a78bfa',
  Audio: '#f59e0b',
  Code: '#3b82f6',
  Data: '#10b981',
  Content: '#ec4899',
  'Project Management': '#D4AF37',
  Learning: '#f97316',
  Creative: '#8b5cf6',
  Automation: '#06b6d4',
  Memory: '#14b8a6',
  'Emotional Intelligence': '#ef4444',
  Agency: '#22c55e',
};

const STATUS_CONFIG = {
  available: { icon: CheckCircle, color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Available' },
  partial: { icon: AlertTriangle, color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Partial' },
  unavailable: { icon: XCircle, color: '#ef4444', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Unavailable' },
};

export function CapabilityBrowser() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [summary, setSummary] = useState<CapabilitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const fetchCapabilities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/capabilities');
      if (res.ok) {
        const data = await res.json();
        setCapabilities(data.capabilities || []);
        setSummary(data.summary || null);
      }
    } catch (e) {
      console.error('Failed to fetch capabilities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapabilities();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(capabilities.map((c) => c.category))];
    return cats.sort();
  }, [capabilities]);

  const filtered = useMemo(() => {
    let result = capabilities;
    if (selectedCategory !== 'all') {
      result = result.filter((c) => c.category === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      result = result.filter((c) => c.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q)
      );
    }
    return result;
  }, [capabilities, selectedCategory, selectedStatus, searchQuery]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Capability[]> = {};
    for (const cap of filtered) {
      if (!groups[cap.category]) groups[cap.category] = [];
      groups[cap.category].push(cap);
    }
    return groups;
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading capabilities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Cpu className="w-7 h-7 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Capability Browser</h1>
          </div>
          <p className="text-gray-400 text-sm">Browse all of Sallie&apos;s capabilities across every domain</p>
        </div>
        <button
          onClick={fetchCapabilities}
          className="p-2 rounded-lg border border-white/5 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{summary.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-xs text-gray-500 mb-1">Available</p>
            <p className="text-2xl font-bold text-emerald-400">{summary.available}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-gray-500 mb-1">Partial</p>
            <p className="text-2xl font-bold text-amber-400">{summary.partial}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-xs text-gray-500 mb-1">Unavailable</p>
            <p className="text-2xl font-bold text-red-400">{summary.unavailable}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search capabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
            <ChevronDown className="w-3 h-3" />
          </button>
          <AnimatePresence>
            {showCategoryDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full mt-1 left-0 z-50 w-56 bg-[#1a1f2e] border border-white/10 rounded-lg shadow-xl overflow-hidden"
              >
                <button
                  onClick={() => { setSelectedCategory('all'); setShowCategoryDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${selectedCategory === 'all' ? 'text-teal-400' : 'text-gray-300'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setShowCategoryDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${selectedCategory === cat ? 'text-teal-400' : 'text-gray-300'}`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
          {(['all', 'available', 'partial', 'unavailable'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedStatus === s
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        Showing {filtered.length} of {capabilities.length} capabilities
      </div>

      {Object.entries(groupedByCategory).map(([category, caps]) => {
        const Icon = CATEGORY_ICONS[category] || Cpu;
        const color = CATEGORY_COLORS[category] || '#6b7280';
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{category}</h3>
              <span className="text-xs text-gray-400 ml-1">({caps.length})</span>
            </div>

            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'space-y-2'
            }>
              {caps.map((cap, i) => {
                const statusCfg = STATUS_CONFIG[cap.status];
                const StatusIcon = statusCfg.icon;
                return (
                  <motion.div
                    key={cap.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 ${
                      viewMode === 'list' ? 'flex items-center gap-4' : ''
                    }`}
                  >
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-white">{cap.name}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.bg} ${statusCfg.border}`} style={{ color: statusCfg.color }}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{cap.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10">
                          {cap.provider}
                        </span>
                        {cap.requiresAuth && (
                          <span className="text-xs text-amber-400/70">Auth Required</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No capabilities match your filters</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedStatus('all'); }}
            className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Tag, Brain, Database, Activity, Plus, Trash2, X, RefreshCw } from 'lucide-react';

interface MemoryEntry {
  id: string;
  content: string;
  category: string;
  tags: string[];
  importance: number;
  createdAt: string;
  lastAccessedAt: string;
  accessCount: number;
  relevance?: number;
}

interface MemoryDashboardProps {
  className?: string;
}

const CATEGORIES = ['general', 'conversation', 'observation', 'learning', 'heritage', 'decision', 'reflection', 'insight', 'goal', 'event', 'fact'];

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    general: '#8b949e',
    conversation: '#a78bfa',
    observation: '#3b82f6',
    learning: '#10b981',
    heritage: '#f59e0b',
    decision: '#8b5cf6',
    reflection: '#6366f1',
    insight: '#ec4899',
    goal: '#f97316',
    event: '#84cc16',
    fact: '#6b7280',
  };
  return colors[category] || '#8b949e';
}

export const MemoryDashboard: React.FC<MemoryDashboardProps> = ({ className }) => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState('general');
  const [newMemoryTags, setNewMemoryTags] = useState('');
  const [newMemoryImportance, setNewMemoryImportance] = useState(0.5);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMemories = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.set('action', 'search');
        params.set('query', searchQuery.trim());
      } else {
        params.set('action', 'list');
      }

      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }

      params.set('limit', '50');

      const res = await fetch(`/api/tools/memory?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load memories: ${res.status}`);
      }

      const data = await res.json();
      setMemories(data.memories || []);
      if (data.total !== undefined) setTotalCount(data.total);
      if (data.count !== undefined) setTotalCount(data.count);
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error('Failed to load memories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load memories');
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadMemories();
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      loadMemories();
    }
  }, [searchQuery, selectedCategory]);

  const handleCreateMemory = useCallback(async () => {
    if (!newMemoryContent.trim()) return;
    setIsCreating(true);
    setError(null);

    try {
      const tags = newMemoryTags.split(',').map(t => t.trim()).filter(Boolean);

      const res = await fetch('/api/tools/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMemoryContent.trim(),
          category: newMemoryCategory,
          tags,
          importance: newMemoryImportance,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create memory');
      }

      const data = await res.json();
      if (data.memory) {
        setMemories(prev => [data.memory, ...prev]);
        setTotalCount(prev => prev + 1);
      }
      setNewMemoryContent('');
      setNewMemoryTags('');
      setNewMemoryCategory('general');
      setNewMemoryImportance(0.5);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create memory:', err);
      setError(err instanceof Error ? err.message : 'Failed to create memory');
    } finally {
      setIsCreating(false);
    }
  }, [newMemoryContent, newMemoryCategory, newMemoryTags, newMemoryImportance]);

  const handleDeleteMemory = useCallback(async (memoryId: string) => {
    setDeletingId(memoryId);
    setError(null);

    try {
      const res = await fetch(`/api/tools/memory?id=${encodeURIComponent(memoryId)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete memory');
      }

      setMemories(prev => prev.filter(m => m.id !== memoryId));
      setTotalCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete memory:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete memory');
    } finally {
      setDeletingId(null);
    }
  }, []);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className}`}>
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-white/10 border-t-teal-400 animate-spin" />
          <Brain className="absolute inset-0 m-auto h-6 w-6 text-teal-400/60" />
        </div>
        <p className="mt-4 text-sm text-gray-400">Loading memories...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <Brain className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Memory Dashboard</h2>
              <p className="text-xs text-gray-500">{totalCount} memories stored</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadMemories()}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-teal-400 hover:border-teal-500/30 transition-all duration-300"
              title="Refresh memories"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white font-medium hover:from-teal-500 hover:to-teal-400 transition-all duration-300 shadow-lg shadow-teal-500/20"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">New Memory</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-lg bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-300/70 font-medium">Total</p>
                <p className="text-lg font-bold text-violet-300">{totalCount}</p>
              </div>
              <Database className="h-5 w-5 text-violet-400/50" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-300/70 font-medium">Categories</p>
                <p className="text-lg font-bold text-amber-300">{categories.length}</p>
              </div>
              <Tag className="h-5 w-5 text-amber-400/50" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-teal-300/70 font-medium">Showing</p>
                <p className="text-lg font-bold text-teal-300">{memories.length}</p>
              </div>
              <Activity className="h-5 w-5 text-teal-400/50" />
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all duration-300 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
              }`}
            >
              All
            </button>
            {(categories.length > 0 ? categories : CATEGORIES.slice(0, 5)).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 capitalize ${
                  selectedCategory === cat
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 mb-4 rounded-lg bg-gradient-to-br from-teal-500/5 to-violet-500/5 border border-teal-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-teal-300 text-sm">Create New Memory</h3>
                  <button onClick={() => setShowCreateForm(false)} className="p-1 text-gray-500 hover:text-gray-300">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <textarea
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    placeholder="What do you want to remember..."
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/30 transition-all duration-300 text-sm resize-none"
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select
                        value={newMemoryCategory}
                        onChange={(e) => setNewMemoryCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                        aria-label="Memory category"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-[#1a1f2e] capitalize">{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={newMemoryTags}
                        onChange={(e) => setNewMemoryTags(e.target.value)}
                        placeholder="tag1, tag2"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Importance: {(newMemoryImportance * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={newMemoryImportance}
                      onChange={(e) => setNewMemoryImportance(parseFloat(e.target.value))}
                      className="w-full accent-teal-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleCreateMemory}
                      disabled={!newMemoryContent.trim() || isCreating}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      {isCreating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {isCreating ? 'Saving...' : 'Save Memory'}
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-sm hover:text-gray-200 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {memories.map((memory) => {
            const catColor = getCategoryColor(memory.category);
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 text-xs font-medium rounded-full capitalize"
                        style={{
                          backgroundColor: catColor + '18',
                          color: catColor,
                          border: `1px solid ${catColor}30`,
                        }}
                      >
                        {memory.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(memory.createdAt)}
                      </span>
                      {memory.relevance !== undefined && (
                        <span className="text-xs text-amber-400/70">
                          {(memory.relevance * 100).toFixed(0)}% match
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-300 mb-2 leading-relaxed">
                      {memory.content.length > 200 ? memory.content.slice(0, 200) + '...' : memory.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {(memory.importance * 100).toFixed(0)}% importance
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(memory.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="h-3 w-3" />
                        {memory.accessCount} views
                      </span>
                    </div>

                    {memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {memory.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-white/5 text-gray-400 rounded-full border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteMemory(memory.id)}
                    disabled={deletingId === memory.id}
                    className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
                    aria-label={`Delete memory`}
                    title="Delete memory"
                  >
                    {deletingId === memory.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}

          {memories.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4">
                <Brain className="h-10 w-10 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium mb-1">No memories found</p>
              <p className="text-sm text-gray-600 max-w-xs">
                {searchQuery
                  ? 'Try a different search or clear filters'
                  : 'Create your first memory to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm hover:bg-teal-500/20 transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                  Create Memory
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="p-1 text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryDashboard;

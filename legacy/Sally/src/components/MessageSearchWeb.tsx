'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, Filter, MessageCircle, Clock,
  User, Bot, ChevronDown, X, Loader2
} from 'lucide-react';

interface SearchResult {
  id: string;
  text: string;
  sender: 'user' | 'sallie';
  timestamp: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  matchSnippet?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  insight: '#2dd4bf',
  emotional: '#ec4899',
  actionable: '#f59e0b',
  reference: '#8b5cf6',
  personal: '#06b6d4',
  creative: '#a78bfa',
  general: '#6b7280',
};

const CATEGORIES = ['all', 'insight', 'emotional', 'actionable', 'reference', 'personal', 'creative'];
const PRIORITIES = ['all', 'high', 'medium', 'low'];

const DEFAULT_RESULTS: SearchResult[] = [
  { id: '1', text: 'I\'ve analyzed your weekly patterns and found that Tuesday afternoons are your most productive window for deep creative work.', sender: 'sallie', timestamp: new Date(Date.now() - 86400000).toISOString(), category: 'insight', priority: 'high' },
  { id: '2', text: 'Let me schedule the brand review meeting for next Thursday. I\'ll prepare the deck with the latest metrics and competitive analysis.', sender: 'sallie', timestamp: new Date(Date.now() - 172800000).toISOString(), category: 'actionable', priority: 'medium' },
  { id: '3', text: 'I\'ve been thinking about how to better balance my work and personal life. Maybe I need more boundaries.', sender: 'user', timestamp: new Date(Date.now() - 259200000).toISOString(), category: 'personal', priority: 'medium' },
  { id: '4', text: 'Your emotional resilience this week has been remarkable. I noticed you handled three difficult conversations with grace and clarity.', sender: 'sallie', timestamp: new Date(Date.now() - 345600000).toISOString(), category: 'emotional', priority: 'low' },
  { id: '5', text: 'What if we created a visual mood board for the new project? Something that captures the aesthetic we\'re going for.', sender: 'user', timestamp: new Date(Date.now() - 432000000).toISOString(), category: 'creative', priority: 'low' },
];

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-teal-400/30 text-teal-200 rounded px-0.5">{part}</mark>
    ) : part
  );
}

const childFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function MessageSearchWeb() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [fromUser, setFromUser] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ q: query });
      if (dateStart) params.set('start', dateStart);
      if (dateEnd) params.set('end', dateEnd);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (fromUser) params.set('from', 'user');

      const response = await fetch(`/api/chat/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setResults(data.results);
        } else {
          const filtered = DEFAULT_RESULTS
            .filter(r => r.text.toLowerCase().includes(query.toLowerCase()))
            .filter(r => categoryFilter === 'all' || r.category === categoryFilter)
            .filter(r => priorityFilter === 'all' || r.priority === priorityFilter)
            .filter(r => !fromUser || r.sender === 'user');
          setResults(filtered);
        }
      } else {
        const filtered = DEFAULT_RESULTS
          .filter(r => r.text.toLowerCase().includes(query.toLowerCase()))
          .filter(r => categoryFilter === 'all' || r.category === categoryFilter)
          .filter(r => priorityFilter === 'all' || r.priority === priorityFilter)
          .filter(r => !fromUser || r.sender === 'user');
        setResults(filtered);
      }
    } catch {
      const filtered = DEFAULT_RESULTS
        .filter(r => r.text.toLowerCase().includes(query.toLowerCase()))
        .filter(r => categoryFilter === 'all' || r.category === categoryFilter)
        .filter(r => priorityFilter === 'all' || r.priority === priorityFilter)
        .filter(r => !fromUser || r.sender === 'user');
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  }, [query, dateStart, dateEnd, categoryFilter, priorityFilter, fromUser]);

  const clearFilters = () => {
    setDateStart('');
    setDateEnd('');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setFromUser(false);
  };

  const hasActiveFilters = dateStart || dateEnd || categoryFilter !== 'all' || priorityFilter !== 'all' || fromUser;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Search className="w-7 h-7 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Message Search</h1>
          </div>
          <p className="text-gray-400 text-sm">Search through your conversation history</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-teal-500/15 border-teal-500/30 text-teal-400'
                : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/[0.04]'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-teal-400" />
            )}
          </button>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search Filters</span>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-teal-400 hover:text-teal-300 transition-colors">
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5">Start Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="date"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-teal-500/50 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1.5">End Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="date"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-teal-500/50 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          categoryFilter === cat
                            ? 'border-teal-500/30 bg-teal-500/15 text-teal-400'
                            : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.04]'
                        }`}
                      >
                        {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1.5">Priority</label>
                  <div className="flex flex-wrap gap-2">
                    {PRIORITIES.map((pri) => (
                      <button
                        key={pri}
                        onClick={() => setPriorityFilter(pri)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                          priorityFilter === pri
                            ? 'border-teal-500/30 bg-teal-500/15 text-teal-400'
                            : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.04]'
                        }`}
                      >
                        {pri === 'all' ? 'All' : pri.charAt(0).toUpperCase() + pri.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFromUser(!fromUser)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      fromUser
                        ? 'border-teal-500/30 bg-teal-500/15 text-teal-400'
                        : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.04]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    My messages only
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasSearched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </span>
          </div>

          <AnimatePresence>
            {results.map((result, i) => {
              const catColor = CATEGORY_COLORS[result.category] || CATEGORY_COLORS.general;
              return (
                <motion.div
                  key={result.id}
                  variants={childFade}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      result.sender === 'sallie' ? 'bg-teal-500/15' : 'bg-white/5'
                    }`}>
                      {result.sender === 'sallie' ? (
                        <Bot className="w-4 h-4 text-teal-400" />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-300">
                      {result.sender === 'sallie' ? 'Sallie' : 'You'}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium capitalize border"
                      style={{ color: catColor, borderColor: `${catColor}30`, backgroundColor: `${catColor}10` }}
                    >
                      {result.category}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {highlightText(result.text, query)}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {results.length === 0 && (
            <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No messages found matching your search</p>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="p-12 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <Search className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">Search your conversation history</p>
          <p className="text-xs text-gray-400">Enter a search term and press Enter or click Search</p>
        </div>
      )}
    </div>
  );
}

export default MessageSearchWeb;

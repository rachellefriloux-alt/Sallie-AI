'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, Search, SortAsc, SortDesc, Tag, Filter,
  MessageCircle, Clock, Star, Archive, Trash2,
  StickyNote, ChevronDown, X, Edit3
} from 'lucide-react';

interface BookmarkedMessage {
  id: string;
  text: string;
  sender: 'user' | 'sallie';
  timestamp: string;
  note?: string;
  tags: string[];
  category: string;
  priority: 'high' | 'medium' | 'low';
  archived: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  insight: '#2dd4bf',
  emotional: '#ec4899',
  actionable: '#f59e0b',
  reference: '#8b5cf6',
  personal: '#06b6d4',
  creative: '#a78bfa',
};

const PRIORITY_STYLES: Record<string, { color: string; label: string }> = {
  high: { color: '#ef4444', label: 'High' },
  medium: { color: '#f59e0b', label: 'Medium' },
  low: { color: '#6b7280', label: 'Low' },
};

const CATEGORIES = ['all', 'insight', 'emotional', 'actionable', 'reference', 'personal', 'creative'];

const DEFAULT_BOOKMARKS: BookmarkedMessage[] = [
  { id: '1', text: 'I\'ve noticed your creative output peaks when you allow yourself unstructured thinking time. Consider blocking 30 minutes of "wandering" time each morning.', sender: 'sallie', timestamp: new Date().toISOString(), note: 'Great insight about creativity', tags: ['creativity', 'routine'], category: 'insight', priority: 'high', archived: false },
  { id: '2', text: 'That conversation about your mother really resonated with me. The way you described her strength — I see that same resilience in you.', sender: 'sallie', timestamp: new Date(Date.now() - 86400000).toISOString(), note: '', tags: ['family', 'heritage'], category: 'emotional', priority: 'medium', archived: false },
  { id: '3', text: 'Here\'s my action plan for the Q2 launch: 1) Finalize brand guidelines by March 1, 2) Schedule stakeholder review, 3) Begin content production pipeline', sender: 'user', timestamp: new Date(Date.now() - 172800000).toISOString(), tags: ['business', 'planning'], category: 'actionable', priority: 'high', archived: false },
  { id: '4', text: 'The breathing technique I shared — 4-7-8 pattern — has shown 62% stress reduction in users who practice it consistently for 2 weeks.', sender: 'sallie', timestamp: new Date(Date.now() - 259200000).toISOString(), note: 'Try this before meetings', tags: ['wellness', 'stress'], category: 'reference', priority: 'medium', archived: false },
  { id: '5', text: 'What if we reimagined the onboarding flow as a story? Each step reveals a new chapter of the user\'s journey with Sallie.', sender: 'user', timestamp: new Date(Date.now() - 345600000).toISOString(), tags: ['design', 'ux'], category: 'creative', priority: 'low', archived: false },
];

const childFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function MessageBookmarksWeb() {
  const [bookmarks, setBookmarks] = useState<BookmarkedMessage[]>(DEFAULT_BOOKMARKS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch('/api/chat/messages?bookmarked=true');
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            setBookmarks(data.messages);
          }
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags)));

  const filtered = bookmarks
    .filter(b => !b.archived)
    .filter(b => categoryFilter === 'all' || b.category === categoryFilter)
    .filter(b => !tagFilter || b.tags.includes(tagFilter))
    .filter(b => !searchQuery || b.text.toLowerCase().includes(searchQuery.toLowerCase()) || b.note?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        const diff = order[b.priority] - order[a.priority];
        return sortAsc ? -diff : diff;
      }
      const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortAsc ? -diff : diff;
    });

  const handleAddNote = (id: string) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, note: noteText } : b));
    setEditingNote(null);
    setNoteText('');
  };

  const handleArchive = (id: string) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, archived: true } : b));
  };

  const handleRemove = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Bookmark className="w-7 h-7 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Message Bookmarks</h1>
          </div>
          <p className="text-gray-400 text-sm">Your saved messages and important moments</p>
        </div>
        <span className="text-sm text-gray-500">{filtered.length} bookmarks</span>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20"
          />
        </div>
        <button
          onClick={() => { setSortBy(sortBy === 'date' ? 'priority' : 'date'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
        >
          {sortAsc ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          {sortBy === 'date' ? 'Date' : 'Priority'}
        </button>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all"
        >
          {sortAsc ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

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

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Tag className="w-4 h-4 text-gray-500 mt-0.5" />
          {tagFilter && (
            <button onClick={() => setTagFilter(null)} className="flex items-center gap-1 px-2 py-1 rounded-md bg-teal-500/15 border border-teal-500/20 text-xs text-teal-400">
              #{tagFilter} <X className="w-3 h-3" />
            </button>
          )}
          {allTags.filter(t => t !== tagFilter).map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((bookmark, i) => {
            const catColor = CATEGORY_COLORS[bookmark.category] || '#6b7280';
            const priStyle = PRIORITY_STYLES[bookmark.priority];
            return (
              <motion.div
                key={bookmark.id}
                variants={childFade}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize border"
                    style={{ color: catColor, borderColor: `${catColor}30`, backgroundColor: `${catColor}10` }}
                  >
                    {bookmark.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priStyle.color }} />
                    <span className="text-xs text-gray-500">{priStyle.label}</span>
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {bookmark.sender === 'sallie' ? 'Sallie' : 'You'}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(bookmark.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-gray-300 mb-3 leading-relaxed">{bookmark.text}</p>

                {bookmark.note && editingNote !== bookmark.id && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/5 mb-3">
                    <StickyNote className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400">{bookmark.note}</p>
                  </div>
                )}

                {editingNote === bookmark.id && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
                      autoFocus
                    />
                    <button
                      onClick={() => handleAddNote(bookmark.id)}
                      className="px-3 py-2 bg-teal-500 text-white text-xs rounded-lg hover:bg-teal-400 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingNote(null); setNoteText(''); }}
                      className="px-3 py-2 text-gray-400 text-xs rounded-lg hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {bookmark.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-gray-500">#{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingNote(bookmark.id); setNoteText(bookmark.note || ''); }}
                      className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
                      title="Add note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchive(bookmark.id)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-amber-400 hover:bg-white/5 transition-all"
                      title="Archive"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(bookmark.id)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-white/5 transition-all"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <Bookmark className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No bookmarks found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBookmarksWeb;

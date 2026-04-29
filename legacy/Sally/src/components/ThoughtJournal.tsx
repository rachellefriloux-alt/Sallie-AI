'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Send, Tag, Sliders, Filter, Clock,
  Lightbulb, Heart, Target, Brain, Plus, X
} from 'lucide-react';

interface JournalEntry {
  id: string;
  content: string;
  type: 'thought' | 'feeling' | 'insight' | 'goal';
  intensity: number;
  tags: string[];
  emotion?: string;
  timestamp: string;
}

const TYPE_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  thought: { color: '#2dd4bf', icon: <Brain className="w-3.5 h-3.5" />, label: 'Thought' },
  feeling: { color: '#ec4899', icon: <Heart className="w-3.5 h-3.5" />, label: 'Feeling' },
  insight: { color: '#f59e0b', icon: <Lightbulb className="w-3.5 h-3.5" />, label: 'Insight' },
  goal: { color: '#8b5cf6', icon: <Target className="w-3.5 h-3.5" />, label: 'Goal' },
};

const EMOTIONS = [
  { name: 'happy', emoji: '😊' },
  { name: 'curious', emoji: '🤔' },
  { name: 'contemplative', emoji: '🧘' },
  { name: 'excited', emoji: '🎉' },
  { name: 'calm', emoji: '😌' },
  { name: 'frustrated', emoji: '😤' },
  { name: 'anxious', emoji: '😰' },
  { name: 'confident', emoji: '💪' },
  { name: 'grateful', emoji: '🙏' },
  { name: 'thoughtful', emoji: '💭' },
];

const DEFAULT_ENTRIES: JournalEntry[] = [
  { id: '1', content: 'Had a breakthrough realization about how my morning routine affects my entire day\'s productivity', type: 'insight', intensity: 0.9, tags: ['productivity', 'routine'], emotion: 'excited', timestamp: new Date().toISOString() },
  { id: '2', content: 'Feeling really grateful for the support system I have. Need to express that more often.', type: 'feeling', intensity: 0.85, tags: ['gratitude', 'relationships'], emotion: 'grateful', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', content: 'Set a goal to read 2 books this month on leadership and emotional intelligence', type: 'goal', intensity: 0.7, tags: ['reading', 'growth'], emotion: 'confident', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '4', content: 'Wondering if I should restructure how I approach creative work — maybe batch similar tasks', type: 'thought', intensity: 0.6, tags: ['creativity', 'workflow'], emotion: 'contemplative', timestamp: new Date(Date.now() - 10800000).toISOString() },
];

const childFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function ThoughtJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(DEFAULT_ENTRIES);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<'thought' | 'feeling' | 'insight' | 'goal'>('thought');
  const [newIntensity, setNewIntensity] = useState(0.5);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/monologue/thoughts');
        if (response.ok) {
          const data = await response.json();
          if (data.entries && data.entries.length > 0) {
            setEntries(data.entries);
          }
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setSubmitting(true);

    const entry: JournalEntry = {
      id: Date.now().toString(),
      content: newContent,
      type: newType,
      intensity: newIntensity,
      tags: newTags,
      emotion: selectedEmotion || undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/monologue/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.entry) {
          setEntries(prev => [data.entry, ...prev]);
        } else {
          setEntries(prev => [entry, ...prev]);
        }
      } else {
        setEntries(prev => [entry, ...prev]);
      }
    } catch {
      setEntries(prev => [entry, ...prev]);
    } finally {
      setNewContent('');
      setNewTags([]);
      setTagInput('');
      setSelectedEmotion(null);
      setNewIntensity(0.5);
      setSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !newTags.includes(tag)) {
      setNewTags(prev => [...prev, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewTags(prev => prev.filter(t => t !== tag));
  };

  const filteredEntries = filterType === 'all' ? entries : entries.filter(e => e.type === filterType);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <BookOpen className="w-7 h-7 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Thought Journal</h1>
          </div>
          <p className="text-gray-400 text-sm">Capture your thoughts, feelings, insights, and goals</p>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 resize-none"
        />

        <div className="flex flex-wrap gap-2">
          {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map((type) => {
            const config = TYPE_CONFIG[type];
            const isActive = newType === type;
            return (
              <button
                key={type}
                onClick={() => setNewType(type as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  isActive ? 'border-opacity-40' : 'border-white/5 bg-white/[0.02] text-gray-400 hover:bg-white/[0.04]'
                }`}
                style={isActive ? { color: config.color, borderColor: `${config.color}40`, backgroundColor: `${config.color}15` } : {}}
              >
                {config.icon}
                {config.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Sliders className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">Intensity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={newIntensity * 100}
              onChange={(e) => setNewIntensity(Number(e.target.value) / 100)}
              className="flex-1 accent-teal-400 h-1"
            />
            <span className="text-xs text-teal-400 font-medium w-8">{Math.round(newIntensity * 100)}%</span>
          </div>
        </div>

        <div>
          <span className="text-xs text-gray-500 block mb-2">How are you feeling?</span>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((emo) => (
              <button
                key={emo.name}
                onClick={() => setSelectedEmotion(selectedEmotion === emo.name ? null : emo.name)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                  selectedEmotion === emo.name
                    ? 'bg-teal-500/15 border-teal-500/30 text-teal-400'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/[0.04]'
                }`}
              >
                {emo.emoji} {emo.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {newTags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-xs text-teal-400">
                #{tag}
                <button onClick={() => handleRemoveTag(tag)} className="hover:text-white transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              placeholder="Add tag..."
              className="px-2 py-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none min-w-[80px]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!newContent.trim() || submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterType === 'all' ? 'bg-teal-500/15 text-teal-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          All
        </button>
        {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map((type) => {
          const config = TYPE_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === type ? 'bg-teal-500/15' : 'text-gray-500 hover:text-gray-300'
              }`}
              style={filterType === type ? { color: config.color } : {}}
            >
              {config.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredEntries.map((entry, i) => {
            const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.thought;
            return (
              <motion.div
                key={entry.id}
                variants={childFade}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase border"
                    style={{ color: config.color, borderColor: `${config.color}30`, backgroundColor: `${config.color}10` }}
                  >
                    {config.icon}
                    {config.label}
                  </span>
                  {entry.emotion && (
                    <span className="text-xs text-gray-500">
                      {EMOTIONS.find(e => e.name === entry.emotion)?.emoji} {entry.emotion}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-3">{entry.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-gray-500">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: config.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.intensity * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{Math.round(entry.intensity * 100)}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filteredEntries.length === 0 && (
          <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center">
            <p className="text-gray-500">No entries found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ThoughtJournal;

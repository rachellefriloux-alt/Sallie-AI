'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, PenTool, FileText,
  BarChart3, Lightbulb,
  Sparkles, Zap, ArrowRight,
  Copy, Check, Loader2, Send, ChevronDown,
  BookOpen, Calculator, ClipboardList,
  GraduationCap, Search, FileSearch,
  DollarSign, Scale, Languages,
  MessageSquare,
} from 'lucide-react';

interface AbilityConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: string;
  endpoint: string;
  placeholder: string;
  examples: string[];
  extraFields?: { key: string; label: string; options?: string[] }[];
}

const ABILITIES: AbilityConfig[] = [
  {
    id: 'coding',
    name: 'Code Generation',
    description: 'Build apps, scripts, automations, websites',
    icon: <Code className="w-5 h-5" />,
    color: '#22c55e',
    category: 'Create',
    endpoint: '/api/abilities/code',
    placeholder: 'Describe what you want to build...',
    examples: ['Build a REST API with Express', 'Write a Python script to scrape data', 'Create a React login form'],
    extraFields: [{ key: 'language', label: 'Language', options: ['Any', 'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C#', 'HTML/CSS'] }],
  },
  {
    id: 'writing',
    name: 'Writing',
    description: 'Essays, emails, stories, scripts, copy, social posts',
    icon: <PenTool className="w-5 h-5" />,
    color: '#8b5cf6',
    category: 'Create',
    endpoint: '/api/abilities/write',
    placeholder: 'What do you want to write?',
    examples: ['Draft a professional email to a client', 'Write a blog post about AI trends', 'Create a compelling product description'],
    extraFields: [{ key: 'type', label: 'Type', options: ['general', 'email', 'essay', 'story', 'social-post', 'blog', 'letter'] }],
  },
  {
    id: 'brainstorm',
    name: 'Brainstorming',
    description: 'Ideation, creative problem solving, strategy',
    icon: <Lightbulb className="w-5 h-5" />,
    color: '#eab308',
    category: 'Think',
    endpoint: '/api/abilities/brainstorm',
    placeholder: 'What topic do you want to brainstorm?',
    examples: ['Business ideas for a side hustle', 'Marketing strategies for a new app', 'Creative solutions for team burnout'],
  },
  {
    id: 'analyze',
    name: 'Data Analysis',
    description: 'Analyze data, find insights, get recommendations',
    icon: <BarChart3 className="w-5 h-5" />,
    color: '#14b8a6',
    category: 'Analyze',
    endpoint: '/api/abilities/analyze',
    placeholder: 'Paste data or text to analyze...',
    examples: ['Analyze this sales report', 'Find patterns in customer feedback', 'Evaluate pros and cons of a business decision'],
    extraFields: [{ key: 'question', label: 'Specific question (optional)' }],
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Condense articles, documents, meetings, or any text',
    icon: <FileSearch className="w-5 h-5" />,
    color: '#06b6d4',
    category: 'Analyze',
    endpoint: '/api/abilities/summarize',
    placeholder: 'Paste the text you want summarized...',
    examples: ['Summarize this article in 3 bullet points', 'Give me the key takeaways from this meeting', 'Condense this report into an executive summary'],
    extraFields: [{ key: 'format', label: 'Format', options: ['paragraph', 'bullets', 'executive-summary', 'tldr'] }],
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Deep research on any topic with organized findings',
    icon: <Search className="w-5 h-5" />,
    color: '#3b82f6',
    category: 'Think',
    endpoint: '/api/abilities/research',
    placeholder: 'What topic do you want to research?',
    examples: ['Research the pros and cons of remote work', 'What are the latest trends in AI for small businesses?', 'Compare different project management methodologies'],
  },
  {
    id: 'planning',
    name: 'Planning',
    description: 'Create action plans, project plans, timelines, and roadmaps',
    icon: <ClipboardList className="w-5 h-5" />,
    color: '#f97316',
    category: 'Think',
    endpoint: '/api/abilities/plan',
    placeholder: 'What do you need to plan?',
    examples: ['Create a 30-day business launch plan', 'Plan a week of healthy meals', 'Build a project timeline for a website redesign'],
    extraFields: [{ key: 'timeframe', label: 'Timeframe', options: ['1 week', '2 weeks', '1 month', '3 months', '6 months', '1 year'] }],
  },
  {
    id: 'tutor',
    name: 'Tutor',
    description: 'Learn anything with step-by-step explanations and practice',
    icon: <GraduationCap className="w-5 h-5" />,
    color: '#ec4899',
    category: 'Learn',
    endpoint: '/api/abilities/tutor',
    placeholder: 'What do you want to learn about?',
    examples: ['Explain how compound interest works', 'Teach me the basics of Python programming', 'Help me understand how to read a balance sheet'],
    extraFields: [{ key: 'level', label: 'Level', options: ['beginner', 'intermediate', 'advanced'] }],
  },
  {
    id: 'finance',
    name: 'Financial Advisor',
    description: 'Budgeting advice, financial planning, investment basics',
    icon: <DollarSign className="w-5 h-5" />,
    color: '#10b981',
    category: 'Advise',
    endpoint: '/api/abilities/finance',
    placeholder: 'What financial question do you have?',
    examples: ['Help me create a monthly budget', 'Explain the difference between Roth and traditional IRA', 'How should I prioritize paying off debt?'],
  },
  {
    id: 'decide',
    name: 'Decision Helper',
    description: 'Weigh options, evaluate pros/cons, make better decisions',
    icon: <Scale className="w-5 h-5" />,
    color: '#a855f7',
    category: 'Advise',
    endpoint: '/api/abilities/decide',
    placeholder: 'What decision are you trying to make?',
    examples: ['Should I take this job offer?', 'Compare leasing vs buying a car', 'Help me choose between two business strategies'],
    extraFields: [{ key: 'options', label: 'Options to compare (optional)' }],
  },
  {
    id: 'translate',
    name: 'Translate',
    description: 'Translate text between languages with cultural nuance',
    icon: <Languages className="w-5 h-5" />,
    color: '#0ea5e9',
    category: 'Create',
    endpoint: '/api/abilities/translate',
    placeholder: 'Enter text to translate...',
    examples: ['Translate this email to Spanish', 'How do you say this in French?', 'Translate this document to Portuguese'],
    extraFields: [{ key: 'targetLang', label: 'Target Language', options: ['Spanish', 'French', 'Portuguese', 'German', 'Italian', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi'] }],
  },
  {
    id: 'explain',
    name: 'Explain Like I\'m 5',
    description: 'Break down complex topics into simple, clear explanations',
    icon: <MessageSquare className="w-5 h-5" />,
    color: '#f59e0b',
    category: 'Learn',
    endpoint: '/api/abilities/explain',
    placeholder: 'What do you want explained simply?',
    examples: ['Explain blockchain technology', 'What is machine learning?', 'How does the stock market work?'],
  },
];

const CATEGORIES = ['All', 'Create', 'Analyze', 'Think', 'Learn', 'Advise'];

function AbilityCard({ ability, onSelect }: { ability: AbilityConfig; onSelect: (a: AbilityConfig) => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(ability)}
      className="p-4 rounded-xl border text-left cursor-pointer hover:bg-white/[0.04] transition-all duration-300 group"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.03), ${ability.color}08)`,
        borderColor: `${ability.color}15`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg" style={{ background: `${ability.color}15`, color: ability.color }}>
          {ability.icon}
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-200 mb-1">{ability.name}</p>
      <p className="text-xs text-gray-500 line-clamp-2">{ability.description}</p>
      <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${ability.color}10`, color: ability.color }}>
        {ability.category}
      </span>
    </motion.button>
  );
}

function AbilityWorkspace({ ability, onBack }: { ability: AbilityConfig; onBack: () => void }) {
  const [input, setInput] = useState('');
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult('');

    try {
      const payload: Record<string, string> = {};

      if (ability.id === 'brainstorm' || ability.id === 'research') {
        payload.topic = input;
      } else if (ability.id === 'analyze') {
        payload.data = input;
        if (extras.question) payload.question = extras.question;
      } else {
        payload.prompt = input;
      }

      if (ability.id === 'coding' && extras.language && extras.language !== 'Any') {
        payload.language = extras.language;
      }
      if (ability.id === 'writing' && extras.type) {
        payload.type = extras.type;
      }
      if (ability.id === 'summarize' && extras.format) {
        payload.format = extras.format;
      }
      if (ability.id === 'planning' && extras.timeframe) {
        payload.timeframe = extras.timeframe;
      }
      if (ability.id === 'tutor' && extras.level) {
        payload.level = extras.level;
      }
      if (ability.id === 'translate' && extras.targetLang) {
        payload.targetLang = extras.targetLang;
      }
      if (ability.id === 'decide' && extras.options) {
        payload.options = extras.options;
      }

      const res = await fetch(ability.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          setError("Sallie's AI brain needs an API key to power this ability. Add your OpenAI or Azure key in Settings to unlock full power.");
        } else {
          setError(data.error || 'Something went wrong');
        }
      } else if (!data.result || data.result.trim() === '') {
        setError("No API key configured. Add your OpenAI or Azure OpenAI key so Sallie can deliver real results — not empty promises.");
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, [input, extras, ability, loading]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  const handleExample = useCallback((ex: string) => {
    setInput(ex);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1"
      >
        ← Back to all abilities
      </button>

      <div className="p-6 rounded-2xl border" style={{ borderColor: `${ability.color}20`, background: `linear-gradient(135deg, ${ability.color}08, transparent)` }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl" style={{ background: `${ability.color}15`, color: ability.color }}>
            {ability.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">{ability.name}</h2>
            <p className="text-sm text-gray-400">{ability.description}</p>
          </div>
        </div>

        {ability.extraFields && (
          <div className="flex flex-wrap gap-3 mb-4">
            {ability.extraFields.map(field => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">{field.label}</label>
                {field.options ? (
                  <div className="relative">
                    <select
                      value={extras[field.key] || field.options[0]}
                      onChange={e => setExtras(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="appearance-none px-3 py-2 pr-8 rounded-lg text-sm text-gray-300 focus:outline-none cursor-pointer"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${ability.color}20`,
                      }}
                    >
                      {field.options.map(opt => (
                        <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={extras[field.key] || ''}
                    onChange={e => setExtras(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.label}
                    className="px-3 py-2 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${ability.color}20`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative mb-4">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={ability.placeholder}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none resize-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${ability.color}20`,
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="absolute bottom-3 right-3 p-2 rounded-lg transition-all disabled:opacity-30"
            style={{
              background: `${ability.color}20`,
              color: ability.color,
            }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {ability.examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleExample(ex)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 transition-colors"
                style={{
                  background: `${ability.color}08`,
                  border: `1px solid ${ability.color}10`,
                }}
              >
                <Sparkles className="w-3 h-3" style={{ color: ability.color }} />
                {ex}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm mb-4"
            >
              {error}
            </motion.div>
          )}

          {loading && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 rounded-xl border"
              style={{ borderColor: `${ability.color}15`, background: `${ability.color}05` }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: ability.color }} />
              <span className="text-sm text-gray-400">Generating...</span>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: `${ability.color}20` }}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: `${ability.color}15`, background: `${ability.color}08` }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: ability.color }} />
                  <span className="text-xs font-medium text-gray-400">Result</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all hover:bg-white/5"
                  style={{ color: ability.color }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">{result}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function AbilitiesDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAbility, setSelectedAbility] = useState<AbilityConfig | null>(null);

  const filtered = selectedCategory === 'All'
    ? ABILITIES
    : ABILITIES.filter(a => a.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #14B8A6, #2DD4BF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Abilities
          </h1>
          <p className="text-gray-500 text-sm mt-1">Everything Sallie can help you create, analyze, and build</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)' }}>
          <Zap className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-teal-400">{ABILITIES.length} abilities</span>
        </div>
      </div>

      <div className="flex gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedAbility(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {selectedAbility ? (
        <AbilityWorkspace ability={selectedAbility} onBack={() => setSelectedAbility(null)} />
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filtered.map((ability) => (
            <AbilityCard key={ability.id} ability={ability} onSelect={setSelectedAbility} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

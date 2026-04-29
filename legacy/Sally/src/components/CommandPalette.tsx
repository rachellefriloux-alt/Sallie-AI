'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Zap, Code, PenTool, Brain, BarChart3, BookOpen, Target, GraduationCap,
  DollarSign, Scale, Languages, MessageCircle, Compass, Lightbulb, ArrowRight,
  Camera, Mic, Bell, Share2, MapPin, Shield, Clipboard, Activity, Eye, Heart,
  Crown, Users, Moon, Sparkles, Send, Loader2, ChevronRight,
} from 'lucide-react';
import { GLASS_BASE } from './sallie-ui';

interface Capability {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  category: 'ability' | 'tool' | 'action' | 'navigation' | 'device';
  endpoint?: string;
  color: string;
}

const ALL_CAPABILITIES: Capability[] = [
  { id: 'code', label: 'Code', desc: 'Write, debug, or explain code', icon: <Code className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/code', color: '#14B8A6' },
  { id: 'write', label: 'Write', desc: 'Draft documents, emails, or creative content', icon: <PenTool className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/write', color: '#9D8DF1' },
  { id: 'brainstorm', label: 'Brainstorm', desc: 'Generate ideas and explore possibilities', icon: <Lightbulb className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/brainstorm', color: '#FFD700' },
  { id: 'analyze', label: 'Analyze', desc: 'Deep analysis of data, text, or situations', icon: <BarChart3 className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/analyze', color: '#3B82F6' },
  { id: 'summarize', label: 'Summarize', desc: 'Condense information into key points', icon: <BookOpen className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/summarize', color: '#06B6D4' },
  { id: 'research', label: 'Research', desc: 'Deep dives and intelligence gathering', icon: <Compass className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/research', color: '#10B981' },
  { id: 'plan', label: 'Plan', desc: 'Strategic planning and task breakdown', icon: <Target className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/plan', color: '#D4AF37' },
  { id: 'tutor', label: 'Tutor', desc: 'Learn and understand any topic', icon: <GraduationCap className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/tutor', color: '#EC4899' },
  { id: 'finance', label: 'Finance', desc: 'Financial analysis and budgeting help', icon: <DollarSign className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/finance', color: '#22C55E' },
  { id: 'decide', label: 'Decide', desc: 'Decision analysis with pros, cons, and gut check', icon: <Scale className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/decide', color: '#F59E0B' },
  { id: 'translate', label: 'Translate', desc: 'Translate between languages', icon: <Languages className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/translate', color: '#8B5CF6' },
  { id: 'explain', label: 'Explain', desc: 'Break down complex concepts simply', icon: <MessageCircle className="w-4 h-4" />, category: 'ability', endpoint: '/api/abilities/explain', color: '#FF6B9D' },

  { id: 'nav-empire', label: 'Go to Empire', desc: 'Your legacy war room', icon: <Crown className="w-4 h-4" />, category: 'navigation', color: '#D4AF37' },
  { id: 'nav-source', label: 'Go to Source', desc: 'Your soul space', icon: <Eye className="w-4 h-4" />, category: 'navigation', color: '#9D8DF1' },
  { id: 'nav-sanctuary', label: 'Go to Sanctuary', desc: "Sallie's inner world", icon: <Moon className="w-4 h-4" />, category: 'navigation', color: '#00A896' },
  { id: 'nav-partner', label: 'Go to Partner', desc: 'Love on purpose', icon: <Heart className="w-4 h-4" />, category: 'navigation', color: '#FF6B9D' },
  { id: 'nav-confidante', label: 'Go to Confidante', desc: 'Your inner circle', icon: <Users className="w-4 h-4" />, category: 'navigation', color: '#06B6D4' },
  { id: 'nav-workspace', label: 'Go to Workspace', desc: 'Creation hub', icon: <Sparkles className="w-4 h-4" />, category: 'navigation', color: '#14B8A6' },

  { id: 'dev-camera', label: 'Camera', desc: 'Open camera for photo or video', icon: <Camera className="w-4 h-4" />, category: 'device', color: '#3B82F6' },
  { id: 'dev-mic', label: 'Microphone', desc: 'Voice input and recording', icon: <Mic className="w-4 h-4" />, category: 'device', color: '#EF4444' },
  { id: 'dev-notify', label: 'Notifications', desc: 'Push notification settings', icon: <Bell className="w-4 h-4" />, category: 'device', color: '#F59E0B' },
  { id: 'dev-share', label: 'Share', desc: 'Share content natively', icon: <Share2 className="w-4 h-4" />, category: 'device', color: '#10B981' },
  { id: 'dev-location', label: 'Location', desc: 'Access geolocation', icon: <MapPin className="w-4 h-4" />, category: 'device', color: '#06B6D4' },
  { id: 'dev-clipboard', label: 'Clipboard', desc: 'Copy/paste operations', icon: <Clipboard className="w-4 h-4" />, category: 'device', color: '#8B5CF6' },
  { id: 'dev-biometrics', label: 'Biometrics', desc: 'Fingerprint or face authentication', icon: <Shield className="w-4 h-4" />, category: 'device', color: '#EC4899' },
];

interface CommandPaletteProps {
  onNavigate?: (section: string) => void;
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeAbility, setActiveAbility] = useState<Capability | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelectedIdx(0);
        setActiveAbility(null);
        setResult('');
      }
      if (e.key === 'Escape') {
        if (activeAbility) {
          setActiveAbility(null);
          setResult('');
        } else {
          setOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeAbility]);

  useEffect(() => {
    if (open && !activeAbility) setTimeout(() => inputRef.current?.focus(), 100);
    if (activeAbility) setTimeout(() => promptRef.current?.focus(), 100);
  }, [open, activeAbility]);

  const filtered = useMemo(() => {
    if (!query) return ALL_CAPABILITIES;
    const q = query.toLowerCase();
    return ALL_CAPABILITIES.filter(c =>
      c.label.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.category.includes(q)
    );
  }, [query]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const executeCapability = useCallback(async (cap: Capability) => {
    if (cap.category === 'navigation' && onNavigate) {
      const section = cap.id.replace('nav-', '');
      onNavigate(section);
      setOpen(false);
      return;
    }
    if (cap.category === 'ability' && cap.endpoint) {
      setActiveAbility(cap);
      setResult('');
      setPrompt('');
      return;
    }
    setOpen(false);
  }, [onNavigate]);

  const runAbility = useCallback(async () => {
    if (!activeAbility?.endpoint || !prompt.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(activeAbility.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      setResult(data.result || data.content || data.response || JSON.stringify(data, null, 2));
    } catch (err) {
      setResult('Something went wrong. Try again, love.');
    } finally {
      setLoading(false);
    }
  }, [activeAbility, prompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIdx]) {
      e.preventDefault();
      executeCapability(filtered[selectedIdx]);
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setQuery(''); setActiveAbility(null); setResult(''); }}
        className="fixed bottom-6 right-6 z-[90] p-3.5 rounded-2xl transition-all duration-500 hover:scale-110"
        style={{
          ...GLASS_BASE,
          background: 'linear-gradient(135deg, rgba(200,168,78,0.12), rgba(200,168,78,0.04))',
          border: '1px solid rgba(200,168,78,0.2)',
          boxShadow: '0 0 40px rgba(200,168,78,0.1), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <Zap className="w-5 h-5 text-[#C8A84E]" style={{ filter: 'drop-shadow(0 0 6px rgba(200,168,78,0.6))' }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[200]"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(16px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[15vh] pointer-events-none">
              <motion.div
                className="w-full max-w-2xl pointer-events-auto rounded-2xl overflow-hidden"
                style={{
                  ...GLASS_BASE,
                  background: 'linear-gradient(160deg, rgba(14,16,21,0.98), rgba(10,12,18,0.99))',
                  border: '1px solid rgba(200,168,78,0.12)',
                  boxShadow: '0 0 100px rgba(0,0,0,0.7), 0 0 60px rgba(200,168,78,0.08), 0 0 0 1px rgba(255,255,255,0.03) inset',
                }}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(200,168,78,0.5) 50%, transparent 95%)' }} />

                {!activeAbility ? (
                  <>
                    <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <Search className="w-5 h-5 text-white/30 flex-shrink-0" />
                      <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What do you need, love? Search abilities, navigate, or trigger devices..."
                        className="flex-1 bg-transparent text-white/90 placeholder:text-white/20 text-sm font-medium tracking-tight outline-none"
                      />
                      <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-white/20 uppercase" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        ESC
                      </kbd>
                    </div>
                    <div className="max-h-[50vh] overflow-y-auto py-2">
                      {filtered.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <p className="text-sm text-white/40">Nothing matches that, love. Try something else.</p>
                        </div>
                      ) : (
                        filtered.map((cap, i) => (
                          <button
                            key={cap.id}
                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 ${i === selectedIdx ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                            onClick={() => executeCapability(cap)}
                            onMouseEnter={() => setSelectedIdx(i)}
                          >
                            <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${cap.color}12`, boxShadow: `0 0 12px ${cap.color}08` }}>
                              <span style={{ color: cap.color }}>{cap.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white/80 tracking-tight">{cap.label}</p>
                              <p className="text-[11px] text-white/30 truncate">{cap.desc}</p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full" style={{ background: `${cap.color}10`, color: cap.color }}>
                              {cap.category}
                            </span>
                            {i === selectedIdx && <ChevronRight className="w-3 h-3 text-white/20" />}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="px-5 py-3 flex items-center gap-4 text-[10px] text-white/15" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <span><kbd className="font-bold">↑↓</kbd> navigate</span>
                      <span><kbd className="font-bold">↵</kbd> select</span>
                      <span><kbd className="font-bold">esc</kbd> close</span>
                      <span className="ml-auto font-black uppercase tracking-widest text-[#C8A84E]/30">{filtered.length} capabilities</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <button onClick={() => { setActiveAbility(null); setResult(''); }} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                        <ArrowRight className="w-4 h-4 text-white/30 rotate-180" />
                      </button>
                      <div className="p-2 rounded-xl" style={{ background: `${activeAbility.color}12` }}>
                        <span style={{ color: activeAbility.color }}>{activeAbility.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight text-white/90">{activeAbility.label}</p>
                        <p className="text-[10px] text-white/30">{activeAbility.desc}</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="relative">
                        <textarea
                          ref={promptRef}
                          value={prompt}
                          onChange={e => setPrompt(e.target.value)}
                          placeholder={`Tell me what to ${activeAbility.label.toLowerCase()}, love...`}
                          rows={3}
                          className="w-full rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/80 placeholder:text-white/20 text-sm font-medium p-4 outline-none resize-none"
                          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); runAbility(); } }}
                        />
                        <button
                          onClick={runAbility}
                          disabled={loading || !prompt.trim()}
                          className="absolute bottom-3 right-3 p-2 rounded-lg transition-all disabled:opacity-30"
                          style={{ background: `${activeAbility.color}15`, border: `1px solid ${activeAbility.color}25` }}
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: activeAbility.color }} /> : <Send className="w-4 h-4" style={{ color: activeAbility.color }} />}
                        </button>
                      </div>
                      {result && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl p-4 max-h-[40vh] overflow-y-auto"
                          style={{ ...GLASS_BASE, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                        </motion.div>
                      )}
                    </div>
                    <div className="px-5 py-3 text-[10px] text-white/15" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <kbd className="font-bold">⌘↵</kbd> run &middot; <kbd className="font-bold">esc</kbd> back
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Send,
  GitBranch,
  Brain,
  Sparkles,
  CheckCircle2,
  MapPin,
  Calendar,
  Battery,
  Zap,
} from 'lucide-react';

type LogType = 'action' | 'decision' | 'thought' | 'learning';

interface LogEntry {
  id: string;
  type: LogType;
  title: string;
  sub?: string;
  content?: string;
  tags?: string[];
  confidence?: string;
  badge?: string;
  relativeTime: string;
  timestamp: string;
}

export default function ThoughtActionLogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<LogType | 'all'>('all');
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/thought-action-log');
      if (res.ok) {
        const data = await res.json();
        const apiEntries = (data.entries || []).map((e: any, i: number) => mapApiToLogEntry(e, i));
        setEntries(apiEntries);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const mapApiToLogEntry = (e: any, i: number): LogEntry => {
    const typeMap: Record<string, LogType> = {
      decision: 'decision',
      debate: 'thought',
      friction: 'thought',
      monologue: 'thought',
      synthesis: 'learning',
      perception: 'thought',
    };
    const type = (typeMap[e.type] ?? 'thought') as LogType;
    return {
      id: e.id ?? `api-${i}`,
      type,
      title: e.content?.slice(0, 60) ?? 'Log entry',
      sub: e.metadata?.context,
      content: e.content,
      tags: e.metadata?.participants ? [e.metadata.participants.join(', ')] : undefined,
      confidence: e.metadata?.confidence ? `${Math.round((e.metadata.confidence as number) * 100)}% Confidence` : undefined,
      relativeTime: formatRelative(new Date(e.timestamp)),
      timestamp: e.timestamp,
    };
  };

  const formatRelative = (d: Date) => {
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredEntries = entries.filter((e) => {
    if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase()) && !e.sub?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filter !== 'all' && e.type !== filter) return false;
    return true;
  });

  const getTypeIcon = (type: LogType) => {
    switch (type) {
      case 'action': return <Send className="h-5 w-5" />;
      case 'decision': return <GitBranch className="h-5 w-5" />;
      case 'thought': return <Brain className="h-5 w-5" />;
      case 'learning': return <Sparkles className="h-5 w-5" />;
      default: return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const getTypeStyles = (type: LogType) => {
    switch (type) {
      case 'action': return 'bg-violet-500/20 text-violet-400 border-violet-500/30 ring-2 ring-violet-500/20';
      case 'learning': return 'bg-purple-500/20 text-purple-400 border-violet-500/30 ring-2 ring-purple-500/20';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const chips: { id: LogType | 'all'; label: string }[] = [
    { id: 'all', label: 'All Logs' },
    { id: 'thought', label: 'Thoughts' },
    { id: 'decision', label: 'Decisions' },
    { id: 'action', label: 'Actions' },
    { id: 'learning', label: 'Learning' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900">
      <header className="flex items-center justify-between border-b border-violet-500/20 bg-black/20 backdrop-blur px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-violet-300 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 size-8 bg-violet-500/20 rounded-lg text-violet-400 justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold text-white">Sallie</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm font-medium">Dashboard</Link>
          <span className="text-white text-sm font-bold border-b-2 border-violet-500 pb-0.5">Thought Log</span>
          <Link href="/presence" className="text-slate-400 hover:text-white text-sm font-medium">Memories</Link>
        </nav>
      </header>

      <div className="flex justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-white text-3xl font-black tracking-tight">Thought & Action Log</h2>
              <p className="text-slate-400 text-base">Real-time visualization of Sallie&apos;s cognitive pipeline, decisions, and outputs.</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search thoughts, decisions, or actions..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-violet-500/20 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {chips.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFilter(c.id)}
                    className={`flex h-9 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-medium transition-all ${
                      filter === c.id
                        ? 'bg-violet-500/20 border border-violet-500/30 text-violet-400'
                        : 'bg-slate-800 border border-transparent text-slate-400 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Feed */}
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-violet-500/20 shadow-lg">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-500 border-t-transparent" />
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="h-12 w-12 text-slate-500 mb-3" />
                  <p className="text-slate-400 text-sm font-medium">No thought or action entries yet.</p>
                  <p className="text-slate-500 text-xs mt-1">Conversations and decisions will appear here over time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-[48px_1fr] gap-x-0">
                  {filteredEntries.map((entry, idx) => (
                    <div key={entry.id} className="contents">
                      <div className="flex flex-col items-center pt-1 relative">
                        <div
                          className={`size-10 rounded-full flex items-center justify-center z-10 border-2 border-slate-900 ${getTypeStyles(entry.type)}`}
                        >
                          {getTypeIcon(entry.type)}
                        </div>
                        {idx < filteredEntries.length - 1 && (
                          <div className="w-[2px] bg-slate-600 h-full absolute top-10 bottom-0 left-1/2 -translate-x-1/2" />
                        )}
                      </div>
                      <div className="flex flex-col pb-8 pl-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col">
                            <h3 className="text-white text-lg font-bold leading-snug">
                              {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}: {entry.title}
                            </h3>
                            {entry.sub && <p className="text-slate-400 text-sm font-medium mt-1">{entry.sub}</p>}
                          </div>
                          {entry.confidence && (
                            <span className="shrink-0 px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                              {entry.confidence}
                            </span>
                          )}
                          {entry.badge && !entry.confidence && (
                            <span className="shrink-0 px-2 py-1 rounded bg-slate-700 text-slate-400 text-xs font-bold border border-white/10">
                              {entry.badge}
                            </span>
                          )}
                        </div>
                        {entry.content && (
                          <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-violet-500/10 flex gap-3 items-center">
                            <div className="w-1 h-full bg-violet-500 rounded-full" />
                            <p className="text-slate-400 text-sm italic">{entry.content}</p>
                          </div>
                        )}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {entry.tags.map((t, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 rounded bg-violet-500/10 text-violet-400 text-xs font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-slate-400 text-xs font-medium mt-2">{entry.relativeTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-slate-800/60 rounded-xl p-5 border border-violet-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-24 w-24 text-violet-400" />
              </div>
              <div className="relative z-10">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">System Status</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500" />
                  </span>
                  <span className="text-white text-xl font-bold">Processing</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Sallie is currently monitoring your calendar for conflicts next week.
                </p>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-5 border border-violet-500/20">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Current Context</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-slate-700 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Home Office</p>
                    <p className="text-slate-400 text-xs">San Francisco, CA</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-slate-700 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Deep Work Block</p>
                    <p className="text-slate-400 text-xs">Ends in 45 mins</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-slate-700 p-2 rounded-lg">
                    <Battery className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">High Energy</p>
                    <p className="text-slate-400 text-xs">Based on sleep data</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-5 border border-violet-500/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Weekly Insights</h3>
                <Link href="/dashboard" className="text-violet-400 text-xs font-bold hover:underline">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 rounded-lg p-3 border border-violet-500/10">
                  <p className="text-3xl font-bold text-white mb-1">42</p>
                  <p className="text-slate-400 text-xs font-medium">Decisions Automated</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 border border-violet-500/10">
                  <p className="text-3xl font-bold text-white mb-1">3</p>
                  <p className="text-slate-400 text-xs font-medium">New Preferences</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-violet-500/20">
                <p className="text-slate-400 text-xs mb-2">Top Focus Area</p>
                <div className="flex justify-between items-center">
                  <p className="text-white text-sm font-bold">Family Scheduling</p>
                  <span className="text-violet-400 text-xs font-bold">65%</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2">
                  <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-500/20 to-slate-800 rounded-xl p-5 border border-violet-500/20">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-violet-400 mt-1 shrink-0" />
                <div>
                  <p className="text-white text-sm font-bold leading-snug">Suggestion</p>
                  <p className="text-slate-400 text-sm mt-1">
                    You seem to decline meetings after 4pm on Fridays. Should I make this a rule?
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button className="bg-violet-500 text-slate-900 text-xs font-bold px-3 py-1.5 rounded hover:bg-violet-400 transition-colors">
                      Yes, create rule
                    </button>
                    <button className="bg-transparent border border-slate-600 text-slate-400 text-xs font-bold px-3 py-1.5 rounded hover:bg-slate-700 hover:text-white transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

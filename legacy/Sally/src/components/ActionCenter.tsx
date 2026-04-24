'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  MessageSquare, Phone, Mail, CalendarPlus, Timer, AlarmClock, Bell,
  Calendar, StickyNote, CheckSquare, Music, Camera, Video, Monitor,
  AppWindow, Settings, Wifi, Bluetooth, Volume2, Sun, CloudSun,
  Newspaper, MapPin, Calculator, ArrowLeftRight, Search, Lightbulb,
  Thermometer, Lock, Eye, FilePlus, FileText, FolderSearch, Share2,
  Command, X, Loader2, ChevronRight, Zap, Smartphone, Globe, Laptop,
} from 'lucide-react';
import type { ActionCategory, ActionPlatform, ActionStatus } from '@/lib/device-actions';

interface ActionDef {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  platforms: ActionPlatform[];
  status: ActionStatus;
  icon: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare, Phone, Mail, CalendarPlus, Timer, AlarmClock, Bell,
  Calendar, StickyNote, CheckSquare, Music, Camera, Video, Monitor,
  AppWindow, Settings, Wifi, Bluetooth, Volume2, Sun, CloudSun,
  Newspaper, MapPin, Calculator, ArrowLeftRight, Search, Lightbulb,
  Thermometer, Lock, Cctv: Eye, FilePlus, FileText, FolderSearch, Share2,
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Communication: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400' },
  Productivity: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: 'text-emerald-400' },
  Media: { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', icon: 'text-pink-400' },
  System: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', icon: 'text-amber-400' },
  Information: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', icon: 'text-cyan-400' },
  'Smart Home': { bg: 'bg-violet-500/10', border: 'border-violet-500/20', text: 'text-violet-400', icon: 'text-violet-400' },
  Files: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: 'text-orange-400' },
};

const STATUS_STYLES: Record<ActionStatus, { dot: string; label: string }> = {
  available: { dot: 'bg-emerald-400', label: 'Available' },
  'needs-native': { dot: 'bg-amber-400', label: 'Native Only' },
  unavailable: { dot: 'bg-red-400', label: 'Unavailable' },
};

const PLATFORM_ICONS: Record<ActionPlatform, React.ComponentType<{ className?: string }>> = {
  web: Globe,
  mobile: Smartphone,
  desktop: Laptop,
};

export default function ActionCenter() {
  const [actions, setActions] = useState<ActionDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [result, setResult] = useState<{ actionId: string; success: boolean; message: string } | null>(null);
  const [paramInputs, setParamInputs] = useState<Record<string, string>>({});
  const [activeAction, setActiveAction] = useState<ActionDef | null>(null);

  useState(() => {
    fetch('/api/actions/available?all=true')
      .then((r) => r.json())
      .then((data) => {
        setActions(data.actions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  });

  const categories = useMemo(() => {
    const cats = [...new Set(actions.map((a) => a.category))];
    return cats;
  }, [actions]);

  const filtered = useMemo(() => {
    let list = actions;
    if (selectedCategory) list = list.filter((a) => a.category === selectedCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [actions, selectedCategory, search]);

  const grouped = useMemo(() => {
    const map: Record<string, ActionDef[]> = {};
    for (const a of filtered) {
      if (!map[a.category]) map[a.category] = [];
      map[a.category].push(a);
    }
    return map;
  }, [filtered]);

  const handleExecute = useCallback(async (action: ActionDef) => {
    if (action.params && action.params.some((p) => p.required)) {
      const missing = action.params.filter((p) => p.required && !paramInputs[p.name]);
      if (missing.length > 0) {
        setActiveAction(action);
        return;
      }
    }
    setExecuting(action.id);
    setResult(null);
    try {
      const res = await fetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId: action.id, params: paramInputs }),
      });
      const data = await res.json();
      setResult({ actionId: action.id, success: data.success, message: data.message });
    } catch {
      setResult({ actionId: action.id, success: false, message: 'Failed to execute action' });
    } finally {
      setExecuting(null);
      setParamInputs({});
      setActiveAction(null);
    }
  }, [paramInputs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Action Center
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {actions.length} actions across {categories.length} categories
          </p>
        </div>
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <Command className="w-4 h-4" />
          <span className="text-sm">Quick Action</span>
          <kbd className="ml-2 px-1.5 py-0.5 text-xs rounded bg-white/10 border border-white/10">⌘K</kbd>
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            !selectedCategory ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Communication;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? `${colors.bg} ${colors.text} border ${colors.border}`
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actions..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
        />
      </div>

      {result && (
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            result.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${result.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className="text-sm">{result.message}</span>
          <button onClick={() => setResult(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {Object.entries(grouped).map(([category, categoryActions]) => {
        const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Communication;
        return (
          <div key={category} className="space-y-3">
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${colors.text}`}>
              {category}
              <span className="ml-2 text-gray-500 font-normal">({categoryActions.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {categoryActions.map((action) => {
                const IconComponent = ICON_MAP[action.icon] || Zap;
                const statusStyle = STATUS_STYLES[action.status];
                const isExecuting = executing === action.id;

                return (
                  <div
                    key={action.id}
                    className={`group relative p-4 rounded-xl border ${colors.border} ${colors.bg} hover:bg-white/10 transition-all cursor-pointer`}
                    onClick={() => {
                      if (action.status === 'available') handleExecute(action);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-white/5 ${colors.icon}`}>
                        {isExecuting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <IconComponent className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        <span className="text-xs text-gray-500">{statusStyle.label}</span>
                      </div>
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1">{action.name}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{action.description}</p>
                    <div className="flex items-center gap-1 mt-3">
                      {action.platforms.map((p) => {
                        const PlatformIcon = PLATFORM_ICONS[p];
                        return (
                          <PlatformIcon key={p} className="w-3.5 h-3.5 text-gray-500" />
                        );
                      })}
                    </div>
                    {action.status === 'available' && (
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/30 backdrop-blur-sm">
                        <div className="flex items-center gap-1 text-white text-sm font-medium">
                          <ChevronRight className="w-4 h-4" />
                          Execute
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {activeAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setActiveAction(null)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{activeAction.name}</h3>
              <button onClick={() => setActiveAction(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{activeAction.description}</p>
            <div className="space-y-3">
              {activeAction.params?.map((param) => (
                <div key={param.name}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {param.name}
                    {param.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    type={param.type === 'number' ? 'number' : 'text'}
                    placeholder={param.description}
                    value={paramInputs[param.name] || ''}
                    onChange={(e) => setParamInputs({ ...paramInputs, [param.name]: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 text-sm"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => handleExecute(activeAction)}
              disabled={executing !== null}
              className="mt-4 w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Execute Action
            </button>
          </div>
        </div>
      )}

      {commandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search actions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
              <button onClick={() => setCommandOpen(false)} className="text-gray-400 hover:text-white">
                <kbd className="px-1.5 py-0.5 text-xs rounded bg-white/10 border border-white/10">ESC</kbd>
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No actions found</div>
              ) : (
                filtered.slice(0, 10).map((action) => {
                  const IconComponent = ICON_MAP[action.icon] || Zap;
                  const colors = CATEGORY_COLORS[action.category] || CATEGORY_COLORS.Communication;
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        setCommandOpen(false);
                        setSearch('');
                        if (action.status === 'available') handleExecute(action);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all text-left"
                    >
                      <div className={`p-1.5 rounded-md bg-white/5 ${colors.icon}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{action.name}</div>
                        <div className="text-xs text-gray-500 truncate">{action.description}</div>
                      </div>
                      <span className={`text-xs ${colors.text}`}>{action.category}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

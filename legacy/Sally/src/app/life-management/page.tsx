'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Calendar,
  Plus,
  Zap,
  CheckSquare,
  Hourglass,
  Moon,
  Brain,
  Filter,
  Sparkles,
  Loader2,
} from 'lucide-react';

// Types matching API response
interface LifeContext {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

interface DailyItem {
  id: string;
  title: string;
  sub: string;
  color: string;
  done: boolean;
}

interface LifeTask {
  id: string;
  text: string;
  tags: string[];
  urgent?: string;
  done: boolean;
  waiting?: boolean;
  sub?: string;
}

interface RecallItem {
  id: string;
  label: string;
  title: string;
  sub: string;
  color: string;
}

export default function LifeManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState<'focus' | 'all'>('focus');
  const [newTask, setNewTask] = useState('');
  
  // Data states
  const [contexts, setContexts] = useState<LifeContext[]>([]);
  const [dailyItems, setDailyItems] = useState<DailyItem[]>([]);
  const [tasks, setTasks] = useState<LifeTask[]>([]);
  const [recallItems, setRecallItems] = useState<RecallItem[]>([]);
  const [activeContext, setActiveContext] = useState<string>('command');

  // Fetch all data from APIs
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      
      // Fetch contexts
      const contextsRes = await fetch('/api/life/contexts', { headers });
      const contextsData = await contextsRes.json();
      if (contextsData.contexts?.length > 0) {
        setContexts(contextsData.contexts);
        const active = contextsData.contexts.find((c: LifeContext) => c.active);
        if (active) setActiveContext(active.id);
      }
      
      // Fetch daily items
      const dailyRes = await fetch('/api/life/daily-items', { headers });
      const dailyData = await dailyRes.json();
      if (dailyData.items?.length > 0) {
        setDailyItems(dailyData.items);
      }
      
      // Fetch tasks
      const tasksRes = await fetch('/api/life/tasks', { headers });
      const tasksData = await tasksRes.json();
      if (tasksData.tasks?.length > 0) {
        setTasks(tasksData.tasks);
      }
      
      // Fetch recall
      const recallRes = await fetch('/api/life/recall', { headers });
      const recallData = await recallRes.json();
      if (recallData.items?.length > 0) {
        setRecallItems(recallData.items);
      }
    } catch (error) {
      console.error('Error fetching life data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add new task
  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/life/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTask, tags: ['Personal'] }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks([...tasks, data.task]);
        setNewTask('');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle task
  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      await fetch('/api/life/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, done: !task.done }),
      });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Switch context
  const switchContext = async (contextId: string) => {
    try {
      await fetch('/api/life/contexts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contextId, active: true }),
      });
      setContexts(contexts.map(c => ({ ...c, active: c.id === contextId })));
      setActiveContext(contextId);
    } catch (error) {
      console.error('Error switching context:', error);
    }
  };

  // Check if user has data
  const hasData = contexts.length > 0 || tasks.length > 0 || dailyItems.length > 0;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
          <p className="text-slate-400">Loading your life data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-black/30 border-r border-violet-500/20 h-full flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="size-12 rounded-full bg-violet-500/20 border-2 border-violet-500/30 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Sallie</h1>
              <p className="text-slate-400 text-xs font-medium">LIFE OS v2.0</p>
              {!hasData && (
                <p className="text-violet-400 text-[10px] font-medium mt-0.5">👋 Welcome! Set up your contexts.</p>
              )}
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 pl-3">Contexts</p>
            {contexts.length === 0 ? (
              <p className="text-slate-500 text-sm pl-3">No contexts yet</p>
            ) : (
              contexts.map((ctx) => (
                <button
                  key={ctx.id}
                  onClick={() => switchContext(ctx.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeContext === ctx.id
                      ? 'bg-violet-500/20 border border-violet-500/30 text-violet-300'
                      : 'hover:bg-violet-500/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-lg">
                    {ctx.id === 'command' ? '📊' : ctx.id === 'mom' ? '👶' : ctx.id === 'spouse' ? '❤️' : ctx.id === 'business' ? '💼' : '🧘'}
                  </span>
                  <span className="text-sm font-medium">{ctx.label}</span>
                </button>
              ))
            )}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-violet-500/20">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-violet-500/10 text-slate-400 hover:text-white transition-all">
            <Filter className="h-5 w-5" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="w-full px-6 md:px-8 py-6 z-10">
          <div className="max-w-5xl mx-auto flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 text-violet-300 hover:text-white text-sm mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            {/* Omni Search */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-violet-400" />
              <input
                type="text"
                placeholder="Ask Sallie... (e.g., 'Schedule a date night for Friday at 7pm')"
                className="w-full h-14 pl-14 pr-24 rounded-2xl bg-slate-800/80 border border-violet-500/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors">
                <span className="text-xl">→</span>
              </button>
            </div>
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-1">Good Morning</h2>
                {tasks.filter(t => !t.done && !t.waiting).length > 0 ? (
                  <p className="text-slate-400">You have <span className="text-violet-400 font-bold">{tasks.filter(t => !t.done && !t.waiting).length} high-priority items</span> to clear before noon.</p>
                ) : (
                  <p className="text-slate-400">All caught up! Add a new task below.</p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-violet-500/20">
                  <Calendar className="h-4 w-4" />
                  Sync Calendars
                </button>
                <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <Plus className="h-4 w-4" />
                  New Task
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Briefing & Schedule */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-violet-500/20 overflow-hidden">
                <div className="p-5 border-b border-violet-500/20 flex justify-between items-center bg-slate-900/50">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-400" />
                    Daily Briefing
                  </h3>
                  <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-1 rounded font-bold">Today</span>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  {dailyItems.length === 0 ? (
                    <p className="text-slate-400 text-sm">No daily items yet.</p>
                  ) : (
                    dailyItems.map((item, i) => (
                      <div key={item.id || i} className="flex items-start gap-3">
                        <div className={`mt-1 min-w-[4px] h-10 rounded-full ${item.color.replace('border-', 'bg-')}`} />
                        <div>
                          <p className="text-white text-sm font-semibold">{item.title}</p>
                          <p className="text-slate-400 text-xs">{item.sub}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-violet-500/20 flex-1 min-h-[320px]">
                <div className="p-5 border-b border-violet-500/20 flex justify-between items-center">
                  <h3 className="text-white font-bold text-lg">Schedule</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-12 text-right text-xs text-violet-400 font-bold">Now</div>
                    <div className="flex-1 h-px bg-violet-500 relative">
                      <div className="absolute -left-1 -top-1 size-2 rounded-full bg-violet-500" />
                    </div>
                  </div>
                  <div className="flex gap-4 opacity-60">
                    <div className="w-12 text-right text-xs text-slate-500 font-medium pt-1">13:00</div>
                    <div className="flex-1 p-3 rounded-xl border-l-4 bg-slate-800/50 border-purple-400">
                      <p className="text-white text-sm font-bold">Team Standup</p>
                      <p className="text-slate-400 text-xs">Zoom</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Tasks */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-slate-800/50 rounded-2xl border border-violet-500/20 flex flex-col h-full">
                <div className="p-5 border-b border-violet-500/20 flex justify-between items-center bg-slate-900/50">
                  <div className="flex gap-4">
                    <h3 className="text-white font-bold text-lg">Smart Tasks</h3>
                    <div className="flex gap-1 bg-slate-900 p-1 rounded-lg">
                      <button
                        onClick={() => setTaskFilter('focus')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${taskFilter === 'focus' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        Focus
                      </button>
                      <button
                        onClick={() => setTaskFilter('all')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${taskFilter === 'all' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
                      >
                        All
                      </button>
                    </div>
                  </div>
                  <Filter className="h-5 w-5 text-slate-500" />
                </div>
                <div className="p-0 overflow-y-auto flex-1">
                  <div className="px-5 pt-4 pb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <CheckSquare className="h-3 w-3" />
                      High Priority
                    </h4>
                  </div>
                  {tasks.filter(t => !t.waiting).length === 0 ? (
                    <p className="text-slate-400 text-sm px-5 py-3">No tasks yet. Add one below!</p>
                  ) : (
                    tasks.filter(t => !t.waiting).slice(0, 3).map((t) => (
                      <label key={t.id} className="group flex items-center gap-3 px-5 py-3 hover:bg-slate-700/30 transition-colors cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={t.done} 
                          onChange={() => toggleTask(t.id)}
                          className="h-5 w-5 rounded border-slate-600 bg-transparent text-violet-500 focus:ring-0 cursor-pointer" 
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium group-hover:text-violet-300 transition-colors">{t.text}</p>
                          <div className="flex gap-2 mt-1">
                            {t.tags.map((tag) => (
                              <span key={tag} className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{tag}</span>
                            ))}
                            {t.urgent && <span className="text-[10px] text-red-400 flex items-center gap-1">⏱ {t.urgent}</span>}
                          </div>
                        </div>
                      </label>
                    ))
                  )}
                  <div className="px-5 pt-4 pb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Hourglass className="h-3 w-3" />
                      Waiting On
                    </h4>
                  </div>
                  {tasks.filter(t => t.waiting).length === 0 ? (
                    <p className="text-slate-500 text-sm px-5 py-2">No waiting items</p>
                  ) : (
                    tasks.filter(t => t.waiting).map((t) => (
                      <div key={t.id} className="group flex items-center gap-3 px-5 py-3 opacity-70 hover:opacity-100 transition-all cursor-not-allowed">
                        <input type="checkbox" disabled className="h-5 w-5 rounded border-slate-700 bg-slate-800" />
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm font-medium line-through">{t.text}</p>
                          {t.sub && <p className="text-[10px] text-slate-500 mt-1">{t.sub}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-violet-500/20 bg-slate-900/50">
                  <div className="flex gap-2">
                    <input
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      placeholder="Add a new task..."
                      className="flex-1 bg-slate-800 border-0 rounded-lg text-sm px-3 py-2 text-white focus:ring-1 focus:ring-violet-500 placeholder:text-slate-600"
                    />
                    <button 
                      onClick={handleAddTask}
                      disabled={isSaving || !newTask.trim()}
                      className="bg-slate-700 hover:bg-violet-500 text-violet-400 hover:text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Insights & Recall */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="bg-gradient-to-b from-violet-500/10 to-slate-900/50 rounded-2xl border border-violet-500/30 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="h-24 w-24 text-violet-400" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-violet-500/20 p-1.5 rounded-lg">
                      <Zap className="h-4 w-4 text-violet-400" />
                    </div>
                    <h3 className="text-violet-400 font-bold text-sm uppercase tracking-wide">Sallie&apos;s Insight</h3>
                  </div>
                  <p className="text-white text-sm leading-relaxed font-medium mb-4">
                    I noticed you have back-to-back meetings starting at 1:00 PM. I&apos;ve blocked out a 15-minute buffer at 12:45 PM for you to grab lunch.
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-violet-500 text-slate-900 text-xs font-bold py-2 rounded-lg hover:bg-violet-400 transition-colors">
                      Thanks, Keep it
                    </button>
                    <button className="flex-1 bg-slate-800 text-slate-400 text-xs font-bold py-2 rounded-lg hover:text-white transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl border border-violet-500/20 flex-1 flex flex-col">
                <div className="p-5 border-b border-violet-500/20 flex justify-between items-center bg-slate-900/50">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-slate-400" />
                    Recall
                  </h3>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search saved info..."
                      className="w-full bg-slate-900 border border-violet-500/20 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-violet-500 placeholder:text-slate-600"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Recently Accessed</p>
                    {recallItems.length === 0 ? (
                      <p className="text-slate-400 text-sm">No recall items yet.</p>
                    ) : (
                      recallItems.map((r) => (
                        <div key={r.id} className="group p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-violet-500/30">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${r.color}`}>{r.label}</span>
                            <span className="text-slate-500 group-hover:text-violet-400">↗</span>
                          </div>
                          <p className="text-white text-sm font-medium">{r.title}</p>
                          {r.sub && <p className="text-slate-400 text-xs mt-1 truncate">{r.sub}</p>}
                        </div>
                      ))
                    )}
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

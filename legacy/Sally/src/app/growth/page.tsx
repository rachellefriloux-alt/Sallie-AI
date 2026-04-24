'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, TrendingUp, Target, Zap, Edit3, Plus, ChevronLeft, ChevronRight, Bell, Loader2 } from 'lucide-react';

// Types matching API response
interface Goal {
  id: string;
  title: string;
  sub: string;
  progress?: number;
  color?: string;
  nextStep?: string;
  streak?: number;
  totalDays?: number;
  scheduled?: string;
  sessions?: string;
}

interface FocusTask {
  id: string;
  text: string;
  sub: string;
  done: boolean;
}

interface EnergyDay {
  day: string;
  val: number;
  current?: boolean;
}

interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
}

const RESOURCES = [
  { type: 'article', title: '5-Min Guide to Delegating at Home', sub: 'Learn to share the load effectively without guilt.' },
  { type: 'podcast', title: 'Balancing Motherhood & Scale', sub: 'Interview with CEO & Mom of three, Jane Doe.' },
  { type: 'video', title: 'Negotiation Tactics 101', sub: 'Short masterclass on holding your ground.' },
  { type: 'guide', title: 'De-stress Your Evenings', sub: 'Routines to disconnect from work mode.' },
];

export default function GrowthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);
  const [energyDays, setEnergyDays] = useState<EnergyDay[]>([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Fetch all data from APIs
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      
      // Fetch goals
      const goalsRes = await fetch('/api/growth/goals', { headers });
      const goalsData = await goalsRes.json();
      if (goalsData.goals?.length > 0) {
        setGoals(goalsData.goals);
      }
      
      // Fetch focus tasks
      const tasksRes = await fetch('/api/growth/focus-tasks', { headers });
      const tasksData = await tasksRes.json();
      if (tasksData.tasks?.length > 0) {
        setFocusTasks(tasksData.tasks);
        setCompletedTasks(new Set(tasksData.tasks.filter((t: FocusTask) => t.done).map((t: FocusTask) => t.id)));
      }
      
      // Fetch energy
      const energyRes = await fetch('/api/growth/energy', { headers });
      const energyData = await energyRes.json();
      if (energyData.energy?.length > 0) {
        setEnergyDays(energyData.energy);
      }
      
      // Fetch journal
      const journalRes = await fetch('/api/growth/journal', { headers });
      const journalData = await journalRes.json();
      if (journalData.entries?.length > 0) {
        setJournalEntries(journalData.entries);
      }
    } catch (error) {
      console.error('Error fetching growth data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle task completion
  const toggleTask = async (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    const isDone = newCompleted.has(taskId);
    
    if (isDone) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
    
    try {
      await fetch('/api/growth/focus-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, done: !isDone }),
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Add new task
  const addTask = async () => {
    const text = 'Add a new focus task...';
    setIsSaving(true);
    try {
      const res = await fetch('/api/growth/focus-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sub: 'Tap to edit' }),
      });
      const data = await res.json();
      if (data.task) {
        setFocusTasks([...focusTasks, data.task]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save journal entry
  const saveJournal = async () => {
    if (!journalEntry.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/growth/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: journalEntry }),
      });
      const data = await res.json();
      if (data.entry) {
        setJournalEntries([data.entry, ...journalEntries]);
        setJournalEntry('');
      }
    } catch (error) {
      console.error('Error saving journal:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update goal progress
  const updateGoalProgress = async (goalId: string, progress: number) => {
    try {
      await fetch('/api/growth/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalId, progress }),
      });
      setGoals(goals.map(g => g.id === goalId ? { ...g, progress } : g));
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // Check if user is logged in (has any data)
  const hasData = goals.length > 0 || focusTasks.length > 0 || energyDays.length > 0;
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
          <p className="text-slate-400">Loading your growth data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 flex flex-col overflow-hidden">
      <header className="h-16 border-b border-violet-500/20 bg-black/20 backdrop-blur flex items-center justify-between px-6 shrink-0 z-20">
        <Link href="/" className="flex items-center gap-2 text-violet-300 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex-1 max-w-md hidden sm:flex mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search insights, goals, or resources..."
              className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-lg bg-slate-800/80 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:text-sm"
            />
          </div>
        </div>
        <button aria-label="Notifications" className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-violet-500 rounded-full border-2 border-slate-900" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">My Growth Journey</h1>
            <p className="text-slate-400 text-base md:text-lg">{greeting()}. Let&apos;s grow together today.</p>
            {!hasData && (
              <p className="text-violet-400 text-sm font-medium mt-2">
                👋 Welcome! Start adding your goals and tasks below.
              </p>
            )}
          </div>

          <div className="bg-slate-800/60 rounded-xl border border-violet-500/20 overflow-hidden mb-8">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-violet-500/20 to-slate-900" />
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3 text-violet-400 font-bold uppercase text-xs tracking-wider">
                  <TrendingUp className="h-4 w-4" />
                  Sallie&apos;s Daily Insight
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Maximizing Morning Flow</h2>
                <p className="text-slate-400 leading-relaxed mb-6 max-w-2xl">
                  I&apos;ve analyzed your activity patterns and noticed you&apos;re 40% more creative between 7 AM and 10 AM.
                  I&apos;ve tentatively rescheduled your &quot;Strategy Deep Work&quot; block to 9 AM to capitalize on this flow state.
                </p>
                <div className="flex items-center gap-4">
                  <button className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2">
                    View Schedule Adjustment
                  </button>
                  <button className="text-slate-400 hover:text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">Dismiss</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Goal Progress</h3>
                <button 
                  onClick={() => router.push('/growth')}
                  className="text-sm text-violet-400 hover:text-white transition-colors font-medium"
                >
                  View All Goals
                </button>
              </div>
              <div className="grid gap-4">
                {goals.length === 0 ? (
                  <div className="bg-slate-800/60 border border-violet-500/20 p-5 rounded-xl text-center">
                    <p className="text-slate-400 mb-3">No goals yet. Create your first goal!</p>
                    <button className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                      Add Goal
                    </button>
                  </div>
                ) : (
                  goals.map((g) => (
                    <div key={g.id} className="bg-slate-800/60 border border-violet-500/20 p-5 rounded-xl hover:border-violet-500/40 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-slate-700/50 text-violet-400">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{g.title}</p>
                            <p className="text-xs text-slate-400">{g.sub}</p>
                          </div>
                        </div>
                        {g.progress != null && <span className={`text-sm font-bold ${g.color === 'rose' ? 'text-rose-400' : 'text-purple-400'}`}>{g.progress}%</span>}
                        {'streak' in g && <div className="flex items-center gap-1 text-violet-400 text-sm font-bold">🔥 {(g as unknown as { streak: number }).streak} Day Streak</div>}
                        {'sessions' in g && <span className="text-sm font-bold text-rose-400">{(g as unknown as { sessions: string }).sessions}</span>}
                      </div>
                      {g.progress != null && (
                        <div className="w-full bg-slate-900 rounded-full h-2 mt-2">
                          <div className={`h-2 rounded-full transition-all duration-1000 ${g.color === 'rose' ? 'bg-rose-400' : 'bg-purple-400'}`} style={{ width: `${g.progress}%` }} />
                        </div>
                      )}
                      {'streak' in g && (
                        <div className="flex gap-1 mt-2">
                          {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className={`h-2 flex-1 rounded-full ${i < (g as unknown as { streak: number }).streak ? 'bg-violet-500' : 'bg-slate-700'}`} />
                          ))}
                        </div>
                      )}
                      {g.nextStep && <p className="text-xs text-slate-400 mt-3 group-hover:text-white transition-colors">Next step: {g.nextStep}</p>}
                      {'scheduled' in g && <p className="text-xs text-slate-400 mt-3">Scheduled for {(g as unknown as { scheduled: string }).scheduled}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Focus for Today</h3>
                <span className="text-xs font-medium px-2 py-1 bg-slate-800 rounded text-slate-400">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="bg-slate-800/60 border border-violet-500/20 rounded-xl flex flex-col">
                {focusTasks.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    <p>No focus tasks yet.</p>
                  </div>
                ) : (
                  focusTasks.map((t) => (
                    <label key={t.id} className={`flex items-start gap-4 p-4 border-b border-violet-500/10 last:border-0 hover:bg-slate-700/30 transition-colors rounded-lg cursor-pointer group ${completedTasks.has(t.id) ? 'opacity-60' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={completedTasks.has(t.id)} 
                        onChange={() => toggleTask(t.id)} 
                        className="peer size-5 mt-1 rounded border-slate-600 bg-slate-800 text-violet-500 focus:ring-violet-500 cursor-pointer" 
                      />
                      <div className="flex flex-col">
                        <span className={`text-white font-medium group-hover:text-violet-300 transition-colors ${completedTasks.has(t.id) ? 'line-through' : ''}`}>{t.text}</span>
                        <span className="text-xs text-slate-400">{t.sub}</span>
                      </div>
                    </label>
                  ))
                )}
                <button 
                  onClick={addTask}
                  disabled={isSaving}
                  className="flex items-center gap-2 p-4 text-sm text-slate-400 hover:text-white font-medium transition-colors"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  Add a micro-goal
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
            <div className="bg-slate-800/60 border border-violet-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-bold text-white">Energy Levels</h3>
                </div>
                <span className="text-xs text-slate-400">Last 7 Days</span>
              </div>
              <div className="flex items-end justify-between h-40 gap-2">
                {energyDays.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                    Track your energy daily
                  </div>
                ) : (
                  energyDays.map((d) => (
                    <div key={d.day} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="w-full bg-slate-900 rounded-t-lg relative h-full flex items-end overflow-hidden">
                        <div className={`w-full rounded-t-lg transition-all ${d.current ? 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-violet-500/30 group-hover:bg-violet-500/50'}`} style={{ height: `${d.val}%` }} />
                      </div>
                      <span className={`text-xs ${d.current ? 'font-bold text-white' : 'text-slate-400'}`}>{d.day}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-800/60 border border-violet-500/20 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 text-violet-400">
                  <Edit3 className="h-5 w-5" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">Reflection</h3>
                </div>
                {journalEntries.length > 0 ? (
                  <p className="text-lg font-medium text-white mb-4">{journalEntries[0].content}</p>
                ) : (
                  <p className="text-lg font-medium text-white mb-4">You handled the conflict at work well yesterday. How did staying calm make you feel afterwards?</p>
                )}
                <textarea 
                  value={journalEntry} 
                  onChange={(e) => setJournalEntry(e.target.value)} 
                  placeholder="Type your thoughts here..." 
                  rows={3} 
                  className="w-full bg-slate-900 border-0 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-1 focus:ring-violet-500 focus:outline-none resize-none text-sm leading-relaxed" 
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-slate-400">Private & Secure</span>
                <button 
                  onClick={saveJournal}
                  disabled={isSaving || !journalEntry.trim()}
                  className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log Entry'}
                </button>
              </div>
            </div>
          </div>

          <div className="pb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recommended Resources</h3>
              <div className="flex gap-2">
                <button aria-label="Previous resources" className="p-1 rounded hover:bg-slate-700 text-white transition-colors"><ChevronLeft className="h-5 w-5" /></button>
                <button aria-label="Next resources" className="p-1 rounded hover:bg-slate-700 text-white transition-colors"><ChevronRight className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {RESOURCES.map((r, i) => (
                <div key={i} className="bg-slate-800/60 rounded-xl overflow-hidden border border-violet-500/20 group hover:-translate-y-1 hover:border-violet-500/40 transition-all duration-300 cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-violet-500/20 to-slate-900" />
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-violet-400 font-bold">{r.type.toUpperCase()}</div>
                    <h4 className="font-bold text-white leading-tight">{r.title}</h4>
                    <p className="text-xs text-slate-400">{r.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

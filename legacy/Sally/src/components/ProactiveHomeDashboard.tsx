'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Heart, Target, Zap, Activity, RefreshCw, Sparkles,
  CheckCircle2, Plus, Clock, Flame, MessageCircle, AlertCircle,
  ChevronRight, Send, TrendingUp, Star, Coffee, Moon, Sun,
  Shield, Eye, BookOpen,
} from 'lucide-react';

interface ProactiveNudge {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  action?: string;
  domain?: string;
  source: string;
}

interface ReflectionPrompt {
  id: string;
  prompt: string;
  category: string;
  context: string;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  progress: number;
  steps: Array<{ text: string; done: boolean }>;
  domain: string;
  stuckSince: string | null;
}

interface Habit {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  category: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  lastCheckin: string | null;
}

interface DashboardProps {
  limbicState?: { trust: number; warmth: number; arousal: number; valence: number };
}

const NUDGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  checkin: MessageCircle,
  reminder: Clock,
  encouragement: Star,
  question: Brain,
  insight: Eye,
  stuck_alert: AlertCircle,
  habit_nudge: Activity,
  reflection: BookOpen,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: '#FF6B6B',
  medium: '#FFB347',
  low: '#4ECDC4',
};

export function ProactiveHomeDashboard({ limbicState }: DashboardProps) {
  const [nudges, setNudges] = useState<ProactiveNudge[]>([]);
  const [reflections, setReflections] = useState<ReflectionPrompt[]>([]);
  const [reflectionResponses, setReflectionResponses] = useState<Record<string, string>>({});
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newHabitName, setNewHabitName] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [nudgeRes, reflRes, goalsRes, habitsRes] = await Promise.all([
        fetch('/api/proactive').catch(() => null),
        fetch('/api/reflections').catch(() => null),
        fetch('/api/goals?status=active').catch(() => null),
        fetch('/api/habits?status=active').catch(() => null),
      ]);

      if (nudgeRes?.ok) {
        const data = await nudgeRes.json();
        setNudges(data.nudges || []);
      }
      if (reflRes?.ok) {
        const data = await reflRes.json();
        const prompts = data.reflection?.prompts;
        if (Array.isArray(prompts)) setReflections(prompts);
        const responses = data.reflection?.responses;
        if (responses && typeof responses === 'object') setReflectionResponses(responses as Record<string, string>);
      }
      if (goalsRes?.ok) {
        const data = await goalsRes.json();
        setGoals(data.goals || []);
      }
      if (habitsRes?.ok) {
        const data = await habitsRes.json();
        setHabits(data.habits || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const dismissNudge = (id: string) => {
    setDismissedNudges(prev => new Set(prev).add(id));
  };

  const addGoal = async () => {
    if (!newGoalTitle.trim()) return;
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newGoalTitle.trim() }),
      });
      if (res.ok) {
        setNewGoalTitle('');
        setShowAddGoal(false);
        fetchAll();
      }
    } catch {}
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newHabitName.trim() }),
      });
      if (res.ok) {
        setNewHabitName('');
        setShowAddHabit(false);
        fetchAll();
      }
    } catch {}
  };

  const checkinHabit = async (habitId: string) => {
    setCheckingIn(habitId);
    try {
      await fetch(`/api/habits/${habitId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      fetchAll();
    } catch {
    } finally {
      setCheckingIn(null);
    }
  };

  const saveReflection = async (promptId: string, response: string) => {
    try {
      await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, response }),
      });
      setReflectionResponses(prev => ({ ...prev, [promptId]: response }));
    } catch {}
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Late night mode';
  const GreetingIcon = hour < 12 ? Sun : hour < 21 ? Coffee : Moon;
  const activeNudges = nudges.filter(n => !dismissedNudges.has(n.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Sallie is preparing your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border border-white/10"
        style={{ background: 'linear-gradient(135deg, rgba(0,168,150,0.08) 0%, rgba(13,17,23,0.95) 100%)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <GreetingIcon className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-white">{greeting}</h2>
          <button onClick={fetchAll} className="ml-auto p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
        {limbicState && (
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: limbicState.valence > 0.5 ? '#4ECDC4' : '#FF6B6B' }} />
              <span className="text-gray-400">Mood {Math.round(limbicState.valence * 100)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: limbicState.arousal > 0.4 ? '#FFB347' : '#9D8DF1' }} />
              <span className="text-gray-400">Energy {Math.round(limbicState.arousal * 100)}%</span>
            </div>
          </div>
        )}
      </motion.div>

      {activeNudges.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-white">From Sallie</span>
          </div>
          <div className="space-y-2">
            {activeNudges.slice(0, 4).map((nudge, idx) => {
              const Icon = NUDGE_ICONS[nudge.type] || MessageCircle;
              const priorityColor = PRIORITY_COLORS[nudge.priority] || '#4ECDC4';
              return (
                <motion.div
                  key={nudge.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="p-3.5 rounded-xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.05] transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg mt-0.5" style={{ backgroundColor: `${priorityColor}15` }}>
                      <Icon className="w-4 h-4" color={priorityColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-white">{nudge.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${priorityColor}20`, color: priorityColor }}>
                          {nudge.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{nudge.message}</p>
                      <span className="text-[10px] text-gray-600 mt-1 block">{nudge.source.replace(/_/g, ' ')}</span>
                    </div>
                    <button
                      onClick={() => dismissNudge(nudge.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-gray-400 text-xs transition-opacity"
                    >
                      dismiss
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {reflections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">Daily Reflections</span>
          </div>
          {reflections.map((refl, idx) => {
            const answered = !!reflectionResponses[refl.id];
            return (
              <motion.div
                key={refl.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl border border-white/8 bg-white/[0.03]"
              >
                <p className="text-sm text-gray-200 mb-2 leading-relaxed">{refl.prompt}</p>
                {!answered ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Your reflection..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-400/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value.trim();
                          if (value) saveReflection(refl.id, value);
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                        if (input?.value.trim()) saveReflection(refl.id, input.value.trim());
                      }}
                      className="p-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 text-violet-400" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Reflected</span>
                  </div>
                )}
                <span className="text-[10px] text-gray-600 mt-1.5 block">{refl.context}</span>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-semibold text-white">Goals</span>
            <span className="text-xs text-gray-600">({goals.length})</span>
          </div>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
          </button>
        </div>

        <AnimatePresence>
          {showAddGoal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="What do you want to achieve?"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-400/50"
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                autoFocus
              />
              <button onClick={addGoal} className="px-3 py-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-sm transition-colors">
                Add
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {goals.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
            <p className="text-xs text-gray-500">No goals yet. Add one to let Sallie help you stay on track.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {goals.map(goal => {
              const isStuck = goal.stuckSince && (Date.now() - new Date(goal.stuckSince).getTime()) > 3 * 24 * 60 * 60 * 1000;
              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl border border-white/8 bg-white/[0.03]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{goal.title}</span>
                    <div className="flex items-center gap-2">
                      {isStuck && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">stuck</span>
                      )}
                      <span className="text-xs text-gray-500">{goal.progress}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: isStuck ? '#FF6B6B' : '#00A896' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">Habits</span>
            <span className="text-xs text-gray-600">({habits.length})</span>
          </div>
          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-violet-400" />
          </button>
        </div>

        <AnimatePresence>
          {showAddHabit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="What habit do you want to build?"
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-400/50"
                onKeyDown={(e) => e.key === 'Enter' && addHabit()}
                autoFocus
              />
              <button onClick={addHabit} className="px-3 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 text-sm transition-colors">
                Add
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {habits.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
            <p className="text-xs text-gray-500">No habits tracked yet. Start small — even 2-minute habits count.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {habits.map(habit => {
              const isCheckedToday = habit.lastCheckin && (Date.now() - new Date(habit.lastCheckin).getTime()) < 20 * 60 * 60 * 1000;
              return (
                <div
                  key={habit.id}
                  className="p-3 rounded-xl border border-white/8 bg-white/[0.03] flex items-center gap-3"
                >
                  <button
                    onClick={() => !isCheckedToday && checkinHabit(habit.id)}
                    disabled={!!isCheckedToday || checkingIn === habit.id}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isCheckedToday
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/5 hover:bg-violet-500/20 text-gray-500 hover:text-violet-400'
                    }`}
                  >
                    {checkingIn === habit.id ? (
                      <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                    ) : isCheckedToday ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-current" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white">{habit.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {habit.currentStreak > 0 && (
                        <span className="text-[10px] text-orange-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> {habit.currentStreak}d streak
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600">{habit.totalCheckins} total</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

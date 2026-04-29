'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Moon, Heart, Brain, Sparkles, Bell, Check, AlertTriangle, HandMetal, Activity, Target, ChevronRight, Clock } from 'lucide-react';
import { useGhostPulse } from '@/hooks/useGhostPulse';
import { useProactiveNudges, type ProactiveNudge } from '@/hooks/useProactiveNudges';

interface GhostSuggestion {
  text: string;
  type: string;
  priority: number;
}

function getNudgeRoute(nudge: ProactiveNudge): string {
  if (nudge.action?.startsWith('goal:')) return '/goals';
  if (nudge.action?.startsWith('habit:')) return '/habits';
  if (nudge.type === 'reflection') return '/reflections';
  if (nudge.type === 'checkin') return '/';
  if (nudge.type === 'insight') return '/mind-core';
  return '/';
}

function getNudgeIcon(type: string) {
  switch (type) {
    case 'checkin': return <MessageCircle className="w-4 h-4" />;
    case 'reminder': return <Clock className="w-4 h-4" />;
    case 'encouragement': return <Sparkles className="w-4 h-4" />;
    case 'question': return <Brain className="w-4 h-4" />;
    case 'insight': return <Brain className="w-4 h-4" />;
    case 'stuck_alert': return <AlertTriangle className="w-4 h-4" />;
    case 'habit_nudge': return <Activity className="w-4 h-4" />;
    case 'reflection': return <Moon className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
}

function getNudgeColor(priority: string) {
  switch (priority) {
    case 'high': return '#FF6B6B';
    case 'medium': return '#FFB347';
    case 'low': return '#4ECDC4';
    default: return '#14B8A6';
  }
}

export function GhostNotifications() {
  const router = useRouter();
  const { newNudgeForToast, clearToast, dismiss: dismissNudge } = useProactiveNudges();
  const [toastNudge, setToastNudge] = useState<ProactiveNudge | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (newNudgeForToast && !toastVisible) {
      setToastNudge(newNudgeForToast);
      setToastVisible(true);
      clearToast();
    }
  }, [newNudgeForToast, toastVisible, clearToast]);

  useEffect(() => {
    if (toastVisible && !isHovering) {
      toastTimerRef.current = setTimeout(() => {
        setToastVisible(false);
        setTimeout(() => setToastNudge(null), 300);
      }, 10000);
    }
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toastVisible, isHovering]);

  const handleToastClick = () => {
    if (toastNudge) {
      const route = getNudgeRoute(toastNudge);
      dismissNudge(toastNudge.id);
      setToastVisible(false);
      setTimeout(() => setToastNudge(null), 300);
      router.push(route);
    }
  };

  const handleToastDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toastNudge) dismissNudge(toastNudge.id);
    setToastVisible(false);
    setTimeout(() => setToastNudge(null), 300);
  };

  const [localSuggestions, setLocalSuggestions] = useState<GhostSuggestion[]>([]);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const {
    pulseState,
    suggestions: pulseSuggestions,
    recordActivity,
    dismissVeto,
    dismissShoulderTap,
  } = useGhostPulse({
    enabled: true,
    pulseIntervalMs: 30000,
    idleThresholdMs: 120000,
    shoulderTapDelayMs: 300000,
  });

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch('/api/ghost/suggestions');
      if (res.ok) {
        const data = await res.json();
        if (data.suggestions?.length > 0) {
          const newSuggestions = data.suggestions.filter(
            (s: GhostSuggestion) => !dismissed.has(s.text)
          );
          if (newSuggestions.length > 0) {
            setLocalSuggestions(newSuggestions);
            setVisible(true);
          }
        }
      }
    } catch {
    }
  }, [dismissed]);

  useEffect(() => {
    if (pulseSuggestions.length > 0) {
      const filtered = pulseSuggestions.filter(s => !dismissed.has(s.text));
      if (filtered.length > 0) {
        setLocalSuggestions(filtered);
        setVisible(true);
      }
    }
  }, [pulseSuggestions, dismissed]);

  useEffect(() => {
    const timer = setTimeout(fetchSuggestions, 5000);
    const interval = setInterval(fetchSuggestions, 120000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchSuggestions]);

  const dismissSuggestion = (text: string) => {
    setDismissed(prev => new Set(prev).add(text));
    setLocalSuggestions(prev => prev.filter(s => s.text !== text));
    if (localSuggestions.length <= 1) setVisible(false);
    recordActivity('dismiss_suggestion');
  };

  const dismissAll = () => {
    localSuggestions.forEach(s => setDismissed(prev => new Set(prev).add(s.text)));
    setLocalSuggestions([]);
    setVisible(false);
    recordActivity('dismiss_all');
  };

  const handleShoulderTapDismiss = () => {
    dismissShoulderTap();
    recordActivity('shoulder_tap_dismiss');
  };

  const handleVetoDismiss = () => {
    dismissVeto();
    recordActivity('veto_dismiss');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'reconnect': return <MessageCircle className="w-4 h-4" />;
      case 'wellbeing': return <Moon className="w-4 h-4" />;
      case 'motivation': return <Sparkles className="w-4 h-4" />;
      case 'reflection': return <Brain className="w-4 h-4" />;
      case 'greeting': return <Heart className="w-4 h-4" />;
      case 'emotional_support': return <Heart className="w-4 h-4" />;
      case 'bonding': return <Heart className="w-4 h-4" />;
      case 'onboarding': return <Sparkles className="w-4 h-4" />;
      case 'creative': return <Sparkles className="w-4 h-4" />;
      case 'productivity': return <Activity className="w-4 h-4" />;
      case 'morning_routine': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'reconnect': return '#06B6D4';
      case 'wellbeing': return '#A78BFA';
      case 'motivation': return '#F59E0B';
      case 'reflection': return '#8B5CF6';
      case 'greeting': return '#EC4899';
      case 'emotional_support': return '#F472B6';
      case 'bonding': return '#EC4899';
      case 'onboarding': return '#10B981';
      case 'creative': return '#F59E0B';
      case 'productivity': return '#3B82F6';
      case 'morning_routine': return '#FBBF24';
      default: return '#14B8A6';
    }
  };

  return (
    <>
      {pulseState.active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="fixed top-4 right-4 z-40"
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: '#14B8A6',
              boxShadow: `0 0 ${8 + pulseState.intensity * 12}px ${4 + pulseState.intensity * 6}px rgba(20, 184, 166, ${0.3 + pulseState.intensity * 0.4})`,
            }}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {pulseState.shoulderTapPending && (
          <motion.div
            key="shoulder-tap"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-16 right-6 z-[60] w-72"
          >
            <div className="rounded-xl border border-teal-500/30 bg-[#0d1117]/95 backdrop-blur-xl p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 flex-shrink-0">
                  <HandMetal className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-teal-300 mb-1">Hey, still there?</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {pulseState.context.idleMinutes > 10
                      ? "You've been quiet for a while. Everything okay?"
                      : "Just checking in. I'm here if you need me."}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={handleShoulderTapDismiss}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 transition-colors"
                    >
                      <Check className="w-3 h-3" /> I'm good
                    </button>
                    <button
                      onClick={() => {
                        handleShoulderTapDismiss();
                        fetchSuggestions();
                      }}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                    >
                      <MessageCircle className="w-3 h-3" /> Talk
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleShoulderTapDismiss}
                  className="text-gray-500 hover:text-gray-300 transition-all p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pulseState.vetoPending && pulseState.vetoReason && (
          <motion.div
            key="veto-popup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="w-96 rounded-2xl border border-amber-500/30 bg-[#0d1117] p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-300">Sallie's Veto</h3>
                  <p className="text-xs text-gray-500">Ghost override triggered</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">
                {pulseState.vetoReason}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleVetoDismiss}
                  className="flex-1 flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors font-medium"
                >
                  <Check className="w-4 h-4" /> Acknowledged
                </button>
                <button
                  onClick={handleVetoDismiss}
                  className="flex items-center justify-center gap-2 text-sm px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                >
                  Override
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && localSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-20 right-6 z-50 w-80 space-y-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Sallie whispers...
              </span>
              {localSuggestions.length > 1 && (
                <button
                  onClick={dismissAll}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Dismiss all
                </button>
              )}
            </div>
            {localSuggestions.slice(0, 3).map((suggestion, i) => (
              <motion.div
                key={suggestion.text}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-xl border border-white/10 bg-[#0d1117]/95 backdrop-blur-xl p-4 shadow-xl"
                style={{ borderLeftColor: getColor(suggestion.type), borderLeftWidth: 3 }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="p-1.5 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${getColor(suggestion.type)}15`, color: getColor(suggestion.type) }}
                  >
                    {getIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 leading-relaxed">{suggestion.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => dismissSuggestion(suggestion.text)}
                        className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        <Check className="w-3 h-3" /> Got it
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissSuggestion(suggestion.text)}
                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-all p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastVisible && toastNudge && (
          <motion.div
            key="proactive-toast"
            initial={{ opacity: 0, y: 80, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-[55] w-80 cursor-pointer"
            onClick={handleToastClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div
              className="rounded-2xl border bg-[#0d1117]/95 backdrop-blur-xl p-4 shadow-2xl"
              style={{ borderColor: `${getNudgeColor(toastNudge.priority)}40` }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white font-bold">S</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-teal-400">Sallie says</span>
                    <div
                      className="p-0.5 rounded"
                      style={{ backgroundColor: `${getNudgeColor(toastNudge.priority)}20`, color: getNudgeColor(toastNudge.priority) }}
                    >
                      {getNudgeIcon(toastNudge.type)}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-white mb-0.5">{toastNudge.title}</p>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{toastNudge.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
                      <ChevronRight className="w-3 h-3" /> View
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleToastDismiss}
                  className="text-gray-500 hover:text-gray-300 transition-all p-1 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <motion.div
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full origin-left"
                style={{ backgroundColor: getNudgeColor(toastNudge.priority) }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: isHovering ? 1 : 0 }}
                transition={{ duration: isHovering ? 0 : 10, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Zap, Heart, Brain, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { useSallieMode } from '@/store/useSallieMode';
import { GLASS_BASE } from './sallie-ui';

const NUDGE_ICONS: Record<string, React.ReactNode> = {
  checkin: <Heart className="w-4 h-4" />,
  reminder: <Clock className="w-4 h-4" />,
  encouragement: <Sparkles className="w-4 h-4" />,
  question: <Brain className="w-4 h-4" />,
  insight: <Zap className="w-4 h-4" />,
  stuck_alert: <AlertTriangle className="w-4 h-4" />,
  habit_nudge: <Clock className="w-4 h-4" />,
  reflection: <Brain className="w-4 h-4" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#C8A84E',
  low: '#06B6D4',
};

export function ShoulderTapOverlay() {
  const { nudges, addNudge, dismissNudge, heritageDNA } = useSallieMode();

  const vetoCheck = useCallback((nudge: { title: string; message: string }) => {
    if (!heritageDNA?.core) return { vetoed: false, reason: '' };
    const coreValues = Object.values(heritageDNA.core).join(' ').toLowerCase();
    const nudgeText = `${nudge.title} ${nudge.message}`.toLowerCase();

    const redFlags = ['give up', 'quit', 'abandon', 'betray', 'lie', 'cheat', 'unsafe'];
    const flagged = redFlags.find(flag => nudgeText.includes(flag) && !coreValues.includes(flag));
    if (flagged) {
      return { vetoed: true, reason: `Conflicts with your core values (flagged: "${flagged}")` };
    }
    return { vetoed: false, reason: '' };
  }, [heritageDNA]);

  useEffect(() => {
    const handleNudges = (e: CustomEvent) => {
      const incoming = e.detail as Array<{ id: string; type: string; title: string; message: string; priority: string; domain?: string }>;
      incoming?.forEach(nudge => {
        const veto = vetoCheck(nudge);
        if (!veto.vetoed) {
          addNudge(nudge);
        }
      });
    };
    const handleGhost = (e: CustomEvent) => {
      const suggestions = e.detail?.suggestions as Array<{ id: string; text: string; type: string }> | undefined;
      suggestions?.forEach(s => {
        const veto = vetoCheck({ title: s.type, message: s.text });
        if (!veto.vetoed) {
          addNudge({ id: s.id || `ghost-${Date.now()}`, type: s.type || 'insight', title: 'Shoulder Tap', message: s.text, priority: 'medium' });
        }
      });
    };

    window.addEventListener('sallie:nudges', handleNudges as EventListener);
    window.addEventListener('sallie:ghost', handleGhost as EventListener);
    return () => {
      window.removeEventListener('sallie:nudges', handleNudges as EventListener);
      window.removeEventListener('sallie:ghost', handleGhost as EventListener);
    };
  }, [addNudge, vetoCheck]);

  if (nudges.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[80] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {nudges.slice(0, 3).map((nudge) => {
          const color = PRIORITY_COLORS[nudge.priority] || '#C8A84E';
          const icon = NUDGE_ICONS[nudge.type] || <Sparkles className="w-4 h-4" />;
          return (
            <motion.div
              key={nudge.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto rounded-2xl overflow-hidden"
              style={{
                ...GLASS_BASE,
                background: 'linear-gradient(160deg, rgba(14,16,21,0.95), rgba(10,12,18,0.98))',
                border: `1px solid ${color}20`,
                boxShadow: `0 0 40px ${color}08, 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent 10%, ${color}50 50%, transparent 90%)` }} />
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl flex-shrink-0 mt-0.5" style={{ background: `${color}10`, boxShadow: `0 0 12px ${color}08` }}>
                    <span style={{ color }}>{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color }}>
                        {nudge.type.replace('_', ' ')}
                      </span>
                      {nudge.domain && (
                        <span className="text-[9px] font-bold text-white/20 uppercase">&middot; {nudge.domain}</span>
                      )}
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">{nudge.message}</p>
                  </div>
                  <button
                    onClick={() => dismissNudge(nudge.id)}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5 text-white/25" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {nudges.length > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-auto text-center"
        >
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
            +{nudges.length - 3} more nudges
          </span>
        </motion.div>
      )}
    </div>
  );
}

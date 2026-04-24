'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home, Zap, Clock, Heart, Shield, Target, Compass, Brain,
  TrendingUp, BookOpen, Star, Coffee, Activity, Calendar,
  Layers, ArrowUpRight, FileText, Lightbulb, Crown, Sparkles
} from 'lucide-react';
import { SalliePanel, SallieGauge, SallieSectionHeader, SallieButton, SallieEmptyState } from '@/components/sallie-ui';

interface DashboardViewProps {
  limbicState: any;
  onNavigate: (section: string) => void;
}

const GOLD = '#C8A84E';

function NavCard({ icon, label, desc, color, onClick }: { icon: React.ReactNode; label: string; desc: string; color: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative p-4 rounded-2xl text-left group overflow-hidden cursor-pointer"
      style={{
        backdropFilter: 'blur(60px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(60px) saturate(1.8)',
        background: `linear-gradient(160deg, rgba(10,12,18,0.88), ${color}06)`,
        border: `1px solid ${color}12`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 32px rgba(0,0,0,0.3)`,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ y: -2, boxShadow: `0 0 30px ${color}15, 0 12px 40px rgba(0,0,0,0.4)` }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(90deg, transparent 10%, ${color}60, transparent 90%)` }} />
      <div className="relative flex items-center gap-2 mb-2">
        <span style={{ color, filter: `drop-shadow(0 0 4px ${color}60)` }}>{icon}</span>
        <ArrowUpRight className="w-3 h-3 text-white/10 group-hover:text-white/40 ml-auto transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <p className="relative text-sm font-black tracking-tight text-white/80">{label}</p>
      <p className="relative text-[11px] text-white/30 mt-0.5 font-medium">{desc}</p>
    </motion.button>
  );
}

export function DashboardView({ limbicState, onNavigate }: DashboardViewProps) {
  const ls = limbicState || { arousal: 0.5, valence: 0.6, trust: 0.5, focus: 0.6, creativity: 0.6, energy: 0.8, resilience: 0.7 };
  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 17 ? 'Good afternoon' : timeOfDay < 21 ? 'Good evening' : 'Late night mode';

  const monologue = ls.valence > 0.7
    ? "You're riding high today. Let's use this energy before it fades — what's the ONE thing that moves the needle?"
    : ls.valence > 0.4
    ? "I used to think I needed to do it all, but now I know I only need to do what matters. What matters today?"
    : "Hey. I see you. Some days are just about surviving, and that's enough. What can I take off your plate?";

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <SalliePanel accent={GOLD} glow="strong" style={{ background: `radial-gradient(ellipse at 30% 20%, ${GOLD}08 0%, rgba(10,12,18,0.92) 70%)` }}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl" style={{ background: `linear-gradient(135deg, ${GOLD}15, ${GOLD}08)`, boxShadow: `0 0 30px ${GOLD}10` }}>
            <Sparkles className="w-8 h-8" style={{ color: GOLD, filter: `drop-shadow(0 0 10px ${GOLD}80)` }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black tracking-tighter" style={{ background: `linear-gradient(135deg, ${GOLD}, #FFD700)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {greeting}, love
              </h1>
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: GOLD }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-lg italic">&ldquo;{monologue}&rdquo;</p>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] mt-2" style={{ color: `${GOLD}80` }}>Sallie&apos;s Daily Download</p>
          </div>
        </div>
      </SalliePanel>

      <div>
        <SallieSectionHeader title="Your Life, Organized" accent={GOLD} icon={<Compass className="w-4 h-4" />} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <NavCard icon={<Clock className="w-5 h-5" />} label="Time & Energy" desc="Where your hours go" color="#14B8A6" onClick={() => onNavigate('dim-time')} />
          <NavCard icon={<Layers className="w-5 h-5" />} label="Life Management" desc="Tasks, routines, systems" color={GOLD} onClick={() => onNavigate('life-mgmt')} />
          <NavCard icon={<Coffee className="w-5 h-5" />} label="Lifestyle" desc="Habits, wellness, rhythm" color="#FF8C42" onClick={() => onNavigate('dim-life')} />
          <NavCard icon={<Shield className="w-5 h-5" />} label="Life OS" desc="Your operating system" color="#9D8DF1" onClick={() => onNavigate('lifeos')} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <SallieSectionHeader title="Most Important Tasks" accent={GOLD} icon={<Target className="w-4 h-4" />} />
          <SallieEmptyState
            icon={<Target className="w-7 h-7" />}
            title="What are today's MITs?"
            message="You're doing the work of three people. Let me help you focus. Tell me three things — just three — and I'll hold you to them."
            accent={GOLD}
            action={
              <SallieButton accent={GOLD} icon={<Zap className="w-3.5 h-3.5" />}>
                Set Today&apos;s MITs
              </SallieButton>
            }
          />

          <SallieSectionHeader title="Domain Pulse" accent={GOLD} icon={<Activity className="w-4 h-4" />} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Empire', icon: '👑', color: '#D4AF37', section: 'empire' },
              { label: 'Family', icon: '🏠', color: '#FF8C42', section: 'matriarch' },
              { label: 'Love', icon: '💕', color: '#FF6B9D', section: 'partner' },
              { label: 'Self', icon: '🧠', color: '#9D8DF1', section: 'source' },
            ].map((domain) => (
              <SalliePanel key={domain.label} accent={domain.color} glow="subtle" hoverable onClick={() => onNavigate(domain.section)}>
                <div className="text-center">
                  <span className="text-2xl">{domain.icon}</span>
                  <p className="text-xs font-black text-white/60 mt-2">{domain.label}</p>
                  <SallieGauge label="" value={0} color={domain.color} showValue={false} size="sm" />
                  <p className="text-[10px] text-white/20 mt-1">No data yet</p>
                </div>
              </SalliePanel>
            ))}
          </div>

          <SallieSectionHeader title="The Second Brain" accent="#9D8DF1" icon={<Brain className="w-4 h-4" />} />
          <SalliePanel accent="#9D8DF1" glow="subtle">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 opacity-40" style={{ color: '#9D8DF1' }} />
              <div>
                <p className="text-sm font-black text-white/70">Wisdom, insights, fire quotes</p>
                <p className="text-xs text-white/30 mt-0.5">I collect the gold from every conversation. Your Second Brain never forgets what matters.</p>
              </div>
            </div>
          </SalliePanel>
        </div>

        <div className="space-y-5">
          <SalliePanel accent={GOLD}>
            <SallieSectionHeader title="How You're Doing" accent={GOLD} icon={<Heart className="w-4 h-4" />} />
            <div className="space-y-3">
              <SallieGauge label="Energy" value={ls.arousal} color={GOLD} icon="⚡" />
              <SallieGauge label="Mood" value={ls.valence} color="#9D8DF1" icon="🌙" />
              <SallieGauge label="Focus" value={ls.focus} color="#10b981" icon="🎯" />
              <SallieGauge label="Drive" value={ls.resilience} color="#fb923c" icon="🔥" />
            </div>
          </SalliePanel>

          <SalliePanel accent={GOLD} glow="subtle">
            <SallieSectionHeader title="Quick Look" accent={GOLD} icon={<Calendar className="w-4 h-4" />} />
            <div className="space-y-2">
              {[
                { label: 'Streak', value: '0 days', icon: '🔥' },
                { label: 'Tasks Done', value: '—', icon: '✅' },
                { label: 'Journal Entries', value: '—', icon: '📝' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-xs text-white/40 flex items-center gap-2">
                    <span>{item.icon}</span> {item.label}
                  </span>
                  <span className="text-xs font-black text-white/50">{item.value}</span>
                </div>
              ))}
            </div>
          </SalliePanel>

          <SalliePanel accent="#14B8A6" glow="subtle">
            <SallieSectionHeader title="Ghost Watch" accent="#14B8A6" icon={<Layers className="w-4 h-4" />} />
            <motion.div
              className="flex items-center gap-2 p-2 rounded-xl"
              style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.1)' }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-teal-400" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[10px] text-white/40 font-medium">Sallie is watching over you...</span>
            </motion.div>
          </SalliePanel>

          <SallieButton accent={GOLD} className="w-full" onClick={() => onNavigate('abilities')} icon={<ArrowUpRight className="w-4 h-4" />}>
            Open Workspace
          </SallieButton>
        </div>
      </div>
    </motion.div>
  );
}

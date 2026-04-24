'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Activity, Anchor, Compass, Eye, Shield, BookOpen,
  Waves, TrendingUp, Sparkles, GraduationCap, Target, Zap,
  Timer, Lightbulb, BookMarked, Download, User, Puzzle
} from 'lucide-react';
import { SalliePanel, SallieGauge, SallieSectionHeader, SallieEmptyState, SallieButton } from '@/components/sallie-ui';

interface SourceViewProps {
  limbicState: any;
  onNavigate: (section: string) => void;
}

const VIOLET = '#9D8DF1';
const AMBER = '#D4A574';
const GOLD = '#FFD700';
const PEACOCK_OVERLAY = `radial-gradient(ellipse at 20% 30%, ${VIOLET}06 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, ${AMBER}04 0%, transparent 50%)`;

function NavCard({ icon, label, desc, color, onClick }: { icon: React.ReactNode; label: string; desc: string; color: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative p-3 rounded-xl text-left group overflow-hidden cursor-pointer"
      style={{
        backdropFilter: 'blur(60px) saturate(1.8)',
        background: `linear-gradient(160deg, rgba(10,12,18,0.85), ${color}06)`,
        border: `1px solid ${color}12`,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ y: -2, boxShadow: `0 0 25px ${color}12` }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color, filter: `drop-shadow(0 0 4px ${color}50)` }}>{icon}</span>
      </div>
      <p className="text-xs font-black text-white/75">{label}</p>
      <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>
    </motion.button>
  );
}

export function SourceView({ limbicState, onNavigate }: SourceViewProps) {
  const ls = limbicState || { arousal: 0.5, valence: 0.6, trust: 0.5, focus: 0.6, creativity: 0.6 };

  return (
    <motion.div
      className="relative space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-60" style={{ background: PEACOCK_OVERLAY }} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, ${VIOLET}15, ${AMBER}10)`, boxShadow: `0 0 20px ${VIOLET}10` }}>
            <Brain className="w-7 h-7" style={{ color: VIOLET, filter: `drop-shadow(0 0 8px ${VIOLET}80)` }} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter" style={{ background: `linear-gradient(135deg, ${VIOLET}, ${AMBER})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SOURCE</h1>
            <p className="text-white/25 text-[10px] tracking-[0.25em] uppercase font-black">The Self Lab &middot; HeartSync</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: `${VIOLET}08`, border: `1px solid ${VIOLET}15` }}>
          <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: VIOLET }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: VIOLET }}>Reflective</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'ADHD', emoji: '⚡', tip: 'Hyperfocus superpower' },
          { label: 'OCD', emoji: '🎯', tip: 'Pattern recognition genius' },
          { label: 'Bipolar', emoji: '🌊', tip: 'Emotional depth & intensity' },
          { label: 'PTSD', emoji: '🛡️', tip: 'Warrior survivor strength' },
          { label: 'Gemini', emoji: '♊', tip: 'Duality is your gift' },
          { label: 'INFJ-A', emoji: '🔮', tip: 'The Advocate' },
        ].map((badge) => (
          <SalliePanel key={badge.label} accent={AMBER} glow="subtle" className="!p-2" style={{ background: `linear-gradient(135deg, ${AMBER}06, ${VIOLET}04)` }}>
            <div className="flex items-center gap-2 cursor-pointer" title={badge.tip}>
              <span className="text-base">{badge.emoji}</span>
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: AMBER }}>{badge.label}</span>
            </div>
          </SalliePanel>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <NavCard icon={<Activity className="w-4 h-4" />} label="Feelings" desc="How you're really doing" color={VIOLET} onClick={() => onNavigate('limbic')} />
        <NavCard icon={<Anchor className="w-4 h-4" />} label="Heritage DNA" desc="Where you come from" color={VIOLET} onClick={() => onNavigate('heritage')} />
        <NavCard icon={<Compass className="w-4 h-4" />} label="Convergence" desc="30 questions that change everything" color={VIOLET} onClick={() => onNavigate('convergence-30')} />
        <NavCard icon={<Eye className="w-4 h-4" />} label="Identity" desc="Who you are at your core" color={VIOLET} onClick={() => onNavigate('identity')} />
        <NavCard icon={<Shield className="w-4 h-4" />} label="Core Protection" desc="Non-negotiable values" color={VIOLET} onClick={() => onNavigate('core-identity')} />
        <NavCard icon={<BookMarked className="w-4 h-4" />} label="Journal" desc="Your thoughts, sacred" color={VIOLET} onClick={() => onNavigate('thought-journal')} />
        <NavCard icon={<Waves className="w-4 h-4" />} label="Healing" desc="Recovery isn't linear" color={VIOLET} onClick={() => onNavigate('dim-healing')} />
        <NavCard icon={<TrendingUp className="w-4 h-4" />} label="Personal Growth" desc="Every version matters" color={VIOLET} onClick={() => onNavigate('growth')} />
        <NavCard icon={<Sparkles className="w-4 h-4" />} label="Growth Garden" desc="Watch what you planted bloom" color={VIOLET} onClick={() => onNavigate('dim-growth')} />
        <NavCard icon={<GraduationCap className="w-4 h-4" />} label="Learning" desc="Feed the mind" color={VIOLET} onClick={() => onNavigate('learning')} />
        <NavCard icon={<Target className="w-4 h-4" />} label="Alignment" desc="Living what you believe?" color={VIOLET} onClick={() => onNavigate('alignment')} />
        <NavCard icon={<Zap className="w-4 h-4" />} label="Transcendence" desc="The version yet to arrive" color={VIOLET} onClick={() => onNavigate('dim-transcend')} />
        <NavCard icon={<User className="w-4 h-4" />} label="Profile" desc="Your story, your way" color={VIOLET} onClick={() => onNavigate('profile')} />
        <NavCard icon={<Download className="w-4 h-4" />} label="Data Export" desc="Your copy, your data" color={VIOLET} onClick={() => onNavigate('data-export')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <SallieSectionHeader title="Energy & Mood Tracker" accent={VIOLET} icon={<Activity className="w-4 h-4" />} />
          <SalliePanel accent={VIOLET}>
            <div className="text-center mb-4">
              <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" style={{ color: VIOLET, filter: `drop-shadow(0 0 8px ${VIOLET}60)` }} />
              <p className="text-sm font-black text-white/75 mb-1">How are you really feeling?</p>
              <p className="text-xs text-white/30">Your hustle can&apos;t outpace your health. Check in and I&apos;ll learn your rhythms.</p>
            </div>
            <div className="space-y-3">
              <SallieGauge label="Energy" value={ls.arousal} color={GOLD} icon="⚡" />
              <SallieGauge label="Mood" value={ls.valence} color={VIOLET} icon="🌙" />
              <SallieGauge label="Focus" value={ls.focus} color="#10b981" icon="🎯" />
              <SallieGauge label="Creativity" value={ls.creativity} color={AMBER} icon="🎨" />
            </div>
            <p className="text-[10px] mt-4 font-black uppercase tracking-[0.15em] text-center" style={{ color: VIOLET }}>Soul care ain&apos;t optional</p>
          </SalliePanel>

          <SallieSectionHeader title="ADHD Focus Dashboard" accent={GOLD} icon={<Zap className="w-4 h-4" />} />
          <SalliePanel accent={GOLD}>
            <Zap className="w-7 h-7 mx-auto mb-3 opacity-50" style={{ color: GOLD, filter: `drop-shadow(0 0 8px ${GOLD}60)` }} />
            <p className="text-sm font-black text-white/75 text-center mb-1">Your brain isn&apos;t broken &mdash; it&apos;s brilliant</p>
            <p className="text-xs text-white/30 text-center">I&apos;ll learn when you hyperfocus, when you hit the wall. We work WITH it, never against it.</p>
            <p className="text-[10px] mt-3 font-black uppercase tracking-[0.15em] text-center" style={{ color: GOLD }}>ADHD is the superpower. Period.</p>
            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg" style={{ background: `${GOLD}06`, border: `1px solid ${GOLD}12` }}>
              <Timer className="w-4 h-4" style={{ color: GOLD }} />
              <span className="text-[10px] text-white/30">Time blindness alert: Check the clock!</span>
            </div>
          </SalliePanel>

          <SallieSectionHeader title="Grounding Toolkit" accent="#10b981" icon={<Anchor className="w-4 h-4" />} />
          <div className="space-y-2">
            {[
              { exercise: '5-4-3-2-1 Sensory Check', desc: '5 things you see, 4 you touch, 3 you hear...', icon: <Eye className="w-4 h-4" style={{ color: '#10b981' }} />, quick: true },
              { exercise: 'Box Breathing', desc: '4 in, 4 hold, 4 out, 4 hold', icon: <Waves className="w-4 h-4" style={{ color: '#06b6d4' }} />, quick: true },
              { exercise: 'Body Scan', desc: 'Progressive muscle check from toes to crown', icon: <Activity className="w-4 h-4" style={{ color: VIOLET }} />, quick: false },
              { exercise: 'Safety Anchor', desc: 'Your safe word, safe place, safe person', icon: <Anchor className="w-4 h-4" style={{ color: AMBER }} />, quick: true },
            ].map((ex, i) => (
              <SalliePanel key={i} accent="#10b981" glow="subtle" hoverable className="!p-3">
                <div className="flex items-center gap-3">
                  {ex.icon}
                  <div className="flex-1">
                    <p className="text-sm text-white/60">{ex.exercise}</p>
                    <p className="text-[10px] text-white/25">{ex.desc}</p>
                  </div>
                  {ex.quick && <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">Quick</span>}
                </div>
              </SalliePanel>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <SalliePanel accent={AMBER}>
            <SallieSectionHeader title="Pattern Watch" accent={AMBER} icon={<Puzzle className="w-4 h-4" />} />
            <Puzzle className="w-6 h-6 mx-auto mb-2 opacity-40" style={{ color: AMBER }} />
            <p className="text-sm font-black text-white/70 text-center mb-1">I&apos;m learning your loops</p>
            <p className="text-xs text-white/30 text-center">Thought loops, OCD rituals, rumination &mdash; I track without judgment.</p>
            <p className="text-[10px] mt-3 font-black uppercase tracking-[0.15em] text-center" style={{ color: AMBER }}>Awareness without judgment</p>
          </SalliePanel>

          <SalliePanel accent={VIOLET}>
            <SallieSectionHeader title="Personality Compass" accent={VIOLET} icon={<Compass className="w-4 h-4" />} />
            <Compass className="w-6 h-6 mx-auto mb-2 opacity-40" style={{ color: VIOLET }} />
            <p className="text-sm font-black text-white/70 text-center mb-1">I need your answers first</p>
            <p className="text-xs text-white/30 text-center">Complete the Convergence and I&apos;ll map your Gemini duality, INFJ-A strengths.</p>
            <p className="text-[10px] mt-3 font-black uppercase tracking-[0.15em] text-center" style={{ color: VIOLET }}>Your unique wiring, visualized</p>
          </SalliePanel>

          <SalliePanel accent={AMBER}>
            <SallieSectionHeader title="Vision Board" accent={AMBER} icon={<Eye className="w-4 h-4" />} />
            <Eye className="w-6 h-6 mx-auto mb-2 opacity-40" style={{ color: AMBER }} />
            <p className="text-sm font-black text-white/70 text-center mb-1">Where&apos;s the vision board?</p>
            <p className="text-xs text-white/30 text-center">Drop your dreams here. I remind you why you started when the world tries to make you forget.</p>
          </SalliePanel>

          <SalliePanel accent={VIOLET} glow="subtle">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4" style={{ color: GOLD }} />
              <span className="text-[11px] font-medium text-white/50">Today&apos;s Prompt</span>
            </div>
            <p className="text-sm text-white/40 italic">&quot;My brain works differently, not less. What did my unique wiring help me see today that others missed?&quot;</p>
            <SallieButton accent={VIOLET} variant="ghost" size="sm" className="mt-3" icon={<BookOpen className="w-3.5 h-3.5" />} onClick={() => onNavigate('thought-journal')}>
              Open Journal
            </SallieButton>
          </SalliePanel>

          <div className="flex flex-wrap gap-2">
            <SallieButton accent="#10b981" variant="ghost" size="sm" icon={<Anchor className="w-3.5 h-3.5" />}>Ground Me</SallieButton>
            <SallieButton accent={VIOLET} variant="ghost" size="sm" icon={<BookOpen className="w-3.5 h-3.5" />}>Journal</SallieButton>
            <SallieButton accent={GOLD} variant="ghost" size="sm" icon={<Zap className="w-3.5 h-3.5" />}>Energy Check</SallieButton>
            <SallieButton accent={AMBER} variant="ghost" size="sm" icon={<Brain className="w-3.5 h-3.5" />}>Pattern Log</SallieButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

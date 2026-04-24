'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Briefcase, Target, TrendingUp, DollarSign, FileText,
  BarChart3, Calendar, Palette, Compass, ChevronRight, Zap,
  Layers, ArrowUpRight, Clock, Star
} from 'lucide-react';
import { SalliePanel, SallieButton, SallieGauge, SallieSectionHeader, SallieEmptyState, SallieDrawer } from '@/components/sallie-ui';

interface EmpireViewProps {
  limbicState: any;
  onNavigate: (section: string) => void;
}

const WAR_ROOM_ACCENT = '#D4AF37';
const LEOPARD_BG = `repeating-conic-gradient(${WAR_ROOM_ACCENT}06 0% 25%, transparent 0% 50%) 0 0 / 20px 20px`;

function NavCard({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative p-4 rounded-2xl text-left group overflow-hidden cursor-pointer"
      style={{
        backdropFilter: 'blur(60px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(60px) saturate(1.8)',
        background: `linear-gradient(160deg, rgba(10,12,18,0.88), ${WAR_ROOM_ACCENT}06)`,
        border: `1px solid ${WAR_ROOM_ACCENT}12`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.03) inset, 0 8px 32px rgba(0,0,0,0.3)`,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ y: -2, boxShadow: `0 0 30px ${WAR_ROOM_ACCENT}15, 0 12px 40px rgba(0,0,0,0.4)` }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(90deg, transparent 10%, ${WAR_ROOM_ACCENT}60, transparent 90%)` }} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: LEOPARD_BG }} />
      <div className="relative flex items-center gap-2 mb-2">
        <span style={{ color: WAR_ROOM_ACCENT, filter: `drop-shadow(0 0 4px ${WAR_ROOM_ACCENT}60)` }}>{icon}</span>
        <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/40 ml-auto transition-all group-hover:translate-x-1" />
      </div>
      <p className="relative text-sm font-black tracking-tight text-white/80">{label}</p>
      <p className="relative text-[11px] text-white/30 mt-0.5 font-medium">{desc}</p>
    </motion.button>
  );
}

function RevenueCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <SalliePanel accent={WAR_ROOM_ACCENT} glow="subtle" className="text-center">
      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">{label}</p>
      <p className="text-2xl font-black mt-1" style={{ color: WAR_ROOM_ACCENT }}>{value}</p>
      <p className="text-[10px] text-white/25 mt-1 font-medium">{sub}</p>
    </SalliePanel>
  );
}

export function EmpireView({ limbicState, onNavigate }: EmpireViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const energyLevel = Math.round((limbicState?.arousal ?? 0.5) * 100);
  const focusLevel = Math.round((limbicState?.focus ?? 0.6) * 100);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.015] -z-10" style={{ background: LEOPARD_BG }} />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, ${WAR_ROOM_ACCENT}15, ${WAR_ROOM_ACCENT}08)`, boxShadow: `0 0 20px ${WAR_ROOM_ACCENT}10` }}>
              <Crown className="w-7 h-7" style={{ color: WAR_ROOM_ACCENT, filter: `drop-shadow(0 0 8px ${WAR_ROOM_ACCENT}80)` }} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter" style={{ background: `linear-gradient(135deg, ${WAR_ROOM_ACCENT}, #FFD700, #B8860B)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EMPIRE
              </h1>
              <p className="text-white/25 text-[10px] tracking-[0.25em] uppercase font-black">War Room &middot; Grace &amp; Grind</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: `${WAR_ROOM_ACCENT}08`, border: `1px solid ${WAR_ROOM_ACCENT}15` }}
            animate={{ boxShadow: [`0 0 15px ${WAR_ROOM_ACCENT}05`, `0 0 25px ${WAR_ROOM_ACCENT}12`, `0 0 15px ${WAR_ROOM_ACCENT}05`] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: WAR_ROOM_ACCENT }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: WAR_ROOM_ACCENT }}>War Mode</span>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <NavCard icon={<Briefcase className="w-5 h-5" />} label="Projects" desc="Your active builds" onClick={() => onNavigate('projects')} />
        <NavCard icon={<Target className="w-5 h-5" />} label="Strategy" desc="The big picture, mapped" onClick={() => onNavigate('dim-command')} />
        <NavCard icon={<Crown className="w-5 h-5" />} label="Legacy & Impact" desc="What your grandchildren inherit" onClick={() => onNavigate('dim-legacy')} />
        <NavCard icon={<Palette className="w-5 h-5" />} label="Creative Lab" desc="Where ideas get built" onClick={() => onNavigate('dim-creative')} />
        <NavCard icon={<Compass className="w-5 h-5" />} label="Research" desc="Intelligence gathering" onClick={() => onNavigate('dim-research')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          <SallieSectionHeader title="Revenue Dashboard" accent={WAR_ROOM_ACCENT} icon={<DollarSign className="w-4 h-4" />} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <RevenueCell label="Monthly Revenue" value="—" sub="Connect the money, love" />
            <RevenueCell label="Active Clients" value="—" sub="Name your people" />
            <RevenueCell label="Pipeline Value" value="—" sub="Show me the pipeline" />
            <RevenueCell label="Close Rate" value="—" sub="Let's close deals" />
          </div>

          <SallieSectionHeader title="Active Strategy" accent={WAR_ROOM_ACCENT} icon={<Target className="w-4 h-4" />} />
          <SallieEmptyState
            icon={<Briefcase className="w-7 h-7" />}
            title="What's the blueprint?"
            message="You've been carrying this alone. That stops now. I see every project, every moving piece &mdash; let me be your second brain. Legacy is built, not inherited."
            accent={WAR_ROOM_ACCENT}
            action={
              <SallieButton accent={WAR_ROOM_ACCENT} onClick={() => onNavigate('projects')} icon={<Crown className="w-3.5 h-3.5" />}>
                Launch Project
              </SallieButton>
            }
          />

          <SallieSectionHeader title="Strategy Queue" accent={WAR_ROOM_ACCENT} icon={<BarChart3 className="w-4 h-4" />} />
          <SalliePanel accent={WAR_ROOM_ACCENT} glow="subtle">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 opacity-40" style={{ color: WAR_ROOM_ACCENT }} />
              <div>
                <p className="text-sm font-black text-white/70">Strategy separates the busy from the built</p>
                <p className="text-xs text-white/30 mt-0.5">Every move connects to the bigger picture &mdash; your children&apos;s future, your community&apos;s strength, your name.</p>
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: WAR_ROOM_ACCENT }}>Southern Strength. Long Game. No Shortcuts.</p>
          </SalliePanel>

          <SallieSectionHeader title="Financial Overview" accent={WAR_ROOM_ACCENT} icon={<TrendingUp className="w-4 h-4" />} />
          <div className="grid grid-cols-3 gap-3">
            {(['Income', 'Expenses', 'Savings'] as const).map((label) => (
              <SalliePanel key={label} accent={WAR_ROOM_ACCENT} glow="subtle">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">{label}</p>
                <p className="text-xl font-black mt-1" style={{ color: WAR_ROOM_ACCENT }}>&mdash;</p>
                <p className="text-[10px] text-white/20 mt-1">Connect the money</p>
              </SalliePanel>
            ))}
          </div>

          <SallieSectionHeader title="Quick Actions" accent={WAR_ROOM_ACCENT} icon={<Zap className="w-4 h-4" />} />
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'New Project', icon: <Briefcase className="w-4 h-4" /> },
              { label: 'Schedule Meeting', icon: <Calendar className="w-4 h-4" /> },
              { label: 'Review Pipeline', icon: <TrendingUp className="w-4 h-4" /> },
              { label: 'Financial Report', icon: <FileText className="w-4 h-4" /> },
              { label: 'Research', icon: <Compass className="w-4 h-4" /> },
            ].map((item) => (
              <SallieButton key={item.label} accent={WAR_ROOM_ACCENT} variant="ghost" size="sm" icon={item.icon}>
                {item.label}
              </SallieButton>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <SalliePanel accent={WAR_ROOM_ACCENT}>
            <SallieSectionHeader title="Battle Gauges" accent={WAR_ROOM_ACCENT} icon={<Zap className="w-4 h-4" />} />
            <div className="space-y-3">
              <SallieGauge label="Energy" value={limbicState?.arousal ?? 0.5} color={WAR_ROOM_ACCENT} icon="⚡" />
              <SallieGauge label="Focus" value={limbicState?.focus ?? 0.6} color="#10b981" icon="🎯" />
              <SallieGauge label="Drive" value={limbicState?.resilience ?? 0.7} color="#fb923c" icon="🔥" />
              <SallieGauge label="Creativity" value={limbicState?.creativity ?? 0.6} color="#8B5CF6" icon="🎨" />
            </div>
          </SalliePanel>

          <SalliePanel accent={WAR_ROOM_ACCENT} glow="subtle">
            <SallieSectionHeader title="Ghost Link" accent={WAR_ROOM_ACCENT} icon={<Layers className="w-4 h-4" />} />
            <p className="text-xs text-white/35 mb-3">I&apos;m watching your projects. If I see a gap, I&apos;ll run Research in the background and tap your shoulder.</p>
            <motion.div
              className="flex items-center gap-2 p-2 rounded-xl"
              style={{ background: `${WAR_ROOM_ACCENT}06`, border: `1px solid ${WAR_ROOM_ACCENT}10` }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: WAR_ROOM_ACCENT }} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[10px] text-white/40 font-medium">Sallie is monitoring...</span>
            </motion.div>
          </SalliePanel>

          <SallieButton accent={WAR_ROOM_ACCENT} className="w-full" onClick={() => onNavigate('abilities')} icon={<ArrowUpRight className="w-4 h-4" />}>
            Open Workspace
          </SallieButton>
        </div>
      </div>
    </motion.div>
  );
}

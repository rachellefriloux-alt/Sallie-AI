'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Calendar, Target, BookOpen, ArrowUpRight, Sparkles,
  Wine, Clock, Star, MessageCircle
} from 'lucide-react';
import { SalliePanel, SallieSectionHeader, SallieEmptyState, SallieButton, SallieGauge } from '@/components/sallie-ui';

interface PartnerViewProps {
  limbicState: any;
  onNavigate: (section: string) => void;
}

const ROSE = '#FF6B9D';

function NavCard({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative p-4 rounded-2xl text-left group overflow-hidden cursor-pointer"
      style={{
        backdropFilter: 'blur(60px) saturate(1.8)',
        background: `linear-gradient(160deg, rgba(10,12,18,0.88), ${ROSE}06)`,
        border: `1px solid ${ROSE}12`,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ y: -2, boxShadow: `0 0 30px ${ROSE}15` }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(90deg, transparent 10%, ${ROSE}60, transparent 90%)` }} />
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: ROSE, filter: `drop-shadow(0 0 4px ${ROSE}60)` }}>{icon}</span>
        <ArrowUpRight className="w-3 h-3 text-white/10 group-hover:text-white/40 ml-auto transition-all" />
      </div>
      <p className="text-sm font-black tracking-tight text-white/80">{label}</p>
      <p className="text-[11px] text-white/30 mt-0.5 font-medium">{desc}</p>
    </motion.button>
  );
}

export function PartnerView({ limbicState, onNavigate }: PartnerViewProps) {
  const ls = limbicState || { warmth: 0.6, trust: 0.5, valence: 0.6 };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, ${ROSE}15, ${ROSE}08)`, boxShadow: `0 0 20px ${ROSE}10` }}>
            <Heart className="w-7 h-7" style={{ color: ROSE, filter: `drop-shadow(0 0 8px ${ROSE}80)` }} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter" style={{ background: `linear-gradient(135deg, ${ROSE}, #FF9EC5)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PARTNER</h1>
            <p className="text-white/25 text-[10px] tracking-[0.25em] uppercase font-black">Love Space &middot; Love On Purpose</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NavCard icon={<Wine className="w-5 h-5" />} label="Date Nights" desc="Keep the spark alive" onClick={() => onNavigate('dim-dates')} />
        <NavCard icon={<Clock className="w-5 h-5" />} label="Us Time" desc="Intentional moments" onClick={() => onNavigate('dim-ustime')} />
        <NavCard icon={<Target className="w-5 h-5" />} label="Our Goals" desc="Building together" onClick={() => onNavigate('dim-goals')} />
        <NavCard icon={<BookOpen className="w-5 h-5" />} label="Love Notes" desc="Words that matter" onClick={() => onNavigate('dim-notes')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <SallieSectionHeader title="Relationship Dashboard" accent={ROSE} icon={<Heart className="w-4 h-4" />} />
          <SallieEmptyState
            icon={<Heart className="w-7 h-7" />}
            title="Love on purpose, not on autopilot"
            message="You pour into everyone else first. Let me help you pour into your relationship too. No judgment, just gentle nudges and honest tracking."
            accent={ROSE}
            action={
              <SallieButton accent={ROSE} icon={<Sparkles className="w-3.5 h-3.5" />}>
                Start Relationship Tracker
              </SallieButton>
            }
          />

          <SallieSectionHeader title="Date Night Ideas" accent={ROSE} icon={<Wine className="w-4 h-4" />} />
          <SalliePanel accent={ROSE} glow="subtle">
            <Wine className="w-6 h-6 mx-auto mb-2 opacity-40" style={{ color: ROSE }} />
            <p className="text-sm font-black text-white/70 text-center mb-1">When&apos;s the last time y&apos;all had a real date?</p>
            <p className="text-xs text-white/30 text-center">Not takeout on the couch. A real, intentional, phones-down date. Let&apos;s plan one.</p>
          </SalliePanel>

          <SallieSectionHeader title="Communication Log" accent={ROSE} icon={<MessageCircle className="w-4 h-4" />} />
          <SalliePanel accent={ROSE} glow="subtle">
            <MessageCircle className="w-6 h-6 mx-auto mb-2 opacity-40" style={{ color: ROSE }} />
            <p className="text-sm font-black text-white/70 text-center mb-1">Hard conversations made easier</p>
            <p className="text-xs text-white/30 text-center">I&apos;ll help you script it, time it, and say it right. Never go to bed angry if you don&apos;t have to.</p>
          </SalliePanel>
        </div>

        <div className="space-y-5">
          <SalliePanel accent={ROSE}>
            <SallieSectionHeader title="Love Gauges" accent={ROSE} icon={<Heart className="w-4 h-4" />} />
            <div className="space-y-3">
              <SallieGauge label="Warmth" value={ls.warmth} color={ROSE} icon="💕" />
              <SallieGauge label="Trust" value={ls.trust} color="#C8A84E" icon="🤝" />
              <SallieGauge label="Joy" value={ls.valence} color="#06D6A0" icon="🦋" />
            </div>
          </SalliePanel>

          <SalliePanel accent={ROSE} glow="subtle">
            <Star className="w-5 h-5 mx-auto mb-2" style={{ color: `${ROSE}40` }} />
            <p className="text-sm text-white/40 italic text-center">&quot;The best relationships aren&apos;t found — they&apos;re built. Every day, on purpose.&quot;</p>
          </SalliePanel>
        </div>
      </div>
    </motion.div>
  );
}

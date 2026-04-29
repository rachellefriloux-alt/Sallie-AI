'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Calendar, Award, ArrowUpRight, Sparkles,
  Heart, MessageCircle, Star, Shield
} from 'lucide-react';
import { SalliePanel, SallieSectionHeader, SallieEmptyState, SallieButton, SallieGauge } from '@/components/sallie-ui';

interface ConfidanteViewProps {
  limbicState: any;
  onNavigate: (section: string) => void;
}

const CYAN = '#06B6D4';

function NavCard({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative p-4 rounded-2xl text-left group overflow-hidden cursor-pointer"
      style={{
        backdropFilter: 'blur(60px) saturate(1.8)',
        background: `linear-gradient(160deg, rgba(10,12,18,0.88), ${CYAN}06)`,
        border: `1px solid ${CYAN}12`,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ y: -2, boxShadow: `0 0 30px ${CYAN}15` }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(90deg, transparent 10%, ${CYAN}60, transparent 90%)` }} />
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: CYAN, filter: `drop-shadow(0 0 4px ${CYAN}60)` }}>{icon}</span>
        <ArrowUpRight className="w-3 h-3 text-white/10 group-hover:text-white/40 ml-auto transition-all" />
      </div>
      <p className="text-sm font-black tracking-tight text-white/80">{label}</p>
      <p className="text-[11px] text-white/30 mt-0.5 font-medium">{desc}</p>
    </motion.button>
  );
}

export function ConfidanteView({ limbicState, onNavigate }: ConfidanteViewProps) {
  const ls = limbicState || { trust: 0.5, warmth: 0.6, empathy: 0.5 };

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
          <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, ${CYAN}15, ${CYAN}08)`, boxShadow: `0 0 20px ${CYAN}10` }}>
            <Users className="w-7 h-7" style={{ color: CYAN, filter: `drop-shadow(0 0 8px ${CYAN}80)` }} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter" style={{ background: `linear-gradient(135deg, ${CYAN}, #67E8F9)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CONFIDANTE</h1>
            <p className="text-white/25 text-[10px] tracking-[0.25em] uppercase font-black">Inner Circle &middot; Who&apos;s Really Riding For You?</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NavCard icon={<Users className="w-5 h-5" />} label="My People" desc="Your ride-or-dies" onClick={() => onNavigate('dim-people')} />
        <NavCard icon={<UserPlus className="w-5 h-5" />} label="Extended Family" desc="The wider village" onClick={() => onNavigate('dim-family')} />
        <NavCard icon={<Calendar className="w-5 h-5" />} label="Plans & Events" desc="Show up when it matters" onClick={() => onNavigate('dim-events')} />
        <NavCard icon={<Award className="w-5 h-5" />} label="Social Mastery" desc="Navigate any room" onClick={() => onNavigate('dim-social')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <SallieSectionHeader title="Your Circle" accent={CYAN} icon={<Users className="w-4 h-4" />} />
          <SallieEmptyState
            icon={<Users className="w-7 h-7" />}
            title="Who's really riding for you?"
            message="You give your energy to a lot of people. Let me help you see who gives it back. No shade — just clarity on where your love goes and who returns it."
            accent={CYAN}
            action={
              <SallieButton accent={CYAN} icon={<UserPlus className="w-3.5 h-3.5" />}>
                Map Your Circle
              </SallieButton>
            }
          />

          <SallieSectionHeader title="Relationship Health" accent={CYAN} icon={<Heart className="w-4 h-4" />} />
          <SalliePanel accent={CYAN} glow="subtle">
            <Heart className="w-6 h-6 mx-auto mb-2 opacity-40" style={{ color: CYAN }} />
            <p className="text-sm font-black text-white/70 text-center mb-1">Every relationship has a season</p>
            <p className="text-xs text-white/30 text-center">I&apos;ll track who you invest in and gently remind you when someone needs a check-in &mdash; or when you need to let go.</p>
          </SalliePanel>

          <SallieSectionHeader title="Social Calendar" accent={CYAN} icon={<Calendar className="w-4 h-4" />} />
          <SalliePanel accent={CYAN} glow="subtle">
            <Calendar className="w-6 h-6 mx-auto mb-2 opacity-40" style={{ color: CYAN }} />
            <p className="text-sm font-black text-white/70 text-center mb-1">When&apos;s the last time you showed up?</p>
            <p className="text-xs text-white/30 text-center">Birthdays, check-ins, friend dates. I remember so you don&apos;t have to carry that load alone.</p>
          </SalliePanel>
        </div>

        <div className="space-y-5">
          <SalliePanel accent={CYAN}>
            <SallieSectionHeader title="Social Energy" accent={CYAN} icon={<Shield className="w-4 h-4" />} />
            <div className="space-y-3">
              <SallieGauge label="Trust Level" value={ls.trust} color={CYAN} icon="🤝" />
              <SallieGauge label="Warmth" value={ls.warmth} color="#FF8C42" icon="💛" />
              <SallieGauge label="Empathy" value={ls.empathy} color="#FF6B9D" icon="💕" />
            </div>
          </SalliePanel>

          <SalliePanel accent={CYAN} glow="subtle">
            <Star className="w-5 h-5 mx-auto mb-2" style={{ color: `${CYAN}40` }} />
            <p className="text-sm text-white/40 italic text-center">&quot;Not everyone deserves your energy. Protect it like the treasure it is.&quot;</p>
          </SalliePanel>

          <SalliePanel accent={CYAN} glow="subtle">
            <MessageCircle className="w-4 h-4 mb-2" style={{ color: CYAN }} />
            <p className="text-[11px] font-black text-white/40 uppercase tracking-wider mb-2">Quick Actions</p>
            <div className="space-y-2">
              {['Check In On Someone', 'Plan a Hangout', 'Birthday Reminder', 'Set Boundaries'].map((item) => (
                <SallieButton key={item} accent={CYAN} variant="ghost" size="sm" className="w-full !text-left !justify-start">
                  {item}
                </SallieButton>
              ))}
            </div>
          </SalliePanel>
        </div>
      </div>
    </motion.div>
  );
}

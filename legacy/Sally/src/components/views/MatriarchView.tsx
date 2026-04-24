'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Home, Baby, ChefHat, Wrench, GraduationCap, Heart,
  Calendar, ShoppingCart, ArrowUpRight, Sparkles
} from 'lucide-react';
import { SalliePanel, SallieSectionHeader, SallieEmptyState, SallieButton, SallieGauge } from '@/components/sallie-ui';

interface MatriarchViewProps {
  limbicState: any;
  onNavigate: (section: string) => void;
}

const AMBER = '#FF8C42';

function NavCard({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative p-4 rounded-2xl text-left group overflow-hidden cursor-pointer"
      style={{
        backdropFilter: 'blur(60px) saturate(1.8)',
        background: `linear-gradient(160deg, rgba(10,12,18,0.88), ${AMBER}06)`,
        border: `1px solid ${AMBER}12`,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ y: -2, boxShadow: `0 0 30px ${AMBER}15` }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(90deg, transparent 10%, ${AMBER}60, transparent 90%)` }} />
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: AMBER, filter: `drop-shadow(0 0 4px ${AMBER}60)` }}>{icon}</span>
        <ArrowUpRight className="w-3 h-3 text-white/10 group-hover:text-white/40 ml-auto transition-all" />
      </div>
      <p className="text-sm font-black tracking-tight text-white/80">{label}</p>
      <p className="text-[11px] text-white/30 mt-0.5 font-medium">{desc}</p>
    </motion.button>
  );
}

export function MatriarchView({ limbicState, onNavigate }: MatriarchViewProps) {
  const ls = limbicState || { warmth: 0.6, empathy: 0.5, energy: 0.8 };

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
          <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, ${AMBER}15, ${AMBER}08)`, boxShadow: `0 0 20px ${AMBER}10` }}>
            <Home className="w-7 h-7" style={{ color: AMBER, filter: `drop-shadow(0 0 8px ${AMBER}80)` }} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter" style={{ background: `linear-gradient(135deg, ${AMBER}, #FFB366)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MATRIARCH</h1>
            <p className="text-white/25 text-[10px] tracking-[0.25em] uppercase font-black">Family Ops &middot; Your Household, Your Kingdom</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NavCard icon={<Baby className="w-5 h-5" />} label="Kids" desc="Your greatest legacy" onClick={() => onNavigate('dim-kids')} />
        <NavCard icon={<ChefHat className="w-5 h-5" />} label="Kitchen & Meals" desc="Feed them right" onClick={() => onNavigate('dim-kitchen')} />
        <NavCard icon={<Wrench className="w-5 h-5" />} label="Home Care" desc="Keep the castle tight" onClick={() => onNavigate('dim-home')} />
        <NavCard icon={<GraduationCap className="w-5 h-5" />} label="School & Activities" desc="Their future, your investment" onClick={() => onNavigate('dim-school')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <SallieSectionHeader title="Family Dashboard" accent={AMBER} icon={<Heart className="w-4 h-4" />} />
          <SallieEmptyState
            icon={<Home className="w-7 h-7" />}
            title="Your household runs on love — but love needs a system"
            message="You manage everything and everyone. Let me hold the mental load so you can actually be present with the people you love."
            accent={AMBER}
            action={
              <SallieButton accent={AMBER} icon={<Sparkles className="w-3.5 h-3.5" />}>
                Set Up Family Hub
              </SallieButton>
            }
          />

          <SallieSectionHeader title="Weekly Overview" accent={AMBER} icon={<Calendar className="w-4 h-4" />} />
          <SalliePanel accent={AMBER} glow="subtle">
            <div className="grid grid-cols-7 gap-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-center p-2 rounded-lg" style={{ background: i === new Date().getDay() - 1 ? `${AMBER}12` : 'rgba(255,255,255,0.02)', border: i === new Date().getDay() - 1 ? `1px solid ${AMBER}30` : '1px solid transparent' }}>
                  <p className="text-[10px] font-black text-white/30">{day}</p>
                  <p className="text-xs text-white/20 mt-1">&mdash;</p>
                </div>
              ))}
            </div>
          </SalliePanel>

          <SallieSectionHeader title="Meal Planning" accent={AMBER} icon={<ChefHat className="w-4 h-4" />} />
          <SalliePanel accent={AMBER} glow="subtle">
            <ChefHat className="w-6 h-6 mx-auto mb-2 opacity-40" style={{ color: AMBER }} />
            <p className="text-sm font-black text-white/70 text-center mb-1">What&apos;s for dinner?</p>
            <p className="text-xs text-white/30 text-center">You shouldn&apos;t have to answer that every single day. Tell me preferences and I&apos;ll plan the week.</p>
          </SalliePanel>
        </div>

        <div className="space-y-5">
          <SalliePanel accent={AMBER}>
            <SallieSectionHeader title="Mom Energy" accent={AMBER} icon={<Heart className="w-4 h-4" />} />
            <div className="space-y-3">
              <SallieGauge label="Warmth" value={ls.warmth} color={AMBER} icon="💛" />
              <SallieGauge label="Empathy" value={ls.empathy} color="#FF6B9D" icon="💕" />
              <SallieGauge label="Energy" value={ls.energy ?? ls.arousal ?? 0.5} color="#10b981" icon="⚡" />
            </div>
          </SalliePanel>

          <SalliePanel accent={AMBER} glow="subtle">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4" style={{ color: AMBER }} />
              <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: AMBER }}>Quick Add</span>
            </div>
            <div className="space-y-2">
              {['Grocery Run', 'Doctor Appt', 'School Event', 'Activity Signup'].map((item) => (
                <SallieButton key={item} accent={AMBER} variant="ghost" size="sm" className="w-full !text-left !justify-start">
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

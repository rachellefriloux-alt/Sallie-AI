'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, Code, FileText, Brain, Lightbulb, BarChart3, Search,
  Target, GraduationCap, DollarSign, Globe, BookOpen, Palette,
  Compass, ArrowUpRight, Zap, Layers, Settings, Star,
  PenTool, Beaker
} from 'lucide-react';
import { SalliePanel, SallieSectionHeader, SallieButton, SallieEmptyState } from '@/components/sallie-ui';

interface WorkspaceViewProps {
  limbicState: any;
  onNavigate: (section: string) => void;
}

const TEAL = '#14B8A6';

const ABILITIES = [
  { id: 'code', label: 'Code', icon: Code, desc: 'Write, debug, review code', color: '#10b981' },
  { id: 'write', label: 'Write', icon: PenTool, desc: 'Content, copy, scripts', color: '#8B5CF6' },
  { id: 'brainstorm', label: 'Brainstorm', icon: Lightbulb, desc: 'Ideas, concepts, solutions', color: '#F59E0B' },
  { id: 'analyze', label: 'Analyze', icon: BarChart3, desc: 'Data, trends, patterns', color: '#06B6D4' },
  { id: 'summarize', label: 'Summarize', icon: FileText, desc: 'Distill the essence', color: '#EC4899' },
  { id: 'research', label: 'Research', icon: Search, desc: 'Deep dive anything', color: '#14B8A6' },
  { id: 'plan', label: 'Plan', icon: Target, desc: 'Strategy & roadmaps', color: '#D4AF37' },
  { id: 'tutor', label: 'Tutor', icon: GraduationCap, desc: 'Teach me anything', color: '#FF8C42' },
  { id: 'finance', label: 'Finance', icon: DollarSign, desc: 'Budget, forecast, analyze', color: '#10b981' },
  { id: 'decide', label: 'Decide', icon: Brain, desc: 'Decision frameworks', color: '#9D8DF1' },
  { id: 'translate', label: 'Translate', icon: Globe, desc: 'Any language, any context', color: '#06B6D4' },
  { id: 'explain', label: 'Explain', icon: BookOpen, desc: 'Break it down simple', color: '#FF6B9D' },
];

function NavCard({ icon, label, desc, color, onClick }: { icon: React.ReactNode; label: string; desc: string; color: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative p-4 rounded-2xl text-left group overflow-hidden cursor-pointer"
      style={{
        backdropFilter: 'blur(60px) saturate(1.8)',
        background: `linear-gradient(160deg, rgba(10,12,18,0.88), ${color}06)`,
        border: `1px solid ${color}12`,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      whileHover={{ y: -2, boxShadow: `0 0 30px ${color}15` }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: `linear-gradient(90deg, transparent 10%, ${color}60, transparent 90%)` }} />
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color, filter: `drop-shadow(0 0 4px ${color}60)` }}>{icon}</span>
        <ArrowUpRight className="w-3 h-3 text-white/10 group-hover:text-white/40 ml-auto transition-all" />
      </div>
      <p className="text-sm font-black tracking-tight text-white/80">{label}</p>
      <p className="text-[11px] text-white/30 mt-0.5 font-medium">{desc}</p>
    </motion.button>
  );
}

export function WorkspaceView({ limbicState, onNavigate }: WorkspaceViewProps) {
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

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
          <div className="p-2.5 rounded-xl" style={{ background: `linear-gradient(135deg, ${TEAL}15, ${TEAL}08)`, boxShadow: `0 0 20px ${TEAL}10` }}>
            <Cpu className="w-7 h-7" style={{ color: TEAL, filter: `drop-shadow(0 0 8px ${TEAL}80)` }} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter" style={{ background: `linear-gradient(135deg, ${TEAL}, #5EEAD4)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WORKSPACE</h1>
            <p className="text-white/25 text-[10px] tracking-[0.25em] uppercase font-black">Creation Hub &middot; You Don&apos;t Just Dream It &mdash; You Build It</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NavCard icon={<Palette className="w-5 h-5" />} label="Creative Lab" desc="Where ideas get built" color={TEAL} onClick={() => onNavigate('dim-creative')} />
        <NavCard icon={<Compass className="w-5 h-5" />} label="Research" desc="Intelligence gathering" color={TEAL} onClick={() => onNavigate('dim-research')} />
        <NavCard icon={<Settings className="w-5 h-5" />} label="Systems" desc="Under the hood" color="#6B7280" onClick={() => onNavigate('settings')} />
        <NavCard icon={<Star className="w-5 h-5" />} label="Features" desc="Everything Sallie can do" color="#D4AF37" onClick={() => onNavigate('features')} />
      </div>

      <SallieSectionHeader title="12 Abilities" accent={TEAL} icon={<Zap className="w-4 h-4" />} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ABILITIES.map((ability) => {
          const Icon = ability.icon;
          return (
            <motion.button
              key={ability.id}
              className="relative p-3 rounded-xl text-left group overflow-hidden cursor-pointer"
              style={{
                backdropFilter: 'blur(60px) saturate(1.8)',
                background: selectedAbility === ability.id ? `linear-gradient(135deg, ${ability.color}12, ${ability.color}06)` : `linear-gradient(160deg, rgba(10,12,18,0.85), ${ability.color}04)`,
                border: selectedAbility === ability.id ? `1px solid ${ability.color}40` : `1px solid ${ability.color}10`,
                transition: 'all 0.4s',
              }}
              whileHover={{ y: -2, boxShadow: `0 0 20px ${ability.color}12` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedAbility(ability.id === selectedAbility ? null : ability.id)}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-4 h-4" style={{ color: ability.color, filter: `drop-shadow(0 0 4px ${ability.color}50)` }} />
                <span className="text-xs font-black text-white/75">{ability.label}</span>
              </div>
              <p className="text-[10px] text-white/25">{ability.desc}</p>
            </motion.button>
          );
        })}
      </div>

      {selectedAbility && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <SalliePanel accent={ABILITIES.find(a => a.id === selectedAbility)?.color || TEAL}>
            <div className="flex items-center gap-3 mb-3">
              {(() => { const A = ABILITIES.find(a => a.id === selectedAbility); if (!A) return null; const Icon = A.icon; return <Icon className="w-5 h-5" style={{ color: A.color }} />; })()}
              <div>
                <p className="text-sm font-black text-white/80">{ABILITIES.find(a => a.id === selectedAbility)?.label} Mode</p>
                <p className="text-[10px] text-white/30">Ready when you are, love</p>
              </div>
            </div>
            <SallieButton accent={ABILITIES.find(a => a.id === selectedAbility)?.color || TEAL} icon={<Zap className="w-3.5 h-3.5" />} onClick={() => onNavigate('dim-messenger')}>
              Start {ABILITIES.find(a => a.id === selectedAbility)?.label} Session
            </SallieButton>
          </SalliePanel>
        </motion.div>
      )}

      <SalliePanel accent={TEAL} glow="subtle">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 opacity-40" style={{ color: TEAL }} />
          <div>
            <p className="text-sm font-black text-white/70">Ghost Integration Active</p>
            <p className="text-xs text-white/30 mt-0.5">Every ability connects to every tab. Code in Empire, Write in Partner, Research everywhere. Sallie follows you across modes.</p>
          </div>
        </div>
      </SalliePanel>
    </motion.div>
  );
}

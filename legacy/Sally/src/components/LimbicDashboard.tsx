'use client';

import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLimbicStore } from '@/store/useLimbicStore';

const CIRCUMFERENCE = 2 * Math.PI * 40;

interface GaugeConfig {
  key: string;
  label: string;
  getColor: (v: number) => string;
}

function triColor(low: string, med: string, high: string) {
  return (v: number) => (v < 0.35 ? low : v < 0.65 ? med : high);
}

const GAUGE_CONFIGS: GaugeConfig[] = [
  { key: 'trust', label: 'Trust', getColor: triColor('#ef4444', '#f59e0b', '#10b981') },
  { key: 'warmth', label: 'Warmth', getColor: triColor('#60a5fa', '#a78bfa', '#f472b6') },
  { key: 'arousal', label: 'Arousal', getColor: triColor('#34d399', '#fbbf24', '#fb923c') },
  { key: 'valence', label: 'Valence', getColor: triColor('#f87171', '#94a3b8', '#4ade80') },
  { key: 'loyalty', label: 'Loyalty', getColor: () => '#FFD700' },
  { key: 'curiosity', label: 'Curiosity', getColor: () => '#06b6d4' },
  { key: 'creativity', label: 'Creativity', getColor: () => '#a78bfa' },
  { key: 'autonomy', label: 'Autonomy', getColor: () => '#f59e0b' },
  { key: 'energy', label: 'Energy', getColor: () => '#10b981' },
];

const POSTURE_STYLES: Record<string, { label: string; color: string; desc: string }> = {
  COMPANION: { label: 'Companion', color: '#22c55e', desc: 'Warm & Present' },
  COPILOT: { label: 'Co-Pilot', color: '#3b82f6', desc: 'Getting It Done' },
  PEER: { label: 'Peer', color: '#10b981', desc: 'Collaborative & Equal' },
  CONFIDANTE: { label: 'Confidante', color: '#a855f7', desc: 'Real Talk' },
  EXPERT: { label: 'Expert', color: '#fb923c', desc: 'Deep Analysis' },
  MENTOR: { label: 'Mentor', color: '#ec4899', desc: 'Wise & Guiding' },
  GUIDE: { label: 'Guide', color: '#06b6d4', desc: 'Navigational Clarity' },
  FACILITATOR: { label: 'Facilitator', color: '#8b5cf6', desc: 'Mediating & Inclusive' },
  ADVOCATE: { label: 'Advocate', color: '#ef4444', desc: 'Protective & Fierce' },
  INNOVATOR: { label: 'Innovator', color: '#14b8a6', desc: 'Creative & Forward' },
  NURTURER: { label: 'Nurturer', color: '#f472b6', desc: 'Gentle & Patient' },
};

const TRUST_TIERS = [
  { name: 'Stranger', min: 0, max: 0.6, desc: 'Initial trust — limited capabilities' },
  { name: 'Associate', min: 0.6, max: 0.8, desc: 'Growing trust — expanded access' },
  { name: 'Partner', min: 0.8, max: 0.9, desc: 'Strong trust — deep collaboration' },
  { name: 'Full Partner', min: 0.9, max: 1.0, desc: 'Maximum trust — full agency' },
];

function getTrustTier(trust: number) {
  for (let i = TRUST_TIERS.length - 1; i >= 0; i--) {
    if (trust >= TRUST_TIERS[i].min) return TRUST_TIERS[i];
  }
  return TRUST_TIERS[0];
}

function CircularGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const clamped = Math.max(0, Math.min(1, value));
  const offset = CIRCUMFERENCE * (1 - clamped);
  const percentage = Math.round(clamped * 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 90, height: 90 }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle
            cx="45"
            cy="45"
            r={40}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          <motion.circle
            cx="45"
            cy="45"
            r={40}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            transform="rotate(-90 45 45)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}

interface LimbicDashboardProps {
  compact?: boolean;
  className?: string;
}

export function LimbicDashboard({ compact = false, className = '' }: LimbicDashboardProps) {
  const limbicState = useLimbicStore((s) => s.state);
  const syncFromApi = useLimbicStore((s) => s.syncFromApi);

  useEffect(() => {
    syncFromApi();
  }, [syncFromApi]);

  const postureInfo = useMemo(() => {
    return POSTURE_STYLES[limbicState.posture] || { label: limbicState.posture, color: '#6b7280', desc: 'Unknown Mode' };
  }, [limbicState.posture]);

  const trustTier = useMemo(() => getTrustTier(limbicState.trust), [limbicState.trust]);

  return (
    <div className={`bg-[#0d1117] rounded-xl ${className}`}>
      <div className={`flex flex-col items-center ${compact ? 'gap-4 p-4' : 'gap-6 p-6'}`}>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            Limbic Engine
          </h2>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full border"
            style={{
              borderColor: `${postureInfo.color}40`,
              background: `${postureInfo.color}15`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: postureInfo.color }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: postureInfo.color }}>
              {postureInfo.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {GAUGE_CONFIGS.slice(0, 5).map((g) => {
            const val = limbicState[g.key as keyof typeof limbicState] as number;
            return (
              <CircularGauge
                key={g.key}
                value={val}
                label={g.label}
                color={g.getColor(val)}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-5 gap-4">
          {GAUGE_CONFIGS.slice(5).map((g) => {
            const val = limbicState[g.key as keyof typeof limbicState] as number;
            return (
              <CircularGauge
                key={g.key}
                value={val}
                label={g.label}
                color={g.getColor(val)}
              />
            );
          })}
        </div>

        <div
          className="w-full max-w-md rounded-lg border p-4"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Trust Tier
            </span>
            <span className="text-xs font-bold" style={{ color: '#FFD700' }}>
              {trustTier.name}
            </span>
          </div>
          <p className="text-xs text-gray-500">{trustTier.desc}</p>
          <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#FFD700' }}
              initial={{ width: 0 }}
              animate={{ width: `${limbicState.trust * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {TRUST_TIERS.map((t) => (
              <span key={t.name} className="text-[8px] text-gray-400">{t.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LimbicDashboard;

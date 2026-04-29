'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { COLORS } from '@/lib/design-tokens';

interface LimbicDashboardProps {
  limbicState: {
    trust: number;
    warmth: number;
    arousal: number;
    valence: number;
    curiosity: number;
    focus: number;
    creativity: number;
    empathy: number;
    resilience: number;
    intuition: number;
    posture: string;
    energy?: number;
  };
  showConsciousness?: boolean;
  compact?: boolean;
  className?: string;
}

type ConsciousnessState = 'active' | 'dreaming' | 'processing' | 'resting';

interface CircularGaugeProps {
  value: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  colors: { low: string; mid: string; high: string };
  className?: string;
}

function getColorForValue(value: number, colors: { low: string; mid: string; high: string }): string {
  if (value < 33) return colors.low;
  if (value < 66) return colors.mid;
  return colors.high;
}

function normalizeColors(colorObj: Record<string, string>): { low: string; mid: string; high: string } {
  const keys = Object.keys(colorObj);
  return { low: colorObj[keys[0]], mid: colorObj[keys[1]], high: colorObj[keys[2]] };
}

function inferConsciousnessState(energy?: number): ConsciousnessState {
  if (energy === undefined) return 'active';
  if (energy > 75) return 'active';
  if (energy > 50) return 'processing';
  if (energy > 25) return 'dreaming';
  return 'resting';
}

function getPostureColor(posture: string): string {
  const lower = posture.toLowerCase();
  if (lower.includes('open') || lower.includes('warm') || lower.includes('engaged')) return COLORS.limbic.trust.high;
  if (lower.includes('guard') || lower.includes('defensive') || lower.includes('closed')) return COLORS.limbic.trust.low;
  if (lower.includes('curious') || lower.includes('explor')) return COLORS.limbic.curiosity.high;
  return COLORS.limbic.valence.neutral;
}

function getEmotionalDescription(state: LimbicDashboardProps['limbicState']): string {
  const avg = (state.trust + state.warmth + state.valence + state.empathy) / 4;
  const energy = (state.arousal + state.curiosity + state.focus) / 3;
  if (avg > 75 && energy > 60) return 'Deeply engaged and emotionally present';
  if (avg > 60 && energy > 40) return 'Warm and attentive with steady focus';
  if (avg > 40) return 'Balanced emotional state with moderate engagement';
  if (energy > 60) return 'Heightened awareness with guarded emotions';
  return 'Reflective and conserving emotional energy';
}

export function CircularGauge({ value, label, size = 120, strokeWidth = 8, colors, className = '' }: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.max(0, Math.min(100, value));
  const color = getColorForValue(clampedValue, colors);

  const springValue = useSpring(0, { stiffness: 60, damping: 20 });
  const dashOffset = useTransform(springValue, (v) => circumference - (v / 100) * circumference);
  const displayValue = useTransform(springValue, (v) => Math.round(v));

  useEffect(() => {
    springValue.set(clampedValue);
  }, [clampedValue, springValue]);

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(100, 116, 139, 0.2)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-white font-semibold"
            style={{ fontSize: size * 0.22 }}
          >
            {displayValue}
          </motion.span>
        </div>
      </div>
      <span
        className="text-slate-400 font-medium text-center"
        style={{ fontSize: size * 0.11 }}
      >
        {label}
      </span>
    </div>
  );
}

export function ConsciousnessMonitor({
  state,
  energy = 50,
  compact = false,
}: {
  state: ConsciousnessState;
  energy?: number;
  compact?: boolean;
}) {
  const stateColor = COLORS.consciousness[state];
  const stateLabel = state.charAt(0).toUpperCase() + state.slice(1);

  const healthMetrics = useMemo(() => [
    { label: 'Memory', value: Math.min(100, energy + 20) },
    { label: 'Processing', value: Math.min(100, energy + 10) },
    { label: 'Emotional Calibration', value: Math.min(100, energy + 5) },
  ], [energy]);

  const thoughtDescriptions: Record<ConsciousnessState, string> = {
    active: 'Actively processing and responding to input',
    dreaming: 'Exploring associative patterns and memories',
    processing: 'Integrating recent experiences and learning',
    resting: 'Low-power state, maintaining core functions',
  };

  return (
    <div className={`rounded-xl border border-slate-700/50 bg-slate-800/50 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="rounded-full"
          style={{ width: 12, height: 12, backgroundColor: stateColor }}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="text-white font-semibold text-sm">Consciousness: {stateLabel}</span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Activity Level</span>
          <span>{Math.round(energy)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: stateColor }}
            initial={{ width: 0 }}
            animate={{ width: `${energy}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 italic">
        {thoughtDescriptions[state]}
      </p>

      {!compact && (
        <div className="space-y-2">
          <span className="text-xs text-slate-500 font-medium">System Health</span>
          {healthMetrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex justify-between text-xs text-slate-400 mb-0.5">
                <span>{metric.label}</span>
                <span>{Math.round(metric.value)}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: metric.value > 70 ? COLORS.consciousness.active : metric.value > 40 ? COLORS.consciousness.processing : COLORS.consciousness.resting,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LimbicDashboard({ limbicState, showConsciousness = true, compact = false, className = '' }: LimbicDashboardProps) {
  const primarySize = compact ? 90 : 120;
  const secondarySize = compact ? 70 : 90;
  const primaryStroke = compact ? 6 : 8;
  const secondaryStroke = compact ? 5 : 6;

  const primaryGauges = [
    { key: 'trust' as const, label: 'Trust', colors: normalizeColors(COLORS.limbic.trust) },
    { key: 'warmth' as const, label: 'Warmth', colors: normalizeColors(COLORS.limbic.warmth) },
    { key: 'arousal' as const, label: 'Arousal', colors: normalizeColors(COLORS.limbic.arousal) },
    { key: 'valence' as const, label: 'Valence', colors: normalizeColors(COLORS.limbic.valence) },
  ];

  const secondaryGauges = [
    { key: 'curiosity' as const, label: 'Curiosity', colors: normalizeColors(COLORS.limbic.curiosity) },
    { key: 'focus' as const, label: 'Focus', colors: normalizeColors(COLORS.limbic.focus) },
    { key: 'creativity' as const, label: 'Creativity', colors: normalizeColors(COLORS.limbic.creativity) },
    { key: 'empathy' as const, label: 'Empathy', colors: normalizeColors(COLORS.limbic.empathy) },
    { key: 'resilience' as const, label: 'Resilience', colors: normalizeColors(COLORS.limbic.resilience) },
    { key: 'intuition' as const, label: 'Intuition', colors: normalizeColors(COLORS.limbic.intuition) },
  ];

  const consciousnessState = inferConsciousnessState(limbicState.energy);
  const postureColor = getPostureColor(limbicState.posture);
  const emotionalDescription = getEmotionalDescription(limbicState);

  return (
    <div className={`bg-slate-900 rounded-2xl ${compact ? 'p-4' : 'p-6'} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-lg">Limbic State</h2>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: COLORS.consciousness[consciousnessState] }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-slate-400 text-xs capitalize">{consciousnessState}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 flex-wrap mb-6">
        {primaryGauges.map((gauge) => (
          <CircularGauge
            key={gauge.key}
            value={limbicState[gauge.key]}
            label={gauge.label}
            size={primarySize}
            strokeWidth={primaryStroke}
            colors={gauge.colors}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 justify-items-center mb-6">
        {secondaryGauges.map((gauge) => (
          <CircularGauge
            key={gauge.key}
            value={limbicState[gauge.key]}
            label={gauge.label}
            size={secondarySize}
            strokeWidth={secondaryStroke}
            colors={gauge.colors}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 mb-3 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: postureColor }} />
          <span className="text-slate-300 text-sm font-medium">Posture:</span>
          <span className="text-white text-sm capitalize">{limbicState.posture}</span>
        </div>
      </div>

      <p className="text-slate-400 text-sm px-2 mb-4 italic">{emotionalDescription}</p>

      {showConsciousness && (
        <ConsciousnessMonitor
          state={consciousnessState}
          energy={limbicState.energy ?? 50}
          compact={compact}
        />
      )}
    </div>
  );
}

export default LimbicDashboard;

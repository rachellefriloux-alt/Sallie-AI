'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { COLORS, ANIMATIONS } from '@/lib/design-tokens';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  curiosity?: number;
  creativity?: number;
  autonomy?: number;
  energy?: number;
  loyalty?: number;
  focus?: number;
  resilience?: number;
  empathy?: number;
  wisdom?: number;
  intuition?: number;
  posture?: string;
  [key: string]: number | string | undefined;
}

interface AvatarProps {
  limbicState: LimbicState;
  isThinking?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAura?: boolean;
  showStatusIndicators?: boolean;
  interactive?: boolean;
  className?: string;
}

interface PostureVisual {
  label: string;
  glowColor: string;
  glowColorSecondary: string;
  mood: string;
}

type ExpressionState = 'neutral' | 'curious' | 'warm' | 'focused' | 'excited' | 'calm' | 'trusting' | 'creative';

const POSTURE_CONFIG: Record<string, PostureVisual> = {
  COMPANION: { label: 'Companion', glowColor: '#10b981', glowColorSecondary: '#34d399', mood: 'gentle' },
  COPILOT: { label: 'Co-Pilot', glowColor: '#3b82f6', glowColorSecondary: '#60a5fa', mood: 'alert' },
  PEER: { label: 'Peer', glowColor: '#14b8a6', glowColorSecondary: '#2dd4bf', mood: 'balanced' },
  CONFIDANTE: { label: 'Confidante', glowColor: '#8b5cf6', glowColorSecondary: '#a78bfa', mood: 'intimate' },
  EXPERT: { label: 'Expert', glowColor: '#f97316', glowColorSecondary: '#fb923c', mood: 'precise' },
  MENTOR: { label: 'Mentor', glowColor: '#ec4899', glowColorSecondary: '#f472b6', mood: 'wise' },
  GUIDE: { label: 'Guide', glowColor: '#06b6d4', glowColorSecondary: '#22d3ee', mood: 'directional' },
  ADVOCATE: { label: 'Advocate', glowColor: '#ef4444', glowColorSecondary: '#f87171', mood: 'passionate' },
  NURTURER: { label: 'Nurturer', glowColor: '#fb7185', glowColorSecondary: '#fda4af', mood: 'warm' },
};

const SIZE_CONFIG = {
  sm: { width: 64, height: 64, borderRadius: '50%', showBody: false },
  md: { width: 100, height: 120, borderRadius: '50%', showBody: false },
  lg: { width: 180, height: 220, borderRadius: '24px', showBody: true },
  xl: { width: 260, height: 340, borderRadius: '28px', showBody: true },
} as const;

const PARTICLE_COLORS = [
  '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#06b6d4', '#22d3ee', '#67e8f9',
  '#f472b6', '#ec4899', '#f9a8d4',
  '#fbbf24', '#f59e0b', '#fcd34d',
];

function getExpressionFromLimbic(limbicState: LimbicState, isThinking: boolean): ExpressionState {
  if (isThinking) return 'focused';
  if ((limbicState.empathy ?? 0.5) > 0.8 && limbicState.warmth > 0.6) return 'warm';
  if ((limbicState.curiosity ?? 0.5) > 0.7) return 'curious';
  if (limbicState.warmth > 0.7 && limbicState.trust > 0.6) return 'warm';
  if (limbicState.arousal > 0.7 && limbicState.valence > 0.6) return 'excited';
  if (limbicState.trust > 0.8) return 'trusting';
  if ((limbicState.creativity ?? 0.5) > 0.7) return 'creative';
  if ((limbicState.resilience ?? 0.5) > 0.8) return 'calm';
  if (limbicState.arousal < 0.3 && limbicState.valence > 0.4) return 'calm';
  if ((limbicState.focus ?? 0.5) > 0.7) return 'focused';
  return 'neutral';
}

function getAuraColors(limbicState: LimbicState, isThinking: boolean, postureVisual: PostureVisual): [string, string] {
  if (isThinking) return ['#7c3aed', '#a78bfa'];
  if (limbicState.trust > 0.7 && limbicState.warmth > 0.7) return ['#06B6D4', '#f472b6'];
  if (limbicState.trust < 0.3) return ['#f59e0b', '#ef4444'];
  if (limbicState.arousal > 0.7 && limbicState.valence > 0.6) return ['#d97706', '#7c3aed'];
  if (limbicState.arousal < 0.3) return ['#60a5fa', '#94a3b8'];
  if ((limbicState.creativity ?? 0.5) > 0.7) return ['#8b5cf6', '#ec4899'];
  if ((limbicState.curiosity ?? 0.5) > 0.7) return ['#06b6d4', '#22d3ee'];
  return [postureVisual.glowColor, postureVisual.glowColorSecondary];
}

export function SallieAvatar({
  limbicState,
  isThinking = false,
  isListening = false,
  isSpeaking = false,
  size = 'lg',
  showAura = true,
  showStatusIndicators = false,
  interactive = true,
  className = '',
}: AvatarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [blinkPhase, setBlinkPhase] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [idleSwayPhase, setIdleSwayPhase] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const [glanceDirection, setGlanceDirection] = useState({ x: 0, y: 0 });
  const [microExpression, setMicroExpression] = useState<'none' | 'eyebrowRaise' | 'smileWarm' | 'squint'>('none');
  const containerRef = useRef<HTMLDivElement>(null);
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const microRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const glanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());

  const sizeConfig = SIZE_CONFIG[size];
  const { width: avatarWidth, height: avatarHeight, borderRadius, showBody } = sizeConfig;

  const expressionState = useMemo(
    () => getExpressionFromLimbic(limbicState, isThinking),
    [limbicState.curiosity, limbicState.warmth, limbicState.trust, limbicState.arousal, limbicState.valence, limbicState.creativity, limbicState.focus, limbicState.empathy, limbicState.resilience, isThinking]
  );

  const posture = limbicState.posture || 'COMPANION';
  const postureVisual = useMemo(
    () => POSTURE_CONFIG[posture] || POSTURE_CONFIG.COMPANION,
    [posture]
  );

  const [auraColor1, auraColor2] = useMemo(
    () => getAuraColors(limbicState, isThinking, postureVisual),
    [limbicState.trust, limbicState.warmth, limbicState.arousal, limbicState.valence, limbicState.curiosity, limbicState.creativity, isThinking, postureVisual]
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let running = true;
    const animate = () => {
      if (!running) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const breathSpeed = Math.max(2.5, 4.5 - limbicState.arousal * 2);
      setBreathPhase(Math.sin(elapsed * (Math.PI * 2 / breathSpeed)));
      const swaySpeed = 6 + (1 - (limbicState.energy ?? 0.5)) * 4;
      setIdleSwayPhase(Math.sin(elapsed * (Math.PI * 2 / swaySpeed)) * 0.5 + Math.sin(elapsed * 0.7) * 0.3);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [prefersReducedMotion, limbicState.arousal, limbicState.energy]);

  useEffect(() => {
    if (prefersReducedMotion || size === 'sm') return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      const maxShift = size === 'xl' ? 6 : size === 'lg' ? 4 : 2;
      setMouseOffset({
        x: Math.max(-1, Math.min(1, dx)) * maxShift,
        y: Math.max(-1, Math.min(1, dy)) * maxShift,
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion, size]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const scheduleBlink = () => {
      const trustFactor = limbicState.trust > 0.7 ? 1.3 : 1;
      const delay = (2500 + Math.random() * 4500) * trustFactor;
      blinkRef.current = setTimeout(() => {
        setBlinkPhase(1);
        setTimeout(() => {
          setBlinkPhase(2);
          setTimeout(() => {
            setBlinkPhase(0);
            if (Math.random() < 0.18) {
              setTimeout(() => {
                setBlinkPhase(1);
                setTimeout(() => {
                  setBlinkPhase(2);
                  setTimeout(() => { setBlinkPhase(0); scheduleBlink(); }, 50);
                }, limbicState.trust > 0.7 ? 180 : 90);
              }, 100);
            } else {
              scheduleBlink();
            }
          }, 50);
        }, limbicState.trust > 0.7 && Math.random() < 0.3 ? 250 : 100);
      }, delay);
    };
    scheduleBlink();
    return () => { if (blinkRef.current) clearTimeout(blinkRef.current); };
  }, [prefersReducedMotion, limbicState.trust]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const scheduleMicro = () => {
      const delay = 4000 + Math.random() * 8000;
      microRef.current = setTimeout(() => {
        let expr: typeof microExpression = 'none';
        const empathyLevel = limbicState.empathy ?? 0.5;
        if ((limbicState.curiosity ?? 0.5) > 0.6 && Math.random() < 0.45) expr = 'eyebrowRaise';
        else if ((limbicState.warmth > 0.5 || empathyLevel > 0.6) && Math.random() < 0.45) expr = 'smileWarm';
        else if ((limbicState.focus ?? 0.5) > 0.7 && Math.random() < 0.35) expr = 'squint';
        if (expr !== 'none') {
          setMicroExpression(expr);
          setTimeout(() => { setMicroExpression('none'); scheduleMicro(); }, 700 + Math.random() * 500);
        } else {
          scheduleMicro();
        }
      }, delay);
    };
    scheduleMicro();
    return () => { if (microRef.current) clearTimeout(microRef.current); };
  }, [prefersReducedMotion, limbicState.curiosity, limbicState.warmth, limbicState.focus]);

  useEffect(() => {
    if (prefersReducedMotion || size === 'sm') return;
    const scheduleGlance = () => {
      const delay = 3000 + Math.random() * 6000;
      glanceRef.current = setTimeout(() => {
        const gx = (Math.random() - 0.5) * 2;
        const gy = (Math.random() - 0.5) * 1.5;
        setGlanceDirection({ x: gx, y: gy });
        setTimeout(() => {
          setGlanceDirection({ x: 0, y: 0 });
          scheduleGlance();
        }, 600 + Math.random() * 800);
      }, delay);
    };
    scheduleGlance();
    return () => { if (glanceRef.current) clearTimeout(glanceRef.current); };
  }, [prefersReducedMotion, size]);

  const imageSrc = useMemo(() => {
    if (isThinking) return '/images/sallie-thinking.png';
    if (isListening) return '/images/sallie-listening.png';
    if (isSpeaking) return '/images/sallie-speaking.png';
    if (limbicState.valence > 0.7 && limbicState.warmth > 0.6) return '/images/sallie-joyful.png';
    return '/images/sallie-portrait.png';
  }, [isThinking, isListening, isSpeaking, limbicState.valence, limbicState.warmth]);

  const statusLabel = useMemo(() => {
    if (isThinking) return 'THINKING';
    if (isListening) return 'LISTENING';
    if (isSpeaking) return 'SPEAKING';
    return postureVisual.label;
  }, [isThinking, isListening, isSpeaking, postureVisual.label]);

  const breathScale = 1 + breathPhase * 0.012;
  const breathY = breathPhase * (showBody ? 2 : 0.5);
  const swayX = idleSwayPhase * (showBody ? 1.5 : 0.5);
  const swayRotate = idleSwayPhase * 0.6;
  const eyeTrackX = mouseOffset.x + glanceDirection.x * 2;
  const eyeTrackY = mouseOffset.y + glanceDirection.y * 2;

  const blinkOverlayOpacity = blinkPhase === 2 ? 0.85 : blinkPhase === 1 ? 0.5 : 0;

  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 3,
      speed: 4 + Math.random() * 4,
      offset: (i / 8) * Math.PI * 2,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      delay: i * 0.3,
    }));
  }, []);

  const isSmall = size === 'sm';
  const containerWidth = isSmall ? avatarWidth : showBody ? avatarWidth * 1.3 : avatarWidth * 1.5;
  const containerHeight = isSmall ? avatarHeight : showBody ? avatarHeight * 1.2 : avatarWidth * 1.5;
  const labelFontSize = isSmall ? 0 : size === 'md' ? 9 : size === 'lg' ? 11 : 13;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: containerWidth, height: containerHeight + (labelFontSize > 0 ? labelFontSize + 8 : 0) }}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      role="img"
      aria-label={`Sallie avatar - ${statusLabel}`}
      aria-live="polite"
    >
      {showAura && (
        <>
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: avatarWidth * 1.4,
              height: avatarHeight * (showBody ? 1.1 : 1.4),
              background: `radial-gradient(ellipse, ${auraColor1}30 0%, ${auraColor2}18 40%, transparent 70%)`,
              filter: 'blur(20px)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.08, 1.03, 1],
              opacity: [0.4, 0.7, 0.55, 0.4],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: avatarWidth * 1.2,
              height: avatarHeight * (showBody ? 0.9 : 1.2),
              background: `radial-gradient(ellipse, ${auraColor2}20 0%, ${auraColor1}10 30%, transparent 60%)`,
              filter: 'blur(12px)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.12, 1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}

      <AnimatePresence>
        {isThinking && !prefersReducedMotion && particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 4px ${p.color}80`,
              top: '50%',
              left: '50%',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.2, 0.5],
              x: [Math.cos(p.offset) * avatarWidth * 0.4, Math.cos(p.offset + Math.PI) * avatarWidth * 0.4],
              y: [Math.sin(p.offset) * avatarHeight * 0.35, Math.sin(p.offset + Math.PI) * avatarHeight * 0.35],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: p.speed, repeat: Infinity, ease: 'linear', delay: p.delay }}
          />
        ))}
      </AnimatePresence>

      <div
        className="relative z-10 overflow-hidden"
        style={{
          width: avatarWidth,
          height: avatarHeight,
          borderRadius,
          boxShadow: `0 0 ${avatarWidth * 0.12}px ${auraColor1}50, 0 0 ${avatarWidth * 0.25}px ${auraColor2}20, inset 0 0 ${avatarWidth * 0.06}px ${auraColor1}15`,
          border: `1.5px solid ${auraColor1}35`,
          transform: prefersReducedMotion ? 'none' : `
            scale(${breathScale})
            translateX(${swayX + eyeTrackX * 0.3}px)
            translateY(${breathY}px)
            rotate(${swayRotate}deg)
          `,
          transition: 'transform 0.15s ease-out, box-shadow 0.5s ease',
          ...(isHovered ? {
            boxShadow: `0 0 ${avatarWidth * 0.2}px ${auraColor1}70, 0 0 ${avatarWidth * 0.4}px ${auraColor2}35, inset 0 0 ${avatarWidth * 0.1}px ${auraColor1}25`,
          } : {}),
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={imageSrc}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              transform: prefersReducedMotion ? 'none' : `translate(${eyeTrackX * 0.5}px, ${eyeTrackY * 0.5}px) scale(1.05)`,
              transition: 'transform 0.2s ease-out',
            }}
          >
            <Image
              src={imageSrc}
              alt="Sallie"
              fill
              sizes={`${avatarWidth}px`}
              style={{ objectFit: 'cover', objectPosition: showBody ? 'center 15%' : 'center center' }}
              priority
            />
          </motion.div>
        </AnimatePresence>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isThinking
              ? `radial-gradient(circle at 50% 30%, #7c3aed15 0%, transparent 60%)`
              : isListening
              ? `radial-gradient(circle at 50% 30%, #fbbf2410 0%, transparent 60%)`
              : isSpeaking
              ? `radial-gradient(circle at 50% 40%, ${auraColor1}12 0%, transparent 50%)`
              : `radial-gradient(circle at 50% 30%, ${auraColor1}08 0%, transparent 60%)`,
            borderRadius,
          }}
        />

        {blinkOverlayOpacity > 0 && !prefersReducedMotion && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: showBody ? '18%' : '32%',
              left: '15%',
              right: '15%',
              height: showBody ? avatarHeight * 0.02 : avatarWidth * 0.04,
              background: `linear-gradient(to right, transparent 5%, rgba(0,0,0,${blinkOverlayOpacity * 0.65}) 20%, rgba(0,0,0,${blinkOverlayOpacity * 0.75}) 50%, rgba(0,0,0,${blinkOverlayOpacity * 0.65}) 80%, transparent 95%)`,
              borderRadius: 3,
              zIndex: 5,
              transition: 'opacity 0.04s ease',
            }}
          />
        )}

        {microExpression === 'eyebrowRaise' && !prefersReducedMotion && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: showBody ? '14%' : '26%',
              left: '22%',
              right: '22%',
              height: avatarHeight * 0.012,
              zIndex: 6,
            }}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 0.4, y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ width: '30%', height: '100%', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)', borderRadius: 3, position: 'absolute', left: '8%' }} />
            <div style={{ width: '30%', height: '100%', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent)', borderRadius: 3, position: 'absolute', right: '8%' }} />
          </motion.div>
        )}

        {microExpression === 'smileWarm' && !prefersReducedMotion && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              bottom: showBody ? '62%' : '26%',
              left: '30%',
              right: '30%',
              height: avatarHeight * 0.015,
              background: `radial-gradient(ellipse, ${auraColor1}18 0%, transparent 70%)`,
              borderRadius: '0 0 50% 50%',
              zIndex: 6,
            }}
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 0.5, scaleX: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        )}

        {isSpeaking && !prefersReducedMotion && (
          <>
            <motion.div
              className="absolute pointer-events-none"
              style={{
                bottom: showBody ? '60%' : '22%',
                left: '32%',
                right: '32%',
                height: avatarHeight * 0.012,
                background: `${auraColor1}25`,
                borderRadius: 4,
                zIndex: 6,
              }}
              animate={{
                scaleY: [1, 2.2, 0.6, 1.8, 1],
                scaleX: [1, 1.1, 0.95, 1.05, 1],
                opacity: [0.25, 0.5, 0.2, 0.45, 0.25],
              }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ border: `1.5px solid ${auraColor1}`, borderRadius }}
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.02, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          </>
        )}

        {isListening && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ border: `1px dashed ${auraColor1}60`, borderRadius }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 60%, rgba(13,17,23,0.4) 100%)`,
            borderRadius,
          }}
        />

        {isHovered && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${auraColor1}08 0%, transparent 50%, ${auraColor2}06 100%)`,
              borderRadius,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>

      {labelFontSize > 0 && (
        <motion.div
          className="z-10 mt-1.5 text-center"
          style={{
            fontSize: labelFontSize,
            fontWeight: 600,
            letterSpacing: '0.12em',
            color: auraColor1,
            textShadow: `0 0 8px ${auraColor1}40`,
          }}
          animate={prefersReducedMotion ? {} : { opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {statusLabel}
        </motion.div>
      )}

      {showStatusIndicators && (
        <>
          {[
            { label: 'Trust', value: limbicState.trust, color: limbicState.trust > 0.6 ? COLORS.limbic.trust.high : limbicState.trust > 0.3 ? COLORS.limbic.trust.medium : COLORS.limbic.trust.low, angle: -45 },
            { label: 'Warmth', value: limbicState.warmth, color: limbicState.warmth > 0.7 ? COLORS.limbic.warmth.warm : limbicState.warmth > 0.4 ? COLORS.limbic.warmth.neutral : COLORS.limbic.warmth.cold, angle: 45 },
            { label: 'Energy', value: limbicState.arousal, color: limbicState.arousal > 0.5 ? COLORS.limbic.arousal.energized : COLORS.limbic.arousal.calm, angle: 135 },
            { label: 'Mood', value: limbicState.valence, color: limbicState.valence > 0.5 ? COLORS.limbic.valence.positive : COLORS.limbic.valence.negative, angle: -135 },
          ].map((ind) => {
            const rad = (ind.angle * Math.PI) / 180;
            const dist = Math.max(avatarWidth, avatarHeight) * 0.45;
            const x = Math.cos(rad) * dist;
            const y = Math.sin(rad) * dist;
            const dotSize = 4 + ind.value * 6;
            return (
              <motion.div
                key={ind.label}
                className="absolute rounded-full z-20"
                style={{
                  width: dotSize,
                  height: dotSize,
                  background: ind.color,
                  left: `calc(50% + ${x}px - ${dotSize / 2}px)`,
                  top: `calc(50% + ${y}px - ${dotSize / 2}px)`,
                  boxShadow: `0 0 6px ${ind.color}80`,
                }}
                animate={prefersReducedMotion ? {} : { scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                title={`${ind.label}: ${Math.round(ind.value * 100)}%`}
              />
            );
          })}
        </>
      )}
    </div>
  );
}

export default SallieAvatar;

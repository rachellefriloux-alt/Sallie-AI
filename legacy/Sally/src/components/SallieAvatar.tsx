'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SallieAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  trust?: number;
  warmth?: number;
  arousal?: number;
  valence?: number;
  expression?: 'neutral' | 'thinking' | 'listening' | 'joyful' | 'concerned' | 'speaking';
  showParticles?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { width: 64, height: 64, borderRadius: '50%', showBody: false },
  md: { width: 100, height: 120, borderRadius: '50%', showBody: false },
  lg: { width: 180, height: 220, borderRadius: '24px', showBody: true },
  xl: { width: 260, height: 340, borderRadius: '28px', showBody: true },
} as const;

function getAuraColor(trust: number, warmth: number): string {
  if (trust > 0.7 && warmth > 0.7) return '#06B6D4';
  if (trust > 0.5) return '#8B5CF6';
  if (trust < 0.3) return '#f59e0b';
  return '#14b8a6';
}

function getSecondaryAuraColor(trust: number, warmth: number): string {
  if (trust > 0.7 && warmth > 0.7) return '#f472b6';
  if (trust > 0.5) return '#a78bfa';
  if (trust < 0.3) return '#ef4444';
  return '#2dd4bf';
}

function getImageSrc(expression: SallieAvatarProps['expression']): string {
  switch (expression) {
    case 'thinking': return '/images/sallie-thinking.png';
    case 'listening': return '/images/sallie-listening.png';
    case 'speaking': return '/images/sallie-speaking.png';
    case 'joyful': return '/images/sallie-joyful.png';
    default: return '/images/sallie-portrait.png';
  }
}

export function SallieAvatar({
  size = 'md',
  trust = 0.5,
  warmth = 0.5,
  arousal = 0.3,
  valence = 0,
  expression = 'neutral',
  showParticles = false,
  className = '',
}: SallieAvatarProps) {
  const config = SIZE_CONFIG[size];
  const { width: px, height: py, borderRadius, showBody } = config;
  const auraColor = useMemo(() => getAuraColor(trust, warmth), [trust, warmth]);
  const secondaryAura = useMemo(() => getSecondaryAuraColor(trust, warmth), [trust, warmth]);
  const imageSrc = useMemo(() => getImageSrc(expression), [expression]);
  const pulseSpeed = arousal > 0.7 ? 1.5 : arousal > 0.3 ? 2.5 : 4;
  const breathSpeed = Math.max(2.5, 4.5 - arousal * 2);

  const [blinkState, setBlinkState] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [microExpr, setMicroExpr] = useState<'none' | 'eyebrowRaise' | 'smileWarmth'>('none');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const blinkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const microRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());

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
      setBreathPhase(Math.sin(elapsed * (Math.PI * 2 / breathSpeed)));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [prefersReducedMotion, breathSpeed]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const scheduleBlink = () => {
      const trustFactor = trust > 0.7 ? 1.4 : 1;
      const delay = (2500 + Math.random() * 4500) * trustFactor;
      blinkRef.current = setTimeout(() => {
        setBlinkState(true);
        setTimeout(() => {
          setBlinkState(false);
          if (Math.random() < 0.15) {
            setTimeout(() => {
              setBlinkState(true);
              setTimeout(() => { setBlinkState(false); scheduleBlink(); }, trust > 0.7 ? 200 : 100);
            }, 100);
          } else {
            scheduleBlink();
          }
        }, trust > 0.7 && Math.random() < 0.3 ? 250 : 120);
      }, delay);
    };
    scheduleBlink();
    return () => { if (blinkRef.current) clearTimeout(blinkRef.current); };
  }, [prefersReducedMotion, trust]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const scheduleMicro = () => {
      const delay = 5000 + Math.random() * 8000;
      microRef.current = setTimeout(() => {
        if (warmth > 0.5 && Math.random() < 0.4) setMicroExpr('smileWarmth');
        else if (Math.random() < 0.3) setMicroExpr('eyebrowRaise');
        setTimeout(() => { setMicroExpr('none'); scheduleMicro(); }, 600 + Math.random() * 500);
      }, delay);
    };
    scheduleMicro();
    return () => { if (microRef.current) clearTimeout(microRef.current); };
  }, [prefersReducedMotion, warmth]);

  const particles = useMemo(() => {
    if (!showParticles && expression !== 'thinking') return [];
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: (i / 6) * Math.PI * 2,
      size: 2 + Math.random() * 2.5,
      speed: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }, [showParticles, expression]);

  const breathScale = 1 + breathPhase * 0.01;
  const breathY = breathPhase * (showBody ? 1.5 : 0.3);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: px * (showBody ? 1.2 : 1.3), height: py * (showBody ? 1.15 : 1.3) }}
    >
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: px * 1.2,
          height: py * 1.2,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse, ${secondaryAura}18 0%, ${auraColor}12 40%, transparent 70%)`,
          filter: 'blur(8px)',
          borderRadius,
        }}
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          scale: { duration: pulseSpeed * 2, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: pulseSpeed * 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      />

      <div
        className="relative overflow-hidden"
        style={{
          width: px,
          height: py,
          borderRadius,
          boxShadow: `0 0 ${px * 0.12}px ${auraColor}50, 0 0 ${px * 0.25}px ${auraColor}18`,
          border: `1.5px solid ${auraColor}30`,
          transform: prefersReducedMotion ? 'none' : `scale(${breathScale}) translateY(${breathY}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={imageSrc}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full h-full relative"
            style={{ transform: 'scale(1.05)' }}
          >
            <Image
              src={imageSrc}
              alt="Sallie"
              fill
              sizes={`${px}px`}
              style={{ objectFit: 'cover', objectPosition: showBody ? 'center 15%' : 'center center' }}
              priority={size === 'sm'}
            />
          </motion.div>
        </AnimatePresence>

        {blinkState && !prefersReducedMotion && (
          <div
            style={{
              position: 'absolute',
              top: showBody ? '20%' : '34%',
              left: '14%',
              right: '14%',
              height: py * 0.025,
              background: 'linear-gradient(to right, transparent 5%, rgba(0,0,0,0.55) 20%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.55) 80%, transparent 95%)',
              borderRadius: 2,
              zIndex: 5,
            }}
          />
        )}

        {microExpr === 'smileWarmth' && !prefersReducedMotion && (
          <motion.div
            style={{
              position: 'absolute',
              bottom: showBody ? '62%' : '26%',
              left: '30%',
              right: '30%',
              height: py * 0.015,
              background: `radial-gradient(ellipse, ${auraColor}18 0%, transparent 70%)`,
              borderRadius: '0 0 50% 50%',
              zIndex: 6,
            }}
            initial={{ opacity: 0, scaleX: 0.6 }}
            animate={{ opacity: 0.45, scaleX: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}

        {expression === 'speaking' && !prefersReducedMotion && (
          <>
            <motion.div
              className="absolute pointer-events-none"
              style={{
                bottom: showBody ? '60%' : '20%',
                left: '33%',
                right: '33%',
                height: py * 0.015,
                background: `${auraColor}22`,
                borderRadius: 4,
                zIndex: 6,
              }}
              animate={{
                scaleY: [1, 2, 0.7, 1.6, 1],
                opacity: [0.2, 0.45, 0.15, 0.4, 0.2],
              }}
              transition={{ duration: 0.35, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ border: `1.5px solid ${auraColor}`, borderRadius }}
              animate={{ scale: [1, 1.02, 1], opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          </>
        )}

        {expression === 'listening' && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ border: `1px dashed ${auraColor}60`, borderRadius }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}

        {expression === 'joyful' && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle, #fbbf2412 0%, transparent 60%)`, borderRadius }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent 55%, rgba(13,17,23,0.35) 100%)`,
            borderRadius,
          }}
        />
      </div>

      <AnimatePresence>
        {particles.map((p) => {
          const dist = Math.max(px, py) * 0.45;
          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: auraColor,
                boxShadow: `0 0 3px ${auraColor}60`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
                x: [Math.cos(p.angle) * dist * 0.6, Math.cos(p.angle + Math.PI * 0.5) * dist],
                y: [Math.sin(p.angle) * dist * 0.6, Math.sin(p.angle + Math.PI * 0.5) * dist],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: p.speed, repeat: Infinity, ease: 'linear', delay: p.delay }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default SallieAvatar;

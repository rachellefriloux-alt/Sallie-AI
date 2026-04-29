'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

const GLASS_BASE = {
  backdropFilter: 'blur(60px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(60px) saturate(1.8)',
} as const;

function liquidBorder(color: string, opacity = 0.12) {
  return `1px solid color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`;
}

function glowShadow(color: string, intensity: 'subtle' | 'medium' | 'strong' = 'medium') {
  const levels = {
    subtle: `0 0 30px ${color}06, 0 8px 32px rgba(0,0,0,0.3)`,
    medium: `0 0 40px ${color}0a, 0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03) inset`,
    strong: `0 0 60px ${color}10, 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset`,
  };
  return levels[intensity];
}

export interface SalliePanelProps {
  children: React.ReactNode;
  accent?: string;
  glow?: 'subtle' | 'medium' | 'strong';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
  as?: 'div' | 'section' | 'article';
}

export function SalliePanel({
  children,
  accent = '#C8A84E',
  glow = 'medium',
  className = '',
  style,
  onClick,
  hoverable = false,
  as: Tag = 'div',
}: SalliePanelProps) {
  return (
    <Tag
      className={`relative rounded-2xl overflow-hidden ${hoverable ? 'cursor-pointer group' : ''} ${className}`}
      style={{
        ...GLASS_BASE,
        background: `linear-gradient(160deg, rgba(10,12,18,0.88), ${accent}04)`,
        border: liquidBorder(accent, 0.12),
        boxShadow: glowShadow(accent, glow),
        padding: '1.25rem',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
      onClick={onClick}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-px ${hoverable ? 'opacity-0 group-hover:opacity-100' : 'opacity-40'}`}
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${accent}50 30%, ${accent}80 50%, ${accent}50 70%, transparent 95%)`,
          transition: 'opacity 0.7s',
        }}
      />
      {children}
    </Tag>
  );
}

export interface SallieButtonProps {
  children: React.ReactNode;
  accent?: string;
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function SallieButton({
  children,
  accent = '#C8A84E',
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  icon,
}: SallieButtonProps) {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-[11px]',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-7 py-3.5 text-sm',
  };

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${accent}18, ${accent}0a)`,
      border: liquidBorder(accent, 0.3),
      color: accent,
      boxShadow: `0 0 20px ${accent}0a`,
    },
    ghost: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.5)',
      boxShadow: 'none',
    },
    danger: {
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      color: '#ef4444',
      boxShadow: '0 0 20px rgba(239,68,68,0.06)',
    },
  };

  return (
    <button
      className={`relative rounded-xl font-black uppercase tracking-[0.15em] transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${sizeStyles[size]} ${className}`}
      style={{
        ...GLASS_BASE,
        ...variantStyles[variant],
      }}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="flex items-center gap-2 justify-center">
        {icon}
        {children}
      </span>
    </button>
  );
}

export interface SallieGaugeProps {
  label: string;
  value: number;
  color: string;
  icon?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
}

export function SallieGauge({
  label,
  value,
  color,
  icon,
  showValue = true,
  size = 'md',
}: SallieGaugeProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-white/40 flex items-center gap-1.5">
          {icon && <span className="text-sm">{icon}</span>}
          {label}
        </span>
        {showValue && (
          <span className="text-[11px] font-black tabular-nums" style={{ color }}>
            {Math.round(value * 100)}%
          </span>
        )}
      </div>
      <div className={`${height} rounded-full overflow-hidden`} style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          className="h-full rounded-full relative"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}50, 0 0 4px ${color}80`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value * 100, 100)}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)' }} />
        </motion.div>
      </div>
    </div>
  );
}

export interface SallieDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  accent?: string;
  children: React.ReactNode;
  side?: 'right' | 'bottom';
  width?: string;
}

export function SallieDrawer({
  open,
  onClose,
  title,
  subtitle,
  accent = '#C8A84E',
  children,
  side = 'right',
  width = '480px',
}: SallieDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isRight = side === 'right';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-[101] overflow-y-auto"
            style={{
              ...GLASS_BASE,
              background: 'linear-gradient(160deg, rgba(14,16,21,0.97), rgba(10,12,18,0.99))',
              borderLeft: isRight ? liquidBorder(accent, 0.15) : 'none',
              borderTop: !isRight ? liquidBorder(accent, 0.15) : 'none',
              boxShadow: `0 0 80px rgba(0,0,0,0.6), 0 0 40px ${accent}08`,
              ...(isRight
                ? { top: 0, right: 0, bottom: 0, width }
                : { left: 0, right: 0, bottom: 0, maxHeight: '80vh' }),
            }}
            initial={isRight ? { x: '100%' } : { y: '100%' }}
            animate={isRight ? { x: 0 } : { y: 0 }}
            exit={isRight ? { x: '100%' } : { y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent 5%, ${accent}40 50%, transparent 95%)` }}
            />
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 pb-4" style={{ ...GLASS_BASE, background: 'rgba(14,16,21,0.95)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white/90">{title}</h2>
                {subtitle && <p className="text-[11px] text-white/35 mt-0.5 font-medium">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-all duration-300 hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export interface SallieModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  accent?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function SallieModal({
  open,
  onClose,
  title,
  subtitle,
  accent = '#C8A84E',
  children,
  size = 'md',
}: SallieModalProps) {
  const sizeClass = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className={`${sizeClass[size]} w-full pointer-events-auto rounded-2xl overflow-hidden`}
              style={{
                ...GLASS_BASE,
                background: 'linear-gradient(160deg, rgba(14,16,21,0.97), rgba(10,12,18,0.99))',
                border: liquidBorder(accent, 0.15),
                boxShadow: `0 0 80px rgba(0,0,0,0.6), 0 0 60px ${accent}0a, 0 0 0 1px rgba(255,255,255,0.03) inset`,
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent 5%, ${accent}50 50%, transparent 95%)` }}
              />
              <div className="flex items-center justify-between p-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white/90">{title}</h2>
                  {subtitle && <p className="text-[11px] text-white/35 mt-0.5 font-medium">{subtitle}</p>}
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <X className="w-4 h-4 text-white/40" />
                </button>
              </div>
              <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export interface SallieSlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  accent?: string;
  children: React.ReactNode;
}

export function SallieSlideOver({ open, onClose, title, accent = '#C8A84E', children }: SallieSlideOverProps) {
  return <SallieDrawer open={open} onClose={onClose} title={title} accent={accent} side="right" width="420px">{children}</SallieDrawer>;
}

export interface SallieInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  accent?: string;
  className?: string;
  onSubmit?: () => void;
  icon?: React.ReactNode;
  multiline?: boolean;
}

export function SallieInput({
  value,
  onChange,
  placeholder = '',
  accent = '#C8A84E',
  className = '',
  onSubmit,
  icon,
  multiline = false,
}: SallieInputProps) {
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div className={`relative flex items-center gap-2 rounded-xl overflow-hidden ${className}`} style={{
      ...GLASS_BASE,
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid rgba(255,255,255,0.08)`,
      transition: 'border-color 0.3s',
    }}>
      {icon && <div className="pl-3 text-white/30">{icon}</div>}
      <Tag
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white/80 placeholder:text-white/20 text-sm font-medium tracking-tight outline-none px-3 py-3"
        style={{ resize: 'none' }}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        {...(multiline ? { rows: 3 } : {})}
      />
    </div>
  );
}

export interface SallieTagProps {
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

export function SallieTag({ label, color = '#C8A84E', icon }: SallieTagProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em]"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}20`,
        color,
      }}
    >
      {icon}
      {label}
    </span>
  );
}

export interface SallieSectionHeaderProps {
  title: string;
  accent?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function SallieSectionHeader({ title, accent = '#C8A84E', icon, action }: SallieSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon && <span style={{ color: accent, filter: `drop-shadow(0 0 6px ${accent}60)` }}>{icon}</span>}
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>{title}</h2>
        <div className="w-12 h-px ml-1" style={{ background: `linear-gradient(90deg, ${accent}30, transparent)` }} />
      </div>
      {action}
    </div>
  );
}

export interface SallieEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  accent?: string;
  action?: React.ReactNode;
}

export function SallieEmptyState({ icon, title, message, accent = '#C8A84E', action }: SallieEmptyStateProps) {
  return (
    <SalliePanel accent={accent} glow="subtle" className="text-center py-8">
      <div className="flex justify-center mb-4">
        <div className="p-4 rounded-2xl" style={{ background: `${accent}08`, border: `1px solid ${accent}12`, boxShadow: `0 0 30px ${accent}06` }}>
          <span style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent}60)` }}>{icon}</span>
        </div>
      </div>
      <p className="text-base font-black tracking-tight text-white/80 mb-1">{title}</p>
      <p className="text-xs text-white/35 leading-relaxed max-w-sm mx-auto">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </SalliePanel>
  );
}

export { GLASS_BASE, liquidBorder, glowShadow };

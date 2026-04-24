'use client';

/**
 * Spinner Component - Sallie UI Library
 * An animated loading spinner with theme support
 */

import { forwardRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SpinnerProps, Theme, Size } from './types';

// Theme styles for spinners
const themeStyles: Record<Theme, string> = {
  peacock: 'border-peacock-500 border-t-transparent',
  leopard: 'border-leopard-500 border-t-transparent',
  mixed: 'border-peacock-500 border-t-leopard-500',
  obsidian: 'border-gray-400 border-t-transparent',
  celestial: 'border-purple-500 border-t-transparent',
  void: 'border-yellow-500 border-t-transparent',
};

// Size styles
const sizeStyles: Record<Size, string> = {
  xs: 'w-4 h-4 border-2',
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
};

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ theme = 'peacock', size = 'md', label = 'Loading...', className, ...props }, ref) => {
    const spinnerStyles = useMemo(() => {
      return cn(
        'rounded-full',
        themeStyles[theme],
        sizeStyles[size],
        className
      );
    }, [theme, size, className]);

    return (
      <div ref={ref} className="inline-flex items-center gap-2" {...props}>
        <motion.div
          className={spinnerStyles}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {label && <span className="sr-only">{label}</span>}
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Dots spinner variant
export const DotsSpinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ theme = 'peacock', size = 'md', label = 'Loading...', className, ...props }, ref) => {
    const dotColors: Record<Theme, string> = {
      peacock: 'bg-peacock-500',
      leopard: 'bg-leopard-500',
      mixed: 'bg-peacock-500',
      obsidian: 'bg-gray-400',
      celestial: 'bg-purple-500',
      void: 'bg-yellow-500',
    };

    const dotSizes: Record<Size, string> = {
      xs: 'w-1 h-1',
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };

    return (
      <div ref={ref} className={cn('inline-flex items-center gap-1', className)} {...props}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn('rounded-full', dotColors[theme], dotSizes[size])}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
        {label && <span className="sr-only">{label}</span>}
      </div>
    );
  }
);

DotsSpinner.displayName = 'DotsSpinner';

// Pulse spinner variant
export const PulseSpinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ theme = 'peacock', size = 'md', label = 'Loading...', className, ...props }, ref) => {
    const pulseColors: Record<Theme, string> = {
      peacock: 'bg-peacock-500',
      leopard: 'bg-leopard-500',
      mixed: 'bg-peacock-500',
      obsidian: 'bg-gray-400',
      celestial: 'bg-purple-500',
      void: 'bg-yellow-500',
    };

    const pulseSizes: Record<Size, string> = {
      xs: 'w-4 h-4',
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };

    return (
      <div ref={ref} className={cn('inline-flex items-center', className)} {...props}>
        <motion.div
          className={cn('rounded-full', pulseColors[theme], pulseSizes[size])}
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {label && <span className="sr-only">{label}</span>}
      </div>
    );
  }
);

PulseSpinner.displayName = 'PulseSpinner';

export default Spinner;

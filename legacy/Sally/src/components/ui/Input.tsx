'use client';

/**
 * Input Component - Sallie UI Library
 * A versatile input component with theme support and accessibility
 */

import { forwardRef, useMemo, useId } from 'react';
import { cn } from '@/lib/utils';
import type { InputProps, Theme, Size } from './types';

// Theme styles for inputs
const themeStyles: Record<Theme, string> = {
  peacock: 'bg-peacock-950/50 border-peacock-500/30 focus:border-peacock-400 focus:ring-peacock-400/20',
  leopard: 'bg-leopard-950/50 border-leopard-500/30 focus:border-leopard-400 focus:ring-leopard-400/20',
  mixed: 'bg-gradient-to-br from-peacock-950/50 to-leopard-950/50 border-peacock-500/30 focus:border-peacock-400',
  obsidian: 'bg-black/50 border-gray-600/30 focus:border-gray-500 focus:ring-gray-500/20',
  celestial: 'bg-purple-950/50 border-purple-500/30 focus:border-purple-400 focus:ring-purple-400/20',
  void: 'bg-black/70 border-yellow-500/30 focus:border-yellow-400 focus:ring-yellow-400/20',
};

// Size styles
const sizeStyles: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-md',
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-12 px-5 text-base rounded-xl',
  xl: 'h-14 px-6 text-lg rounded-2xl',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      theme = 'peacock',
      size = 'md',
      label,
      error,
      hint,
      leftElement,
      rightElement,
      isFullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const inputStyles = useMemo(() => {
      return cn(
        // Base styles
        'w-full border transition-all duration-200 outline-none',
        'text-white placeholder:text-gray-500',
        'focus:ring-2 focus:ring-offset-0',
        // Theme styles
        themeStyles[theme],
        // Size styles
        sizeStyles[size],
        // Error state
        error && 'border-red-500 focus:border-red-400 focus:ring-red-400/20',
        // Full width
        isFullWidth && 'w-full',
        // With left element
        leftElement && 'pl-10',
        // With right element
        rightElement && 'pr-10',
        // Disabled
        props.disabled && 'opacity-50 cursor-not-allowed',
        // Custom className
        className
      );
    }, [theme, size, error, isFullWidth, leftElement, rightElement, props.disabled, className]);

    return (
      <div className={cn('flex flex-col gap-1.5', isFullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={inputStyles}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-xs text-red-400" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

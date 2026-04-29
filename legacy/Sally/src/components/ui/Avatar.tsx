'use client';

/**
 * Avatar Component - Sallie UI Library
 * An animated avatar component with status indicators and theme support
 */

import { forwardRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AvatarProps, Theme, Size } from './types';

// Theme styles for avatar borders/glows
const themeStyles: Record<Theme, string> = {
  peacock: 'ring-peacock-500 shadow-peacock-500/30',
  leopard: 'ring-leopard-500 shadow-leopard-500/30',
  mixed: 'ring-peacock-500 shadow-leopard-500/30',
  obsidian: 'ring-gray-500 shadow-gray-500/30',
  celestial: 'ring-purple-500 shadow-purple-500/30',
  void: 'ring-yellow-500 shadow-yellow-500/30',
};

// Size styles
const sizeStyles: Record<Size, string> = {
  xs: 'w-8 h-8 text-xs',
  sm: 'w-10 h-10 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-xl',
};

// Status indicator colors
const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

// Generate initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Generate a consistent color from name
const getColorFromName = (name: string): string => {
  const colors = [
    'from-peacock-500 to-peacock-600',
    'from-leopard-500 to-leopard-600',
    'from-purple-500 to-purple-600',
    'from-cyan-500 to-cyan-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      theme = 'peacock',
      size = 'md',
      src,
      alt = 'Avatar',
      name,
      status,
      isAnimated = true,
      className,
      ...props
    },
    ref
  ) => {
    const initials = name ? getInitials(name) : '?';
    const gradientClass = name ? getColorFromName(name) : 'from-gray-500 to-gray-600';

    const containerStyles = useMemo(() => {
      return cn(
        // Base styles
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'ring-2 ring-offset-2 ring-offset-transparent',
        // Theme styles
        themeStyles[theme],
        // Size styles
        sizeStyles[size],
        // Custom className
        className
      );
    }, [theme, size, className]);

    const AnimationWrapper = isAnimated ? motion.div : 'div';

    return (
      <div ref={ref} className={containerStyles} {...props}>
        {src ? (
          // Image avatar
          <AnimationWrapper
            className="w-full h-full"
            initial={isAnimated ? { scale: 0.8, opacity: 0 } : undefined}
            animate={isAnimated ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.3 }}
          >
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover"
            />
          </AnimationWrapper>
        ) : (
          // Initials avatar
          <AnimationWrapper
            className={cn(
              'w-full h-full flex items-center justify-center font-semibold text-white',
              'bg-gradient-to-br',
              gradientClass
            )}
            initial={isAnimated ? { scale: 0.8, opacity: 0 } : undefined}
            animate={isAnimated ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            {initials}
          </AnimationWrapper>
        )}

        {/* Status indicator */}
        {status && (
          <motion.span
            className={cn(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white',
              size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3',
              statusColors[status]
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          />
        )}

        {/* Animated glow effect */}
        {isAnimated && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-full opacity-0',
              'bg-gradient-to-r from-transparent via-white/20 to-transparent'
            )}
            animate={{
              opacity: [0, 0.5, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group component
export interface AvatarGroupProps {
  max?: number;
  size?: Size;
  children: React.ReactNode;
  className?: string;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 4, size = 'md', children, className }, ref) => {
    const childArray = Array.isArray(children) ? children : [children];
    const visibleChildren = childArray.slice(0, max);
    const remainingCount = childArray.length - max;

    return (
      <div ref={ref} className={cn('flex -space-x-2', className)}>
        {visibleChildren.map((child, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{ zIndex: max - index }}
          >
            {child}
          </motion.div>
        ))}
        {remainingCount > 0 && (
          <motion.div
            initial={{ scale: 0, x: 20 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: max * 0.1 }}
            className={cn(
              'relative inline-flex items-center justify-center rounded-full',
              'bg-gray-700 ring-2 ring-white text-white font-medium',
              sizeStyles[size]
            )}
          >
            +{remainingCount}
          </motion.div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export default Avatar;

// @ts-nocheck
'use client';

/**
 * Modal Component - Sallie UI Library
 * A fully accessible modal dialog with theme support
 */

import { forwardRef, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModalProps, Theme } from './types';

// Theme styles for modals
const themeStyles: Record<Theme, string> = {
  peacock: 'bg-gradient-to-br from-peacock-900/95 to-peacock-950/95 border-peacock-500/30',
  leopard: 'bg-gradient-to-br from-leopard-900/95 to-leopard-950/95 border-leopard-500/30',
  mixed: 'bg-gradient-to-br from-peacock-900/95 via-leopard-900/95 to-peacock-900/95 border-peacock-500/30',
  obsidian: 'bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700/30',
  celestial: 'bg-gradient-to-br from-purple-900/95 to-indigo-950/95 border-purple-500/30',
  void: 'bg-gradient-to-br from-black/95 to-purple-950/95 border-yellow-500/30',
};

// Size styles
const sizeStyles = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      theme = 'peacock',
      isOpen,
      onClose,
      title,
      size = 'md',
      closeOnOverlayClick = true,
      closeOnEsc = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Handle escape key
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (closeOnEsc && event.key === 'Escape') {
          onClose();
        }
      },
      [closeOnEsc, onClose]
    );

    // Handle click outside
    const handleOverlayClick = useCallback(
      (event: React.MouseEvent) => {
        if (closeOnOverlayClick && event.target === event.currentTarget) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose]
    );

    // Focus management
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        
        // Focus the modal
        setTimeout(() => {
          modalRef.current?.focus();
        }, 0);

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
          document.removeEventListener('keydown', handleKeyDown);
          document.body.style.overflow = '';
          
          // Restore focus
          previousActiveElement.current?.focus();
        };
      }
    }, [isOpen, handleKeyDown]);

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleOverlayClick}
              aria-hidden="true"
            />

            {/* Modal Content */}
            <motion.div
              ref={(node: HTMLDivElement | null) => {
                (modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
              }}
              className={cn(
                'relative w-full rounded-2xl border backdrop-blur-xl shadow-2xl',
                'focus:outline-none',
                themeStyles[theme],
                sizeStyles[size],
                className
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              tabIndex={-1}
              variants={modalVariants}
              {...props}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2
                    id="modal-title"
                    className="text-xl font-semibold text-white"
                  >
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="p-6">{children}</div>

              {/* Close button (if no title) */}
              {!title && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;

// @ts-nocheck
'use client';

/**
 * Toast Component - Sallie UI Library
 * A notification toast with theme support and animations
 */

import { forwardRef, useEffect, useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastProps, Theme, Status } from './types';

// Icons for each status
const statusIcons: Record<Status, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

// Theme styles
const themeStyles: Record<Theme, string> = {
  peacock: 'border-peacock-500/30',
  leopard: 'border-leopard-500/30',
  mixed: 'border-peacock-500/30',
  obsidian: 'border-gray-500/30',
  celestial: 'border-purple-500/30',
  void: 'border-yellow-500/30',
};

// Status styles
const statusStyles: Record<Status, string> = {
  success: 'bg-green-900/90 text-green-100',
  warning: 'bg-yellow-900/90 text-yellow-100',
  error: 'bg-red-900/90 text-red-100',
  info: 'bg-blue-900/90 text-blue-100',
};

// Toast context for managing toasts
interface ToastContextValue {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, maxToasts = 5 }) => {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      const newToasts = [...prev, { ...toast, id }];
      return newToasts.slice(-maxToasts);
    });
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: (ToastProps & { id: string })[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual Toast
export const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      theme = 'peacock',
      status = 'info',
      title,
      description,
      duration = 5000,
      isClosable = true,
      onClose,
      className,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (duration && duration > 0) {
        const timer = setTimeout(() => {
          onClose?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    return (
      <motion.div
        ref={ref}
        className={cn(
          'w-80 p-4 rounded-xl border backdrop-blur-xl shadow-lg',
          'flex items-start gap-3',
          themeStyles[theme],
          statusStyles[status],
          className
        )}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        role="alert"
        {...props}
      >
        <div className="flex-shrink-0">{statusIcons[status]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          {description && <p className="text-xs opacity-80 mt-1">{description}</p>}
        </div>
        {isClosable && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }
);

Toast.displayName = 'Toast';

export default Toast;

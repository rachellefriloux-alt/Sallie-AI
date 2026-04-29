'use client';
import { useNotifications } from '@/hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    border: 'border-teal-500/30',
    icon: 'text-teal-400',
    bg: 'bg-teal-500/10',
  },
  error: {
    border: 'border-red-500/30',
    icon: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  warning: {
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  info: {
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
};

export function NotificationToast() {
  const { notifications, removeNotification, markAsRead } = useNotifications();

  const visibleToasts = notifications
    .filter((n) => !n.read)
    .slice(0, 3);

  const handleDismiss = (id: string) => {
    markAsRead(id);
    removeNotification(id);
  };

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((notification) => {
          const Icon = iconMap[notification.type];
          const colors = colorMap[notification.type];

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`pointer-events-auto w-80 rounded-xl border ${colors.border} shadow-2xl overflow-hidden`}
              style={{ backgroundColor: '#161b22' }}
            >
              <div className="flex items-start gap-3 p-4">
                <div className={`flex-shrink-0 p-1.5 rounded-lg ${colors.bg}`}>
                  <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="flex-shrink-0 p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

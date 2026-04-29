'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { category: 'Navigation', items: [
    { keys: ['Ctrl', 'K'], description: 'Focus chat input' },
    { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
    { keys: ['Ctrl', ','], description: 'Open settings' },
  ]},
  { category: 'Chat', items: [
    { keys: ['Enter'], description: 'Send message' },
    { keys: ['Shift', 'Enter'], description: 'New line' },
  ]},
  { category: 'Actions', items: [
    { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts' },
    { keys: ['Esc'], description: 'Close dialogs' },
  ]},
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === '/') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-4 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ backgroundColor: '#161b22' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/15">
                  <Keyboard className="w-5 h-5 text-teal-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-6">
              {SHORTCUTS.map((category) => (
                <div key={category.category}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
                    {category.category}
                  </h3>
                  <div className="space-y-2">
                    {category.items.map((shortcut) => (
                      <div
                        key={shortcut.description}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <span className="text-sm text-white/70">{shortcut.description}</span>
                        <div className="flex items-center gap-1.5">
                          {shortcut.keys.map((key, i) => (
                            <span key={i}>
                              <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-medium text-white/90 bg-white/10 border border-white/20 rounded-md shadow-sm">
                                {key}
                              </kbd>
                              {i < shortcut.keys.length - 1 && (
                                <span className="text-white/30 mx-0.5">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 border-t border-white/10 flex justify-center">
              <span className="text-xs text-white/30">
                Press <kbd className="px-1.5 py-0.5 text-xs bg-white/10 border border-white/20 rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-white/10 border border-white/20 rounded">/</kbd> to toggle
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CONVERGENCE_QUESTIONS, CATEGORY_LABELS } from '@/lib/convergence-questions';

export function GenesisPanel() {
  const totalQuestions = CONVERGENCE_QUESTIONS.length;
  const categories = [...new Set(CONVERGENCE_QUESTIONS.map((q) => q.category))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-peacock-900 mb-1">Genesis: The Great Convergence</h2>
          <p className="text-sm text-peacock-600">
            Phase 1 of Genesis. 30 questions across 6 categories to align Sallie with who you are.
          </p>
        </div>
        <Link
          href="/convergence"
          className="px-4 py-2 rounded-lg bg-peacock-600 text-white font-medium hover:bg-peacock-700 transition-colors"
        >
          Begin Genesis
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = CONVERGENCE_QUESTIONS.filter((q) => q.category === cat).length;
          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-white/80 border border-peacock-200 hover:border-peacock-400 transition-colors"
            >
              <div className="text-sm font-medium text-peacock-800 capitalize">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}</div>
              <div className="text-xs text-peacock-500 mt-1">{count} questions</div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-peacock-50 border border-peacock-200">
        <p className="text-sm text-peacock-700">
          <strong>Identity · Values · Goals · Fears · Communication · Learning</strong> — your answers shape Sallie&apos;s understanding and responses.
        </p>
      </div>
    </div>
  );
}

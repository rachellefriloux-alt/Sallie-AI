"use client";

import { motion } from "framer-motion";

export function CompletionAnimation() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-heritage-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-heritage-500/20 flex items-center justify-center breath-glow"
        >
          <span className="text-4xl">✦</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-serif text-heritage-800 mb-2"
        >
          Heritage DNA Complete
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-heritage-600"
        >
          Sallie now knows you. Your journey begins.
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 1, duration: 1.5 }}
          className="h-1 bg-heritage-300 rounded-full mt-8 max-w-xs mx-auto"
        />
      </motion.div>
    </main>
  );
}

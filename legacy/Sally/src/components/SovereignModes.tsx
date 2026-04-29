'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SOVEREIGN_MODES } from '@/lib/constants';

interface SovereignMode {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

export default function SovereignModes() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">Sovereign Modes</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Her Fluid Identities. Sallie adapts to your current battle with different personas.
          </p>
        </motion.div>
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SOVEREIGN_MODES.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onHoverStart={() => setHoveredMode(mode.id)}
            onHoverEnd={() => setHoveredMode(null)}
            className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
              hoveredMode === mode.id
                ? 'scale-105 shadow-2xl shadow-purple-500/20'
                : 'scale-100 shadow-lg'
            }`}
          >
            {/* Mode Card */}
            <div className="relative h-full bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden">
              {/* Mode Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={mode.image}
                  alt={mode.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              </div>

              {/* Mode Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-white">{mode.name}</h3>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-200 text-sm font-medium rounded-full">
                    {mode.role}
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{mode.bio}</p>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="inline-block"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900">
            Experience Sallie's Adaptability
          </button>
        </motion.div>
      </div>
    </div>
  );
}

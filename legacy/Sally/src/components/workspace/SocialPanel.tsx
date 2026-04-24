'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const ROLES = [
  { id: 'mom', name: 'Mom', icon: '👩‍👧‍👦', color: 'from-pink-400 to-rose-500' },
  { id: 'spouse', name: 'Spouse', icon: '💑', color: 'from-rose-400 to-pink-500' },
  { id: 'friend', name: 'Friend', icon: '👯‍♀️', color: 'from-purple-400 to-violet-500' },
  { id: 'business', name: 'Business', icon: '💼', color: 'from-amber-400 to-orange-500' },
  { id: 'creative', name: 'Creative', icon: '🎨', color: 'from-teal-400 to-cyan-500' },
  { id: 'self', name: 'Self', icon: '🔮', color: 'from-indigo-400 to-purple-500' },
];

export function SocialPanel() {
  const [activeRole, setActiveRole] = useState('mom');

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-peacock-900 mb-4">Sallie&apos;s Roles</h2>
      <p className="text-sm text-peacock-600 mb-6">
        Sallie adapts her archetype to match your context. Tap a role to see her behavior and voice.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.id)}
            className={`p-4 rounded-xl text-left border-2 transition-all ${
              activeRole === role.id
                ? 'border-peacock-500 bg-peacock-50 shadow-md'
                : 'border-peacock-200 hover:border-peacock-300 bg-white'
            }`}
          >
            <span className="text-2xl mb-2 block">{role.icon}</span>
            <span className="font-semibold text-peacock-900">{role.name}</span>
          </button>
        ))}
      </div>
      <div className="mt-6 p-4 rounded-xl bg-peacock-50 border border-peacock-200">
        <p className="text-sm text-peacock-700">
          <strong>{ROLES.find((r) => r.id === activeRole)?.name}</strong> — Sallie shifts her voice and behavior to support you in this role. Use the chat to experience each mode.
        </p>
      </div>
      <Link
        href="/communication"
        className="inline-block mt-4 px-4 py-2 rounded-lg bg-peacock-600 text-white text-sm font-medium hover:bg-peacock-700"
      >
        Open Conversation
      </Link>
    </div>
  );
}

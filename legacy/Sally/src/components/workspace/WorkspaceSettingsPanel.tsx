'use client';

import React from 'react';
import Link from 'next/link';
import { useSettingsStore } from '@/store/useSettingsStore';

export function WorkspaceSettingsPanel() {
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-peacock-900">Settings</h2>
        <Link
          href="/settings"
          className="text-sm text-peacock-600 hover:text-peacock-800 font-medium"
        >
          Full Settings →
        </Link>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-peacock-800 mb-2">Posture Mode</label>
          <select
            value={settings.posture}
            onChange={(e) => updateSettings({ posture: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-peacock-200 bg-white text-peacock-800 focus:ring-2 focus:ring-peacock-500 focus:border-peacock-500"
          >
            <option value="COMPANION">Companion — Warm & Present</option>
            <option value="COPILOT">Co-Pilot — Getting It Done</option>
            <option value="PEER">Peer — Collaborative & Equal</option>
            <option value="CONFIDANTE">Confidante — Real Talk</option>
            <option value="EXPERT">Expert — Deep Analysis</option>
            <option value="MENTOR">Mentor — Wise & Guiding</option>
            <option value="GUIDE">Guide — Navigational Clarity</option>
            <option value="FACILITATOR">Facilitator — Mediating & Inclusive</option>
            <option value="ADVOCATE">Advocate — Protective & Fierce</option>
            <option value="INNOVATOR">Innovator — Creative & Forward</option>
            <option value="NURTURER">Nurturer — Gentle & Patient</option>
          </select>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => updateSettings({ notifications: e.target.checked })}
            className="w-4 h-4 rounded border-peacock-300 text-peacock-600 focus:ring-peacock-500"
          />
          <span className="text-sm text-peacock-700">Enable notifications</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.voiceEnabled}
            onChange={(e) => updateSettings({ voiceEnabled: e.target.checked })}
            className="w-4 h-4 rounded border-peacock-300 text-peacock-600 focus:ring-peacock-500"
          />
          <span className="text-sm text-peacock-700">Voice input</span>
        </label>
      </div>
    </div>
  );
}

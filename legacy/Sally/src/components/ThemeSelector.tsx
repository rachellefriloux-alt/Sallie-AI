// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

const THEMES = [
  { id: 'dark', name: 'Dark', description: 'Deep slate and violet', preview: 'bg-slate-900' },
  { id: 'light', name: 'Light', description: 'Clean and minimal', preview: 'bg-slate-50' },
  { id: 'auto', name: 'System', description: 'Follow system preference', preview: 'bg-gradient-to-r from-slate-900 to-slate-50' },
];

const PRESETS = [
  { id: 'heritage', name: 'Heritage', description: 'Peacock & Leopard', preview: 'bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900' },
  { id: 'sallie-pro', name: 'Sallie Pro', description: 'Glowing, holographic', preview: 'bg-gradient-to-br from-indigo-950 via-purple-900/50 to-slate-950' },
];

const COLORS = [
  { id: 'violet', name: 'Violet', hex: '#8b5cf6' },
  { id: 'peacock', name: 'Peacock', hex: '#0d9488' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
  { id: 'indigo', name: 'Indigo', hex: '#6366f1' },
];

interface ThemeSelectorProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeSelector({ open, onClose }: ThemeSelectorProps) {
  const { settings, updateSettings } = useSettingsStore();
  const [selectedTheme, setSelectedTheme] = useState(settings.theme);
  const [selectedColor, setSelectedColor] = useState(settings.color);
  const [selectedPreset, setSelectedPreset] = useState(settings.preset ?? 'heritage');

  if (!open) return null;

  const handleApply = () => {
    updateSettings({ theme: selectedTheme, color: selectedColor, preset: selectedPreset });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-violet-500/30 p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Theme & Appearance</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Visual Preset</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p.id as 'heritage' | 'sallie-pro')}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${
                    selectedPreset === p.id ? 'border-violet-500 bg-violet-500/20' : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className={`h-8 rounded-lg mb-2 ${p.preview}`} />
                  <div className="text-sm font-medium text-white">{p.name}</div>
                  <div className="text-xs text-gray-400">{p.description}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id as 'dark' | 'light' | 'auto')}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${
                    selectedTheme === theme.id
                      ? 'border-violet-500 bg-violet-500/20'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <div className={`h-8 rounded-lg mb-2 ${theme.preview}`} />
                  <div className="text-sm font-medium text-white">{theme.name}</div>
                  <div className="text-xs text-gray-400">{theme.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColor === color.id ? 'border-white scale-110' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

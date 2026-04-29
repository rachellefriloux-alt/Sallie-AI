'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export function ThemePresetSync() {
  const style = useSettingsStore((s) => s.settings.style);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('preset-heritage', 'preset-sallie-pro', 'preset-modern');
    html.classList.add(`preset-${style || 'modern'}`);
  }, [style]);

  return null;
}

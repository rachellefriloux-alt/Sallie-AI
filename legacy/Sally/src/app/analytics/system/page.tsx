'use client';

import React, { useState, useEffect } from 'react';

export default function AnalyticsSystemPage() {
  const [health, setHealth] = useState<{
    ollama: boolean;
    supabase: boolean;
    api: boolean;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const ollamaUrl = (typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434')) || '';
        let ollama = false;
        if (ollamaUrl) {
          try {
            const r = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/tags`, { signal: AbortSignal.timeout(2000) });
            ollama = r.ok;
          } catch {
            ollama = false;
          }
        }
        const apiRes = await fetch('/api/health');
        const api = apiRes.ok;
        const data = apiRes.ok ? await apiRes.json() : null;
        const supabase = data?.services?.supabase === 'healthy';
        setHealth({
          ollama,
          supabase,
          api,
        });
      } catch {
        setHealth({ ollama: false, supabase: false, api: false });
      }
    })();
  }, []);

  if (!health) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" aria-hidden />
      </div>
    );
  }

  const items = [
    { name: 'API', status: health.api },
    { name: 'Ollama', status: health.ollama },
    { name: 'Database', status: health.supabase },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-white">System</h2>
      <div className="rounded-xl border border-violet-500/20 bg-black/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Service status</h3>
        <ul className="space-y-3">
          {items.map(({ name, status }) => (
            <li key={name} className="flex items-center justify-between">
              <span className="text-gray-300">{name}</span>
              <span
                className={`inline-flex items-center gap-2 px-2 py-1 rounded text-sm font-medium ${
                  status ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
                {status ? 'Healthy' : 'Unavailable'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

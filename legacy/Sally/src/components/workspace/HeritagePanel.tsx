'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function HeritagePanel() {
  const [heritage, setHeritage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<'identity' | 'values' | 'goals' | 'fears' | 'communication' | 'learning'>('identity');
  const supabase = createClient();

  useEffect(() => {
    loadHeritage();
  }, []);

  const loadHeritage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHeritage(null);
        return;
      }
      const { data } = await supabase
        .from('heritage_dna')
        .select('answers, completed_at')
        .eq('user_id', user.id)
        .single();
      setHeritage(data?.answers as Record<string, unknown> ?? null);
    } catch {
      setHeritage(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-peacock-600" />
      </div>
    );
  }

  const sections = ['identity', 'values', 'goals', 'fears', 'communication', 'learning'] as const;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-peacock-900 mb-4">Heritage DNA</h2>
      {heritage ? (
        <div className="flex gap-4">
          <nav className="flex flex-col gap-1 w-48">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSection(s)}
                className={`text-left px-3 py-2 rounded-lg capitalize text-sm font-medium transition-colors ${
                  selectedSection === s
                    ? 'bg-peacock-100 text-peacock-800'
                    : 'text-peacock-600 hover:bg-peacock-50'
                }`}
              >
                {s}
              </button>
            ))}
          </nav>
          <div className="flex-1 bg-white/80 rounded-xl border border-peacock-200 p-4 max-h-[400px] overflow-auto">
            <h3 className="text-sm font-semibold text-peacock-800 mb-2 capitalize">{selectedSection}</h3>
            <div className="space-y-2 text-sm text-peacock-700">
              {Object.entries(heritage)
                .filter(([k]) => k.startsWith(selectedSection))
                .map(([key, value]) => (
                  <div key={key} className="border-b border-peacock-100 pb-2 last:border-0">
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
              {Object.keys(heritage).filter((k) => k.startsWith(selectedSection)).length === 0 && (
                <p className="text-peacock-500 italic">No answers in this section yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-peacock-600 mb-4">Complete Genesis to build your Heritage DNA.</p>
          <a href="/convergence" className="text-peacock-600 underline font-medium hover:text-peacock-800">
            Go to Convergence
          </a>
        </div>
      )}
    </div>
  );
}

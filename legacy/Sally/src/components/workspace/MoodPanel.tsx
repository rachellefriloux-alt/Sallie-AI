'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import * as Progress from '@radix-ui/react-progress';

const MOOD_LABELS: Record<string, string> = {
  peaceful: 'Peaceful',
  happy: 'Happy',
  attentive: 'Attentive',
  thoughtful: 'Thoughtful',
  excited: 'Excited',
  tired: 'Tired',
  stressed: 'Stressed',
  curious: 'Curious',
};

export function MoodPanel() {
  const [limbic, setLimbic] = useState<{ trust?: number; warmth?: number; arousal?: number; valence?: number } | null>(null);
  const [mood, setMood] = useState<string>('peaceful');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadLimbic();
  }, []);

  const loadLimbic = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('limbic_trust, limbic_warmth, limbic_arousal, limbic_valence, emotional_state')
        .eq('id', user.id)
        .single();
      if (data) {
        setLimbic({
          trust: Number(data.limbic_trust ?? 0.8),
          warmth: Number(data.limbic_warmth ?? 0.7),
          arousal: Number(data.limbic_arousal ?? 0.5),
          valence: Number(data.limbic_valence ?? 0.7),
        });
        if (data.emotional_state) setMood(data.emotional_state);
      }
    } catch {
      setLimbic({ trust: 0.8, warmth: 0.7, arousal: 0.5, valence: 0.7 });
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

  const metrics = [
    { key: 'trust', label: 'Trust', value: limbic?.trust ?? 0.8, color: 'bg-emerald-500' },
    { key: 'warmth', label: 'Warmth', value: limbic?.warmth ?? 0.7, color: 'bg-rose-500' },
    { key: 'arousal', label: 'Arousal', value: limbic?.arousal ?? 0.5, color: 'bg-amber-500' },
    { key: 'valence', label: 'Valence', value: limbic?.valence ?? 0.7, color: 'bg-violet-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold text-peacock-900">Limbic Engine</h2>
      <div className="flex flex-wrap gap-4">
        {Object.entries(MOOD_LABELS).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setMood(value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              mood === value
                ? 'bg-peacock-600 text-white'
                : 'bg-peacock-100 text-peacock-700 hover:bg-peacock-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-peacock-800">{m.label}</span>
              <span className="text-peacock-600">{Math.round((m.value ?? 0) * 100)}%</span>
            </div>
            <Progress.Root value={(m.value ?? 0) * 100} className="h-2 w-full overflow-hidden rounded-full bg-peacock-200">
              <Progress.Indicator
                className={`h-full ${m.color} transition-all duration-500`}
                style={{ width: `${(m.value ?? 0) * 100}%` }}
              />
            </Progress.Root>
          </div>
        ))}
      </div>
    </div>
  );
}

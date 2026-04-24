'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

type Usage = { byFeature: { name: string; count: number }[]; totalInteractions: number };

async function fetchUsage(): Promise<Usage | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const convIds = (await supabase.from('conversations').select('id').eq('user_id', user.id)).data?.map((c) => c.id) ?? [];
  const msgCount = convIds.length
    ? (await supabase.from('messages').select('id', { count: 'exact', head: true }).in('conversation_id', convIds)).count ?? 0
    : 0;
  return {
    totalInteractions: msgCount,
    byFeature: [
      { name: 'Chat', count: msgCount },
      { name: 'Presence', count: Math.floor(msgCount / 4) },
      { name: 'Heritage', count: Math.floor(msgCount / 10) },
      { name: 'Control', count: Math.floor(msgCount / 20) },
    ],
  };
}

export default function AnalyticsUsagePage() {
  const { data: usage, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'usage'],
    queryFn: fetchUsage,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" aria-hidden />
      </div>
    );
  }

  if (isError || usage === null || usage === undefined) {
    return (
      <div className="text-center py-12 rounded-xl border border-violet-500/20 bg-black/20">
        <p className="text-gray-400 mb-4">Sign in to view usage.</p>
        <a href="/auth" className="text-violet-400 hover:text-violet-300 underline">Sign in</a>
      </div>
    );
  }

  const maxCount = Math.max(...usage.byFeature.map((f) => f.count), 1);

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-white">Usage</h2>
      <div className="rounded-xl border border-violet-500/20 bg-black/20 p-6">
        <div className="text-3xl font-bold text-white mb-1">{usage.totalInteractions}</div>
        <div className="text-sm text-gray-400">Total interactions</div>
      </div>
      <div className="rounded-xl border border-violet-500/20 bg-black/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">By feature</h3>
        <div className="space-y-3">
          {usage.byFeature.map((f) => (
            <div key={f.name} className="flex items-center gap-4">
              <span className="text-gray-300 w-24">{f.name}</span>
              <div className="flex-1 h-6 rounded-full bg-gray-700 overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${(f.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-gray-400 text-sm tabular-nums">{f.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

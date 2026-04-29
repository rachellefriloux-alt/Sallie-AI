'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import * as Progress from '@radix-ui/react-progress';

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  streakDays: number;
  convergenceCompleted: boolean;
  limbicHealth: number;
  lastActive: string | null;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData(null);
        return;
      }

      const convRes = await supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const convIds = (await supabase.from('conversations').select('id').eq('user_id', user.id)).data?.map(c => c.id) ?? [];
      const msgRes = convIds.length > 0
        ? await supabase.from('messages').select('id', { count: 'exact', head: true }).in('conversation_id', convIds)
        : { count: 0 };
      const streakRes = await supabase.from('streak_history').select('streak_count').eq('user_id', user.id).order('date', { ascending: false }).limit(1).maybeSingle();
      const profileRes = await supabase.from('profiles').select('convergence_completed, limbic_trust, limbic_warmth, limbic_arousal, limbic_valence, updated_at').eq('id', user.id).single();

      const conversations = convRes.count ?? 0;
      const messages = msgRes.count ?? 0;
      const streak = streakRes.data?.streak_count ?? 0;
      const profile = profileRes.data;

      const trust = Number(profile?.limbic_trust ?? 0.5);
      const warmth = Number(profile?.limbic_warmth ?? 0.5);
      const arousal = Number(profile?.limbic_arousal ?? 0.5);
      const valence = Number(profile?.limbic_valence ?? 0.5);
      const limbicHealth = (trust + warmth + arousal + valence) / 4;

      setData({
        totalConversations: conversations,
        totalMessages: messages,
        streakDays: streak,
        convergenceCompleted: profile?.convergence_completed ?? false,
        limbicHealth,
        lastActive: profile?.updated_at ?? null,
      });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">Sign in to view analytics</p>
        <a href="/auth" className="text-violet-400 hover:text-violet-300 underline">Sign in</a>
      </div>
    );
  }

  const cards = [
    { label: 'Conversations', value: data.totalConversations, icon: '💬', color: 'violet' },
    { label: 'Messages', value: data.totalMessages, icon: '📝', color: 'purple' },
    { label: 'Streak (days)', value: data.streakDays, icon: '🔥', color: 'amber' },
    { label: 'Limbic Health', value: `${Math.round(data.limbicHealth * 100)}%`, icon: '🧠', color: 'emerald' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6"
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-sm text-gray-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-violet-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Genesis Status</h3>
        <div className="flex items-center gap-4">
          <Progress.Root value={data.convergenceCompleted ? 100 : 0} className="flex-1 h-3 overflow-hidden rounded-full bg-gray-700">
            <Progress.Indicator
              className="h-full bg-violet-500 transition-all"
              style={{ width: `${data.convergenceCompleted ? 100 : 0}%` }}
            />
          </Progress.Root>
          <span className="text-sm text-gray-300">
            {data.convergenceCompleted ? 'Completed' : 'Not started'}
          </span>
        </div>
      </div>

      {data.lastActive && (
        <div className="text-sm text-gray-400">
          Last active: {new Date(data.lastActive).toLocaleString()}
        </div>
      )}
    </div>
  );
}

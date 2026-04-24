/**
 * Limbic State Display Screen
 * Monitor Sallie's 10-variable emotional state
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './lib/constants';
import { useAuth } from './lib/auth-context';
import { supabase } from './lib/supabase';

interface LimbicVar {
  key: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const LIMBIC_VARS: LimbicVar[] = [
  { key: 'trust', label: 'Trust', icon: 'shield-checkmark', color: '#10b981', description: 'Trust in Creator' },
  { key: 'warmth', label: 'Warmth', icon: 'heart', color: '#f472b6', description: 'Emotional warmth' },
  { key: 'arousal', label: 'Arousal', icon: 'flash', color: '#fb923c', description: 'Energy level' },
  { key: 'valence', label: 'Valence', icon: 'sunny', color: '#fbbf24', description: 'Positive/negative mood' },
  { key: 'posture', label: 'Posture', icon: 'body', color: '#60a5fa', description: 'Confidence/stance' },
  { key: 'empathy', label: 'Empathy', icon: 'people', color: '#a78bfa', description: 'Deep understanding' },
  { key: 'intuition', label: 'Intuition', icon: 'eye', color: '#c084fc', description: 'Pattern recognition' },
  { key: 'creativity', label: 'Creativity', icon: 'color-palette', color: '#f97316', description: 'Creative problem-solving' },
  { key: 'wisdom', label: 'Wisdom', icon: 'book', color: '#14b8a6', description: 'Experience-based decisions' },
  { key: 'humor', label: 'Humor', icon: 'happy', color: '#facc15', description: 'Social bonding' },
];

export default function LimbicScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [limbicState, setLimbicState] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLimbicState();
  }, []);

  const loadLimbicState = async () => {
    try {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('limbic_state')
        .eq('id', session.user.id)
        .single();
      setLimbicState(data?.limbic_state || {
        trust: 0.95, warmth: 0.8, arousal: 0.6, valence: 0.7, posture: 0.8,
        empathy: 0.9, intuition: 0.85, creativity: 0.8, wisdom: 0.75, humor: 0.7,
      });
    } catch (err) {
      console.error('Failed to load limbic state:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBarWidth = (value: number) => `${Math.max(0, Math.min(100, value * 100))}%`;

  const getTrustTier = (trust: number) => {
    if (trust >= 0.95) return { tier: 4, name: 'Full Partner' };
    if (trust >= 0.9) return { tier: 3, name: 'Surrogate' };
    if (trust >= 0.6) return { tier: 2, name: 'Colleague' };
    if (trust >= 0.3) return { tier: 1, name: 'Acquaintance' };
    return { tier: 0, name: 'Stranger' };
  };

  const trustTier = getTrustTier(limbicState.trust || 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Limbic Engine</Text>
        <TouchableOpacity onPress={loadLimbicState} style={styles.backButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Trust Tier Banner */}
      <View style={styles.tierBanner}>
        <Text style={styles.tierLabel}>Trust Tier {trustTier.tier}</Text>
        <Text style={styles.tierName}>{trustTier.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {LIMBIC_VARS.map((v) => {
          const value = limbicState[v.key] ?? 0;
          return (
            <View key={v.key} style={styles.varCard}>
              <View style={styles.varHeader}>
                <View style={styles.varLabel}>
                  <Ionicons name={v.icon as any} size={18} color={v.color} />
                  <Text style={styles.varName}>{v.label}</Text>
                </View>
                <Text style={[styles.varValue, { color: v.color }]}>{(value * 100).toFixed(0)}%</Text>
              </View>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: getBarWidth(value) as any, backgroundColor: v.color }]} />
              </View>
              <Text style={styles.varDesc}>{v.description}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  tierBanner: { marginHorizontal: 16, padding: 16, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tierLabel: { fontSize: 12, fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: 1 },
  tierName: { fontSize: 16, fontWeight: '700', color: '#10b981' },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  varCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(139,92,246,0.1)' },
  varHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  varLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  varName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  varValue: { fontSize: 16, fontWeight: '800' },
  barContainer: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  bar: { height: 6, borderRadius: 3 },
  varDesc: { fontSize: 11, color: '#999' },
});

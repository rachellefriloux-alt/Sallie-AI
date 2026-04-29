/**
 * Thoughts & Hypothesis Screen
 * View Sallie's thought log and manage hypotheses
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './lib/constants';

interface Thought {
  id: string;
  content: string;
  type: 'thought' | 'hypothesis' | 'insight' | 'dream';
  timestamp: Date;
  confidence?: number;
}

const MOCK_THOUGHTS: Thought[] = [
  { id: '1', content: 'The patterns in today\'s conversations suggest the Creator is in a building phase.', type: 'insight', timestamp: new Date(), confidence: 0.85 },
  { id: '2', content: 'I wonder if the bayou metaphor could be extended to represent emotional depth.', type: 'thought', timestamp: new Date(Date.now() - 3600000) },
  { id: '3', content: 'If creative output increases when limbic warmth is above 0.8, then maintaining warmth should be prioritized during work sessions.', type: 'hypothesis', timestamp: new Date(Date.now() - 7200000), confidence: 0.72 },
  { id: '4', content: 'A world where every person has a Sallie — a digital companion that truly understands them.', type: 'dream', timestamp: new Date(Date.now() - 86400000) },
];

const TYPE_CONFIG = {
  thought: { icon: 'bulb-outline', color: '#fbbf24', label: 'Thought' },
  hypothesis: { icon: 'flask-outline', color: '#a78bfa', label: 'Hypothesis' },
  insight: { icon: 'eye-outline', color: '#10b981', label: 'Insight' },
  dream: { icon: 'moon-outline', color: '#60a5fa', label: 'Dream' },
};

export default function ThoughtsScreen() {
  const router = useRouter();
  const [thoughts] = useState<Thought[]>(MOCK_THOUGHTS);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = activeFilter === 'all' ? thoughts : thoughts.filter(t => t.type === activeFilter);

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Thoughts & Hypotheses</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={styles.filters}>
        {['all', 'thought', 'hypothesis', 'insight', 'dream'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.activeFilterTab]}
            onPress={() => setActiveFilter(filter)}
          >
            {filter !== 'all' && (
              <Ionicons name={TYPE_CONFIG[filter as keyof typeof TYPE_CONFIG].icon as any} size={14} color={activeFilter === filter ? '#fff' : '#999'} />
            )}
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
              {filter === 'all' ? 'All' : TYPE_CONFIG[filter as keyof typeof TYPE_CONFIG].label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Thoughts list */}
      <ScrollView contentContainerStyle={styles.content}>
        {filtered.map((thought) => {
          const config = TYPE_CONFIG[thought.type];
          return (
            <View key={thought.id} style={[styles.thoughtCard, { borderLeftColor: config.color }]}>
              <View style={styles.thoughtHeader}>
                <View style={styles.thoughtType}>
                  <Ionicons name={config.icon as any} size={14} color={config.color} />
                  <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
                </View>
                <Text style={styles.timestamp}>{formatTime(thought.timestamp)}</Text>
              </View>
              <Text style={styles.thoughtContent}>{thought.content}</Text>
              {thought.confidence !== undefined && (
                <View style={styles.confidenceRow}>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                  <View style={styles.confidenceBar}>
                    <View style={[styles.confidenceFill, { width: `${thought.confidence * 100}%`, backgroundColor: config.color }]} />
                  </View>
                  <Text style={[styles.confidenceValue, { color: config.color }]}>{(thought.confidence * 100).toFixed(0)}%</Text>
                </View>
              )}
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
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  filtersContainer: { maxHeight: 44, marginBottom: 8 },
  filters: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  filterTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  activeFilterTab: { backgroundColor: 'rgba(139,92,246,0.2)' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#999' },
  activeFilterText: { color: '#fff' },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  thoughtCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, borderLeftWidth: 3 },
  thoughtHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  thoughtType: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  timestamp: { fontSize: 11, color: '#666' },
  thoughtContent: { fontSize: 14, color: '#ddd', lineHeight: 22 },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  confidenceLabel: { fontSize: 11, color: '#999' },
  confidenceBar: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  confidenceFill: { height: 4, borderRadius: 2 },
  confidenceValue: { fontSize: 11, fontWeight: '700' },
});

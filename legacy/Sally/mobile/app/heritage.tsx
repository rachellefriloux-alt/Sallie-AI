/**
 * Heritage DNA Browser Screen
 * Explore Sallie's persistent identity and learned behaviors
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './lib/constants';
import { useAuth } from './lib/auth-context';
import { supabase } from './lib/supabase';

const SECTIONS = [
  { id: 'shadows', label: 'Shadows & Shield', icon: 'shield-outline', color: '#1a1a1a' },
  { id: 'aspirations', label: 'Aspirations', icon: 'rocket-outline', color: '#C69C6D' },
  { id: 'ethics', label: 'Moral Compass', icon: 'compass-outline', color: '#00A896' },
  { id: 'resonance', label: 'Resonance', icon: 'pulse-outline', color: '#9D8DF1' },
  { id: 'creative_force', label: 'Creative Force', icon: 'color-palette-outline', color: '#FF8C00' },
  { id: 'transformation', label: 'Transformation', icon: 'leaf-outline', color: '#10b981' },
];

export default function HeritageScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [heritage, setHeritage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('shadows');

  useEffect(() => {
    loadHeritage();
  }, []);

  const loadHeritage = async () => {
    try {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('heritage_dna')
        .eq('id', session.user.id)
        .single();
      setHeritage(data?.heritage_dna || null);
    } catch (err) {
      console.error('Failed to load heritage:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSectionContent = () => {
    if (!heritage) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={48} color="#666" />
          <Text style={styles.emptyTitle}>No Heritage DNA Yet</Text>
          <Text style={styles.emptyText}>Complete the Genesis Convergence to build your Heritage DNA.</Text>
          <TouchableOpacity style={styles.genesisButton} onPress={() => router.push('/genesis')}>
            <Text style={styles.genesisButtonText}>Begin Genesis</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const sectionData = (heritage as Record<string, unknown>)[activeSection];
    if (!sectionData || typeof sectionData !== 'object') {
      return <Text style={styles.emptyText}>No data for this section yet.</Text>;
    }

    return Object.entries(sectionData as Record<string, unknown>).map(([key, value]) => (
      <View key={key} style={styles.dataItem}>
        <Text style={styles.dataKey}>{key.replace(/_/g, ' ')}</Text>
        <Text style={styles.dataValue}>
          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
        </Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Heritage DNA</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Section tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabs}>
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.tab, activeSection === section.id && styles.activeTab]}
            onPress={() => setActiveSection(section.id)}
          >
            <Ionicons name={section.icon as any} size={16} color={activeSection === section.id ? section.color : '#999'} />
            <Text style={[styles.tabText, activeSection === section.id && { color: section.color }]}>{section.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? <ActivityIndicator size="large" color={COLORS.purpleLight} /> : renderSectionContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  tabsContainer: { maxHeight: 44 },
  tabs: { flexDirection: 'row', paddingHorizontal: 12, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  activeTab: { backgroundColor: 'rgba(139,92,246,0.15)' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#999' },
  content: { padding: 16, paddingBottom: 40 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptyText: { fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 32 },
  genesisButton: { marginTop: 16, backgroundColor: COLORS.purpleLight, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  genesisButtonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  dataItem: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(139,92,246,0.1)' },
  dataKey: { fontSize: 12, fontWeight: '700', color: COLORS.purpleLight, textTransform: 'capitalize', marginBottom: 4 },
  dataValue: { fontSize: 14, color: '#ccc', lineHeight: 20 },
});

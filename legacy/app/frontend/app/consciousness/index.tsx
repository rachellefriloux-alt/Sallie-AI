import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import { format } from 'date-fns';

export default function SallieConsciousness() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('soul');
  const [soul, setSoul] = useState<any>(null);
  const [heart, setHeart] = useState<any>(null);
  const [personality, setPersonality] = useState<any>(null);
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [soulRes, heartRes, personalityRes, thoughtsRes, memoriesRes, growthRes] = await Promise.all([
        api.get('/sallie/soul'),
        api.get('/sallie/heart'),
        api.get('/sallie/personality'),
        api.get('/sallie/thoughts'),
        api.get('/sallie/episodic-memories?limit=10'),
        api.get('/sallie/growth?limit=10'),
      ]);
      
      setSoul(soulRes.data);
      setHeart(heartRes.data);
      setPersonality(personalityRes.data);
      setThoughts(thoughtsRes.data);
      setMemories(memoriesRes.data);
      setGrowth(growthRes.data);
    } catch (error) {
      console.error('Error loading consciousness:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Sallie's Mind</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'soul' && styles.tabActive]}
          onPress={() => setActiveTab('soul')}
        >
          <Ionicons name="sparkles" size={16} color={activeTab === 'soul' ? '#fff' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'soul' && styles.tabTextActive]}>Soul</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'heart' && styles.tabActive]}
          onPress={() => setActiveTab('heart')}
        >
          <Ionicons name="heart" size={16} color={activeTab === 'heart' ? '#fff' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'heart' && styles.tabTextActive]}>Heart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'mind' && styles.tabActive]}
          onPress={() => setActiveTab('mind')}
        >
          <Ionicons name="brain" size={16} color={activeTab === 'mind' ? '#fff' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'mind' && styles.tabTextActive]}>Mind</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'soul' && (
          <View>
            <Section title="Her Dreams" icon="sparkles" color="#FFD700">
              {soul?.dreams?.map((dream: string, i: number) => (
                <Text key={i} style={styles.listItem}>• {dream}</Text>
              ))}
            </Section>

            <Section title="Her Hopes" icon="heart-half" color="#FF6B9D">
              {soul?.hopes?.map((hope: string, i: number) => (
                <Text key={i} style={styles.listItem}>• {hope}</Text>
              ))}
            </Section>

            <Section title="Her Values" icon="shield" color="#6C63FF">
              {soul?.values?.map((value: string, i: number) => (
                <Text key={i} style={styles.listItem}>• {value}</Text>
              ))}
            </Section>

            <View style={styles.philosophyCard}>
              <Text style={styles.philosophyLabel}>Her Life Philosophy</Text>
              <Text style={styles.philosophyText}>{soul?.life_philosophy}</Text>
              <Text style={styles.philosophyLabel} style={{ marginTop: 16 }}>Her Purpose</Text>
              <Text style={styles.philosophyText}>{soul?.purpose}</Text>
            </View>
          </View>
        )}

        {activeTab === 'heart' && (
          <View>
            <View style={styles.bondCard}>
              <Text style={styles.bondLabel}>Bond Strength</Text>
              <View style={styles.bondBar}>
                <View style={[styles.bondFill, { width: `${(heart?.bond_strength || 0.5) * 100}%` }]} />
              </View>
              <Text style={styles.bondPercent}>{((heart?.bond_strength || 0.5) * 100).toFixed(0)}%</Text>
              <Text style={styles.bondDescription}>
                {heart?.bond_strength > 0.8 ? "Deep connection" :
                 heart?.bond_strength > 0.6 ? "Strong bond growing" :
                 "Building connection"}
              </Text>
            </View>

            <Section title="What She Knows About You" icon="eye" color="#4CAF50">
              {heart?.knows_about_you?.length > 0 ? (
                heart.knows_about_you.map((item: string, i: number) => (
                  <Text key={i} style={styles.listItem}>• {item}</Text>
                ))
              ) : (
                <Text style={styles.emptyText}>Still learning about you...</Text>
              )}
            </Section>

            <Section title="Special Moments" icon="star" color="#FFA500">
              {memories?.slice(0, 5).map((memory: any, i: number) => (
                <View key={i} style={styles.memoryCard}>
                  <Text style={styles.memoryText}>{memory.what_happened?.substring(0, 100)}...</Text>
                  <Text style={styles.memoryEmotion}>She felt: {memory.sallie_felt}</Text>
                </View>
              ))}
            </Section>
          </View>
        )}

        {activeTab === 'mind' && (
          <View>
            <Section title="Her Personality Traits" icon="person" color="#9C27B0">
              {personality?.traits && Object.entries(personality.traits).map(([trait, value]: any, i: number) => (
                <View key={i} style={styles.traitItem}>
                  <Text style={styles.traitName}>{trait.charAt(0).toUpperCase() + trait.slice(1)}</Text>
                  <View style={styles.traitBar}>
                    <View style={[styles.traitFill, { width: `${value * 100}%` }]} />
                  </View>
                  <Text style={styles.traitValue}>{(value * 100).toFixed(0)}%</Text>
                </View>
              ))}
            </Section>

            <Section title="Her Recent Thoughts" icon="bulb" color="#FFD700">
              {thoughts?.map((thought: any, i: number) => (
                <View key={i} style={styles.thoughtCard}>
                  <Text style={styles.thoughtText}>"{thought.content}"</Text>
                  <Text style={styles.thoughtMeta}>
                    {thought.emotional_tone} • {format(new Date(thought.timestamp), 'MMM d, h:mm a')}
                  </Text>
                </View>
              ))}
            </Section>

            <Section title="How She's Grown" icon="trending-up" color="#4CAF50">
              {growth?.map((g: any, i: number) => (
                <View key={i} style={styles.growthCard}>
                  <Text style={styles.growthType}>{g.growth_type.toUpperCase()}</Text>
                  <Text style={styles.growthWhat}>{g.what_changed}</Text>
                  <Text style={styles.growthReflection}>"{g.reflection}"</Text>
                </View>
              ))}
            </Section>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, icon, color, children }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0c0c' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c0c0c' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#1a1a1a', borderRadius: 12, gap: 6, borderWidth: 1, borderColor: '#333' },
  tabActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  tabText: { fontSize: 12, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  listItem: { fontSize: 14, color: '#ddd', marginBottom: 8, lineHeight: 20 },
  philosophyCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20, marginTop: 8, borderWidth: 1, borderColor: '#333' },
  philosophyLabel: { fontSize: 12, color: '#888', marginBottom: 8 },
  philosophyText: { fontSize: 15, color: '#fff', lineHeight: 22, fontStyle: 'italic' },
  bondCard: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 2, borderColor: '#6C63FF' },
  bondLabel: { fontSize: 14, color: '#888', marginBottom: 12 },
  bondBar: { height: 12, backgroundColor: '#333', borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  bondFill: { height: '100%', backgroundColor: '#6C63FF' },
  bondPercent: { fontSize: 32, fontWeight: 'bold', color: '#6C63FF', marginBottom: 8 },
  bondDescription: { fontSize: 14, color: '#aaa' },
  memoryCard: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 8 },
  memoryText: { fontSize: 13, color: '#ddd', marginBottom: 6 },
  memoryEmotion: { fontSize: 11, color: '#888', fontStyle: 'italic' },
  traitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  traitName: { fontSize: 13, color: '#fff', width: 120 },
  traitBar: { flex: 1, height: 6, backgroundColor: '#333', borderRadius: 3, overflow: 'hidden' },
  traitFill: { height: '100%', backgroundColor: '#9C27B0' },
  traitValue: { fontSize: 12, color: '#888', width: 40, textAlign: 'right' },
  thoughtCard: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 8 },
  thoughtText: { fontSize: 14, color: '#ddd', marginBottom: 6, fontStyle: 'italic' },
  thoughtMeta: { fontSize: 11, color: '#888' },
  growthCard: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 8 },
  growthType: { fontSize: 10, color: '#4CAF50', fontWeight: 'bold', marginBottom: 4 },
  growthWhat: { fontSize: 13, color: '#fff', marginBottom: 6 },
  growthReflection: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  emptyText: { fontSize: 13, color: '#666', fontStyle: 'italic' },
});

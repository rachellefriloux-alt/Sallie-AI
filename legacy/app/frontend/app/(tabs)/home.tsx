import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
}

interface Stats {
  messages: number;
  memories: number;
  projects: number;
  integrations: number;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [limbic, setLimbic] = useState<LimbicState | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [limbicRes, statsRes] = await Promise.all([
        api.get('/limbic'),
        api.get('/stats'),
      ]);
      setLimbic(limbicRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name}</Text>
            <Text style={styles.subtitle}>Ready to connect with Sallie?</Text>
          </View>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v5.4.2</Text>
          </View>
        </View>

        {/* Limbic State Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="heart" size={24} color="#6C63FF" />
            <Text style={styles.cardTitle}>Limbic Engine</Text>
          </View>
          <Text style={styles.postureText}>Current Posture: {limbic?.posture || 'Friend'}</Text>
          <View style={styles.limbicGrid}>
            <LimbicStat label="Trust" value={limbic?.trust || 50} color="#4CAF50" />
            <LimbicStat label="Warmth" value={limbic?.warmth || 50} color="#FF9800" />
            <LimbicStat label="Arousal" value={limbic?.arousal || 50} color="#2196F3" />
            <LimbicStat label="Valence" value={limbic?.valence || 50} color="#9C27B0" />
          </View>
        </View>

        {/* Life Roles */}
        <Text style={styles.sectionTitle}>Your Life Roles</Text>
        <View style={styles.rolesGrid}>
          <RoleCard
            icon="heart"
            title="Mom"
            color="#FF6B9D"
            onPress={() => router.push('/dashboards/mom')}
          />
          <RoleCard
            icon="briefcase"
            title="Business"
            color="#FFA500"
            onPress={() => router.push('/dashboards/business')}
          />
          <RoleCard
            icon="people"
            title="Friend"
            color="#4CAF50"
            onPress={() => router.push('/dashboards/friend')}
          />
          <RoleCard
            icon="home"
            title="Daughter"
            color="#9C27B0"
            onPress={() => router.push('/dashboards/daughter')}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon="sunny"
            title="Daily Brief"
            subtitle="Start your day"
            onPress={() => router.push('/daily-brief')}
          />
          <ActionCard
            icon="git-branch"
            title="Decider"
            subtitle="Make choices"
            onPress={() => router.push('/decider')}
          />
          <ActionCard
            icon="book"
            title="Reflect"
            subtitle="End your day"
            onPress={() => router.push('/reflection')}
          />
          <ActionCard
            icon="notifications"
            title="Shoulder Taps"
            subtitle="Check updates"
            onPress={() => router.push('/shoulder-taps')}
          />
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart" size={24} color="#6C63FF" />
            <Text style={styles.cardTitle}>Your Journey</Text>
          </View>
          <View style={styles.statsGrid}>
            <StatItem icon="chatbubbles-outline" label="Messages" value={stats?.messages || 0} />
            <StatItem icon="albums-outline" label="Memories" value={stats?.memories || 0} />
            <StatItem icon="briefcase-outline" label="Projects" value={stats?.projects || 0} />
            <StatItem icon="link-outline" label="Integrations" value={stats?.integrations || 0} />
          </View>
        </View>

        {/* System Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#6C63FF" />
            <Text style={styles.cardTitle}>System Status</Text>
          </View>
          <SystemStatus label="Limbic Engine" status="active" />
          <SystemStatus label="Memory System" status="active" />
          <SystemStatus label="Chat Interface" status="active" />
          <SystemStatus label="Tool Network" status="active" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LimbicStat({ label, value, color }: any) {
  return (
    <View style={styles.limbicStat}>
      <View style={styles.limbicStatHeader}>
        <Text style={styles.limbicStatLabel}>{label}</Text>
        <Text style={styles.limbicStatValue}>{Math.round(value)}%</Text>
      </View>
      <View style={styles.limbicBar}>
        <View style={[styles.limbicBarFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function RoleCard({ icon, title, color, onPress }: any) {
  return (
    <TouchableOpacity style={styles.roleCard} onPress={onPress}>
      <Ionicons name={icon} size={28} color={color} />
      <Text style={styles.roleTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function ActionCard({ icon, title, subtitle, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Ionicons name={icon} size={32} color="#6C63FF" />
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function StatItem({ icon, label, value }: any) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={20} color="#6C63FF" />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function SystemStatus({ label, status }: any) {
  return (
    <View style={styles.systemStatus}>
      <View style={[styles.statusDot, status === 'active' && styles.statusDotActive]} />
      <Text style={styles.systemLabel}>{label}</Text>
      <Text style={[styles.systemStatusText, status === 'active' && styles.systemStatusActive]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c0c0c',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  versionBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  versionText: {
    color: '#6C63FF',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  postureText: {
    fontSize: 14,
    color: '#6C63FF',
    marginBottom: 16,
  },
  limbicGrid: {
    gap: 12,
  },
  limbicStat: {
    marginBottom: 8,
  },
  limbicStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  limbicStatLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  limbicStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  limbicBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  limbicBarFill: {
    height: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    width: '48%',
    aspectRatio: 1.2,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  systemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginRight: 12,
  },
  statusDotActive: {
    backgroundColor: '#4CAF50',
  },
  systemLabel: {
    flex: 1,
    fontSize: 14,
    color: '#aaa',
  },
  systemStatusText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  systemStatusActive: {
    color: '#4CAF50',
  },
});

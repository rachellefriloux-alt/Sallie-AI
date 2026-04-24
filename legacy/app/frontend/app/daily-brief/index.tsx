import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../utils/api';
import { format } from 'date-fns';

interface DailyBrief {
  priorities: string[];
  upcoming_events: any[];
  suggested_focus: string;
  encouragement: string;
  stress_check: string;
}

export default function DailyBrief() {
  const router = useRouter();
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBrief();
  }, []);

  const loadBrief = async () => {
    try {
      const response = await api.get('/daily-brief');
      setBrief(response.data);
    } catch (error) {
      console.error('Error loading brief:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBrief();
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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Daily Brief</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>

        {/* Encouragement Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="heart" size={24} color="#FF6B9D" />
            <Text style={styles.cardTitle}>Good Morning</Text>
          </View>
          <Text style={styles.cardText}>{brief?.encouragement}</Text>
        </View>

        {/* Top Priorities */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flag" size={24} color="#6C63FF" />
            <Text style={styles.cardTitle}>Top 3 Priorities Today</Text>
          </View>
          {brief?.priorities && brief.priorities.length > 0 ? (
            brief.priorities.slice(0, 3).map((priority, index) => (
              <View key={index} style={styles.priorityItem}>
                <View style={styles.priorityNumber}>
                  <Text style={styles.priorityNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.priorityText}>{priority}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No urgent priorities - take it easy today!</Text>
          )}
        </View>

        {/* Suggested Focus */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb" size={24} color="#FFA500" />
            <Text style={styles.cardTitle}>Suggested Focus</Text>
          </View>
          <Text style={styles.cardText}>{brief?.suggested_focus}</Text>
        </View>

        {/* Stress Check */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="fitness" size={24} color="#4CAF50" />
            <Text style={styles.cardTitle}>Wellness Check</Text>
          </View>
          <Text style={styles.cardText}>{brief?.stress_check}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/reflection')}
          >
            <Ionicons name="book-outline" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Reflect</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/decider')}
          >
            <Ionicons name="git-branch-outline" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Decide</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Talk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  cardText: {
    fontSize: 15,
    color: '#ddd',
    lineHeight: 22,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priorityText: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

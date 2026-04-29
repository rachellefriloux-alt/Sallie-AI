import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../utils/api';

export default function DaughterDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard/daughter');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading daughter dashboard:', error);
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
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Daughter</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.insightCard}>
          <Ionicons name="heart" size={20} color="#9C27B0" />
          <Text style={styles.insightText}>{dashboard?.insights}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Tasks</Text>
          {dashboard?.tasks && dashboard.tasks.length > 0 ? (
            dashboard.tasks.map((task: any, index: number) => (
              <View key={index} style={styles.taskCard}>
                <Ionicons name="ellipse-outline" size={20} color="#9C27B0" style={{ marginRight: 12 }} />
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No family tasks right now</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          {dashboard?.family && dashboard.family.length > 0 ? (
            dashboard.family.map((member: any, index: number) => (
              <View key={index} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitial}>{member.name[0]}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {member.last_contact && (
                    <Text style={styles.memberDetail}>Last contact: {new Date(member.last_contact).toLocaleDateString()}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Add family members to track</Text>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call" size={20} color="#9C27B0" />
            <Text style={styles.actionText}>Call Parent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar" size={20} color="#9C27B0" />
            <Text style={styles.actionText}>Family Events</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0c0c0c' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c0c0c' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  insightCard: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#9C27B0', gap: 12 },
  insightText: { flex: 1, fontSize: 14, color: '#9C27B0', lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 16 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#333' },
  taskTitle: { flex: 1, fontSize: 15, color: '#fff' },
  memberCard: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  memberAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#9C27B0', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberInitial: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  memberDetail: { fontSize: 14, color: '#888' },
  emptyText: { fontSize: 14, color: '#666', fontStyle: 'italic', textAlign: 'center', padding: 20 },
  quickActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#333' },
  actionText: { fontSize: 12, color: '#fff' },
});

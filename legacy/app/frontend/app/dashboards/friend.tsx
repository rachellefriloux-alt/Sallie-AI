import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../utils/api';

export default function FriendDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard/friend');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading friend dashboard:', error);
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
          <Text style={styles.title}>Friends</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.insightCard}>
          <Ionicons name="heart" size={20} color="#FF6B9D" />
          <Text style={styles.insightText}>{dashboard?.insights}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time to Reach Out</Text>
          {dashboard?.needs_contact && dashboard.needs_contact.length > 0 ? (
            dashboard.needs_contact.map((person: any, index: number) => (
              <View key={index} style={styles.contactCard}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>{person.name[0]}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{person.name}</Text>
                  <Text style={styles.contactDetail}>Haven't connected in a while</Text>
                </View>
                <TouchableOpacity style={styles.reachOutButton}>
                  <Ionicons name="chatbubbles" size={20} color="#6C63FF" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>You're staying in touch well!</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Relationships</Text>
          {dashboard?.relationships && dashboard.relationships.length > 0 ? (
            dashboard.relationships.slice(0, 10).map((person: any, index: number) => (
              <View key={index} style={styles.personCard}>
                <View style={styles.personAvatar}>
                  <Text style={styles.personInitial}>{person.name[0]}</Text>
                </View>
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{person.name}</Text>
                  <Text style={styles.personType}>{person.relationship_type}</Text>
                </View>
                <View style={styles.importanceStars}>
                  {[...Array(person.importance || 3)].map((_, i) => (
                    <Ionicons key={i} name="star" size={12} color="#FFD700" />
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Add relationships to track</Text>
          )}
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
  insightCard: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#FF6B9D', gap: 12 },
  insightText: { flex: 1, fontSize: 14, color: '#FF6B9D', lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginBottom: 16 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  contactAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6C63FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  contactInitial: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  contactDetail: { fontSize: 14, color: '#888' },
  reachOutButton: { padding: 8 },
  personCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#333' },
  personAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  personInitial: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  personInfo: { flex: 1 },
  personName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  personType: { fontSize: 12, color: '#888' },
  importanceStars: { flexDirection: 'row', gap: 2 },
  emptyText: { fontSize: 14, color: '#666', fontStyle: 'italic', textAlign: 'center', padding: 20 },
});

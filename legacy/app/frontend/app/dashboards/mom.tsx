import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../utils/api';

export default function MomDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddKid, setShowAddKid] = useState(false);
  const [newKidName, setNewKidName] = useState('');
  const [newKidAge, setNewKidAge] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.get('/dashboard/mom');
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading mom dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const addKid = async () => {
    if (!newKidName || !newKidAge) {
      Alert.alert('Missing Info', 'Please enter name and age');
      return;
    }

    try {
      await api.post('/kids', {
        name: newKidName,
        age: parseInt(newKidAge),
        school: '',
        activities: [],
      });
      setNewKidName('');
      setNewKidAge('');
      setShowAddKid(false);
      loadDashboard();
    } catch (error) {
      Alert.alert('Error', 'Failed to add child');
    }
  };

  const addTask = async () => {
    Alert.prompt(
      'Add Mom Task',
      'What needs to be done?',
      async (text) => {
        if (text) {
          try {
            await api.post('/tasks', {
              role: 'mom',
              title: text,
              description: '',
              priority: 'medium',
            });
            loadDashboard();
          } catch (error) {
            Alert.alert('Error', 'Failed to add task');
          }
        }
      }
    );
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
          <Text style={styles.title}>Mom</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Insights */}
        <View style={styles.insightCard}>
          <Ionicons name="heart" size={20} color="#FF6B9D" />
          <Text style={styles.insightText}>{dashboard?.insights}</Text>
        </View>

        {/* Kids Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Kids</Text>
            <TouchableOpacity onPress={() => setShowAddKid(!showAddKid)}>
              <Ionicons name="add-circle" size={24} color="#6C63FF" />
            </TouchableOpacity>
          </View>

          {showAddKid && (
            <View style={styles.addKidForm}>
              <TextInput
                style={styles.input}
                placeholder="Child's name"
                placeholderTextColor="#666"
                value={newKidName}
                onChangeText={setNewKidName}
              />
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#666"
                value={newKidAge}
                onChangeText={setNewKidAge}
                keyboardType="number-pad"
              />
              <TouchableOpacity style={styles.addButton} onPress={addKid}>
                <Text style={styles.addButtonText}>Add Child</Text>
              </TouchableOpacity>
            </View>
          )}

          {dashboard?.kids?.map((kid: any, index: number) => (
            <View key={index} style={styles.kidCard}>
              <View style={styles.kidAvatar}>
                <Text style={styles.kidInitial}>{kid.name[0]}</Text>
              </View>
              <View style={styles.kidInfo}>
                <Text style={styles.kidName}>{kid.name}</Text>
                <Text style={styles.kidDetails}>Age {kid.age}</Text>
                {kid.school && <Text style={styles.kidDetails}>{kid.school}</Text>}
              </View>
            </View>
          ))}

          {(!dashboard?.kids || dashboard.kids.length === 0) && !showAddKid && (
            <Text style={styles.emptyText}>Add your children to track their activities</Text>
          )}
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mom Tasks</Text>
            <TouchableOpacity onPress={addTask}>
              <Ionicons name="add-circle" size={24} color="#6C63FF" />
            </TouchableOpacity>
          </View>

          {dashboard?.tasks?.map((task: any, index: number) => (
            <View key={index} style={styles.taskCard}>
              <View style={styles.taskCheckbox}>
                <Ionicons name="ellipse-outline" size={20} color="#6C63FF" />
              </View>
              <Text style={styles.taskTitle}>{task.title}</Text>
            </View>
          ))}

          {(!dashboard?.tasks || dashboard.tasks.length === 0) && (
            <Text style={styles.emptyText}>No tasks - enjoy your day!</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar" size={20} color="#6C63FF" />
            <Text style={styles.actionText}>Meal Planner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="school" size={20} color="#6C63FF" />
            <Text style={styles.actionText}>School Calendar</Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FF6B9D',
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6B9D',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  addKidForm: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  input: {
    backgroundColor: '#0c0c0c',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  addButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  kidCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  kidAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  kidInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  kidInfo: {
    flex: 1,
  },
  kidName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  kidDetails: {
    fontSize: 14,
    color: '#888',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
  },
});

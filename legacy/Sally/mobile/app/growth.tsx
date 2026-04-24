/**
 * Mobile Growth Screen - Syncs with web Growth page via Supabase
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from './lib/constants';
import { useAuth } from './lib/auth-context';

// Types
interface Goal {
  id: string;
  title: string;
  sub: string;
  progress?: number;
  color?: string;
  streak?: number;
}

interface FocusTask {
  id: string;
  text: string;
  sub: string;
  done: boolean;
}

interface EnergyDay {
  day: string;
  val: number;
  current?: boolean;
}

const RESOURCES = [
  { type: 'article', title: '5-Min Guide to Delegating', sub: 'Learn to share the load effectively.' },
  { type: 'podcast', title: 'Balancing Work & Life', sub: 'Interview with productivity expert.' },
  { type: 'video', title: 'Negotiation Tactics 101', sub: 'Master the art of negotiation.' },
];

export default function GrowthScreen() {
  const router = useRouter();
  const { user, sessionToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);
  const [energyDays, setEnergyDays] = useState<EnergyDay[]>([]);
  const [journalEntry, setJournalEntry] = useState('');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [newTaskText, setNewTaskText] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim?.() ?? '';

  const fetchData = useCallback(async () => {
    if (!sessionToken || !apiUrl) {
      setIsLoading(false);
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      };

      // Fetch goals
      const goalsRes = await fetch(`${apiUrl}/api/growth/goals`, { headers });
      const goalsData = await goalsRes.json();
      if (goalsData.goals) setGoals(goalsData.goals);

      // Fetch tasks
      const tasksRes = await fetch(`${apiUrl}/api/growth/focus-tasks`, { headers });
      const tasksData = await tasksRes.json();
      if (tasksData.tasks) {
        setFocusTasks(tasksData.tasks);
        setCompletedTasks(new Set(tasksData.tasks.filter((t: FocusTask) => t.done).map((t: FocusTask) => t.id)));
      }

      // Fetch energy
      const energyRes = await fetch(`${apiUrl}/api/growth/energy`, { headers });
      const energyData = await energyRes.json();
      if (energyData.energy) setEnergyDays(energyData.energy);
    } catch (e) {
      console.log('Error fetching growth data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken, apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  const toggleTask = async (taskId: string) => {
    const isDone = completedTasks.has(taskId);
    const newCompleted = new Set(completedTasks);
    if (isDone) newCompleted.delete(taskId);
    else newCompleted.add(taskId);
    setCompletedTasks(newCompleted);

    if (!apiUrl || !sessionToken) return;

    try {
      await fetch(`${apiUrl}/api/growth/focus-tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ id: taskId, done: !isDone }),
      });
    } catch (e) {
      console.log('Error updating task:', e);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim() || !apiUrl || !sessionToken) return;

    try {
      const res = await fetch(`${apiUrl}/api/growth/focus-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ text: newTaskText, sub: 'Mobile task' }),
      });
      const data = await res.json();
      if (data.task) {
        setFocusTasks([...focusTasks, data.task]);
        setNewTaskText('');
        setShowAddTask(false);
      }
    } catch (e) {
      console.log('Error adding task:', e);
    }
  };

  const saveJournal = async () => {
    if (!journalEntry.trim() || !apiUrl || !sessionToken) return;

    try {
      const res = await fetch(`${apiUrl}/api/growth/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ content: journalEntry }),
      });
      if (res.ok) {
        setJournalEntry('');
        Alert.alert('Saved', 'Journal entry saved!');
      }
    } catch (e) {
      console.log('Error saving journal:', e);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
          <Text style={styles.loadingText}>Loading your growth data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Ionicons name="lock-closed" size={48} color={COLORS.textLight} />
          <Text style={styles.authTitle}>Sign In Required</Text>
          <Text style={styles.authText}>Sign in to track your growth journey</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primaryLight}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Growth</Text>
          <Text style={styles.headerSubtitle}>{greeting()}! Let&apos;s grow together.</Text>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goal Progress</Text>
          {goals.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No goals yet. Add your first goal!</Text>
            </View>
          ) : (
            goals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalIcon}>
                    <Ionicons name="flag" size={20} color={COLORS.primaryLight} />
                  </View>
                  <View style={styles.goalContent}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalSub}>{goal.sub}</Text>
                  </View>
                  {goal.progress !== undefined && (
                    <Text style={styles.goalProgress}>{goal.progress}%</Text>
                  )}
                </View>
                {goal.progress !== undefined && (
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${goal.progress}%` }]} />
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Focus Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Focus for Today</Text>
            <TouchableOpacity onPress={() => setShowAddTask(!showAddTask)}>
              <Ionicons name="add-circle" size={28} color={COLORS.primaryLight} />
            </TouchableOpacity>
          </View>

          {showAddTask && (
            <View style={styles.addTaskContainer}>
              <TextInput
                style={styles.addTaskInput}
                value={newTaskText}
                onChangeText={setNewTaskText}
                placeholder="Add a focus task..."
                placeholderTextColor={COLORS.textLight}
              />
              <TouchableOpacity style={styles.addTaskBtn} onPress={addTask}>
                <Ionicons name="add" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}

          {focusTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No focus tasks. Add one above!</Text>
            </View>
          ) : (
            focusTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => toggleTask(task.id)}
              >
                <View style={[styles.checkbox, completedTasks.has(task.id) && styles.checkboxChecked]}>
                  {completedTasks.has(task.id) && (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  )}
                </View>
                <View style={styles.taskContent}>
                  <Text style={[styles.taskText, completedTasks.has(task.id) && styles.taskTextDone]}>
                    {task.text}
                  </Text>
                  <Text style={styles.taskSub}>{task.sub}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Energy Levels Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy Levels</Text>
          <View style={styles.energyCard}>
            <View style={styles.energyBars}>
              {energyDays.length === 0 ? (
                <Text style={styles.emptyText}>Track your energy daily</Text>
              ) : (
                energyDays.map((day, i) => (
                  <View key={i} style={styles.energyBarContainer}>
                    <View style={styles.energyBarBg}>
                      <View
                        style={[
                          styles.energyBarFill,
                          { height: `${day.val}%` },
                          day.current && styles.energyBarCurrent,
                        ]}
                      />
                    </View>
                    <Text style={[styles.energyDayLabel, day.current && styles.energyDayLabelActive]}>
                      {day.day}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        {/* Journal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reflection</Text>
          <View style={styles.journalCard}>
            <TextInput
              style={styles.journalInput}
              value={journalEntry}
              onChangeText={setJournalEntry}
              placeholder="How are you feeling today?"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.journalBtn} onPress={saveJournal}>
              <Text style={styles.journalBtnText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Resources</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {RESOURCES.map((r, i) => (
              <View key={i} style={styles.resourceCard}>
                <View style={styles.resourceIcon}>
                  <Ionicons
                    name={r.type === 'article' ? 'document-text' : r.type === 'podcast' ? 'mic' : 'videocam'}
                    size={24}
                    color={COLORS.primaryLight}
                  />
                </View>
                <Text style={styles.resourceType}>{r.type.toUpperCase()}</Text>
                <Text style={styles.resourceTitle}>{r.title}</Text>
                <Text style={styles.resourceSub}>{r.sub}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.textLight,
    fontSize: 16,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.white,
  },
  authText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  signInBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  signInBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: 14,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  goalSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 3,
  },
  addTaskContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addTaskInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  addTaskBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.white,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  energyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  energyBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 100,
  },
  energyBarContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  energyBarBg: {
    width: '70%',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  energyBarFill: {
    width: '100%',
    backgroundColor: 'rgba(139,92,246,0.4)',
    borderRadius: 8,
  },
  energyBarCurrent: {
    backgroundColor: COLORS.primaryLight,
  },
  energyDayLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  energyDayLabelActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  journalCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  journalInput: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 14,
    color: COLORS.white,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  journalBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  journalBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
  resourceCard: {
    width: 160,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(139,92,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resourceType: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginBottom: 4,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  resourceSub: {
    fontSize: 11,
    color: COLORS.textLight,
  },
});
/**
 * Mobile Life Screen - Syncs with web Life-Management page via Supabase
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
interface LifeContext {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

interface LifeTask {
  id: string;
  text: string;
  tags: string[];
  done: boolean;
  waiting?: boolean;
  urgent?: string;
}

interface RecallItem {
  id: string;
  label: string;
  title: string;
  sub: string;
}

export default function LifeScreen() {
  const router = useRouter();
  const { user, sessionToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [contexts, setContexts] = useState<LifeContext[]>([]);
  const [tasks, setTasks] = useState<LifeTask[]>([]);
  const [recallItems, setRecallItems] = useState<RecallItem[]>([]);
  const [activeContext, setActiveContext] = useState<string>('command');
  const [newTaskText, setNewTaskText] = useState('');
  const [taskFilter, setTaskFilter] = useState<'focus' | 'all'>('focus');

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

      // Fetch contexts
      const contextsRes = await fetch(`${apiUrl}/api/life/contexts`, { headers });
      const contextsData = await contextsRes.json();
      if (contextsData.contexts) {
        setContexts(contextsData.contexts);
        const active = contextsData.contexts.find((c: LifeContext) => c.active);
        if (active) setActiveContext(active.id);
      }

      // Fetch tasks
      const tasksRes = await fetch(`${apiUrl}/api/life/tasks`, { headers });
      const tasksData = await tasksRes.json();
      if (tasksData.tasks) setTasks(tasksData.tasks);

      // Fetch recall
      const recallRes = await fetch(`${apiUrl}/api/life/recall`, { headers });
      const recallData = await recallRes.json();
      if (recallData.items) setRecallItems(recallData.items);
    } catch (e) {
      console.log('Error fetching life data:', e);
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
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    setTasks(newTasks);

    if (!apiUrl || !sessionToken) return;

    try {
      await fetch(`${apiUrl}/api/life/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ id: taskId, done: !task.done }),
      });
    } catch (e) {
      console.log('Error updating task:', e);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim() || !apiUrl || !sessionToken) return;

    try {
      const res = await fetch(`${apiUrl}/api/life/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ text: newTaskText, tags: [activeContext] }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks([...tasks, data.task]);
        setNewTaskText('');
      }
    } catch (e) {
      console.log('Error adding task:', e);
    }
  };

  const switchContext = async (contextId: string) => {
    if (!apiUrl || !sessionToken) return;

    try {
      await fetch(`${apiUrl}/api/life/contexts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ id: contextId, active: true }),
      });
      setContexts(contexts.map(c => ({ ...c, active: c.id === contextId })));
      setActiveContext(contextId);
    } catch (e) {
      console.log('Error switching context:', e);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredTasks = taskFilter === 'focus' 
    ? tasks.filter(t => !t.done && !t.waiting)
    : tasks;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
          <Text style={styles.loadingText}>Loading your life data...</Text>
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
          <Text style={styles.authText}>Sign in to manage your life</Text>
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
          <Text style={styles.headerTitle}>Life OS</Text>
          <Text style={styles.headerSubtitle}>{greeting()}!</Text>
        </View>

        {/* Contexts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contexts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {contexts.length === 0 ? (
              <Text style={styles.emptyText}>No contexts yet</Text>
            ) : (
              contexts.map((ctx) => (
                <TouchableOpacity
                  key={ctx.id}
                  style={[
                    styles.contextChip,
                    activeContext === ctx.id && styles.contextChipActive,
                  ]}
                  onPress={() => switchContext(ctx.id)}
                >
                  <Text style={styles.contextIcon}>
                    {ctx.id === 'command' ? '📊' : ctx.id === 'mom' ? '👶' : ctx.id === 'spouse' ? '❤️' : ctx.id === 'business' ? '💼' : '🧘'}
                  </Text>
                  <Text style={[
                    styles.contextLabel,
                    activeContext === ctx.id && styles.contextLabelActive,
                  ]}>
                    {ctx.label}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <View style={styles.filterToggle}>
              <TouchableOpacity
                style={[styles.filterBtn, taskFilter === 'focus' && styles.filterBtnActive]}
                onPress={() => setTaskFilter('focus')}
              >
                <Text style={[styles.filterBtnText, taskFilter === 'focus' && styles.filterBtnTextActive]}>
                  Focus
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterBtn, taskFilter === 'all' && styles.filterBtnActive]}
                onPress={() => setTaskFilter('all')}
              >
                <Text style={[styles.filterBtnText, taskFilter === 'all' && styles.filterBtnTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Task */}
          <View style={styles.addTaskRow}>
            <TextInput
              style={styles.addTaskInput}
              value={newTaskText}
              onChangeText={setNewTaskText}
              placeholder="Add a task..."
              placeholderTextColor={COLORS.textLight}
              onSubmitEditing={addTask}
            />
            <TouchableOpacity style={styles.addTaskBtn} onPress={addTask}>
              <Ionicons name="add" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {filteredTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No tasks. Add one above!</Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCard}
                onPress={() => toggleTask(task.id)}
              >
                <View style={[styles.checkbox, task.done && styles.checkboxChecked]}>
                  {task.done && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                </View>
                <View style={styles.taskContent}>
                  <Text style={[styles.taskText, task.done && styles.taskTextDone]}>
                    {task.text}
                  </Text>
                  <View style={styles.taskTags}>
                    {task.tags.map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                    {task.urgent && (
                      <View style={styles.urgentTag}>
                        <Text style={styles.urgentText}>⏱ {task.urgent}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Recall */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Recall</Text>
          {recallItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recall items saved yet</Text>
            </View>
          ) : (
            recallItems.map((item) => (
              <View key={item.id} style={styles.recallCard}>
                <View style={styles.recallHeader}>
                  <View style={styles.recallBadge}>
                    <Text style={styles.recallBadgeText}>{item.label}</Text>
                  </View>
                </View>
                <Text style={styles.recallTitle}>{item.title}</Text>
                {item.sub && <Text style={styles.recallSub}>{item.sub}</Text>}
              </View>
            ))
          )}
        </View>

        {/* Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="sparkles" size={20} color={COLORS.primaryLight} />
            <Text style={styles.insightTitle}>Sallie&apos;s Insight</Text>
          </View>
          <Text style={styles.insightText}>
            I noticed you have {tasks.filter(t => !t.done).length} tasks pending. Let me help you prioritize!
          </Text>
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
  emptyText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contextChipActive: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderColor: COLORS.primaryLight,
  },
  contextIcon: {
    fontSize: 18,
  },
  contextLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  contextLabelActive: {
    color: COLORS.white,
  },
  filterToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 4,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primaryLight,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  filterBtnTextActive: {
    color: COLORS.white,
  },
  addTaskRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
    marginBottom: 6,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  taskTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  urgentTag: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 10,
    color: '#ef4444',
  },
  recallCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  recallHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recallBadge: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  recallBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  recallTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  recallSub: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  insightCard: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.white,
    lineHeight: 20,
  },
});
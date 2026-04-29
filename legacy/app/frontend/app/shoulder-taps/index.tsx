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

interface ShoulderTap {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  action_required: boolean;
  read: boolean;
  created_at: string;
}

export default function ShoulderTaps() {
  const router = useRouter();
  const [taps, setTaps] = useState<ShoulderTap[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    loadTaps();
  }, [showUnreadOnly]);

  const loadTaps = async () => {
    try {
      const response = await api.get(`/shoulder-taps${showUnreadOnly ? '?unread_only=true' : ''}`);
      setTaps(response.data);
    } catch (error) {
      console.error('Error loading shoulder taps:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (tapId: string) => {
    try {
      await api.post('/shoulder-taps/mark-read', [tapId]);
      loadTaps();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = taps.filter(t => !t.read).map(t => t.id);
    if (unreadIds.length > 0) {
      try {
        await api.post('/shoulder-taps/mark-read', unreadIds);
        loadTaps();
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTaps();
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'reminder': return 'alarm';
      case 'suggestion': return 'bulb';
      case 'check_in': return 'heart';
      case 'alert': return 'warning';
      default: return 'notifications';
    }
  };

  const getColorForPriority = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF5252';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return '#6C63FF';
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
        <Text style={styles.title}>Shoulder Taps</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Ionicons name="checkmark-done" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !showUnreadOnly && styles.filterButtonActive]}
          onPress={() => setShowUnreadOnly(false)}
        >
          <Text style={[styles.filterText, !showUnreadOnly && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, showUnreadOnly && styles.filterButtonActive]}
          onPress={() => setShowUnreadOnly(true)}
        >
          <Text style={[styles.filterText, showUnreadOnly && styles.filterTextActive]}>Unread</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />}
      >
        {taps.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#333" />
            <Text style={styles.emptyText}>No notifications</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        ) : (
          taps.map((tap) => (
            <TouchableOpacity
              key={tap.id}
              style={[styles.tapCard, !tap.read && styles.tapCardUnread]}
              onPress={() => !tap.read && markAsRead(tap.id)}
            >
              <View style={styles.tapHeader}>
                <View style={[styles.tapIcon, { backgroundColor: getColorForPriority(tap.priority) + '20' }]}>
                  <Ionicons
                    name={getIconForType(tap.type) as any}
                    size={20}
                    color={getColorForPriority(tap.priority)}
                  />
                </View>
                <View style={styles.tapContent}>
                  <View style={styles.tapTitleRow}>
                    <Text style={styles.tapTitle}>{tap.title}</Text>
                    {!tap.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.tapMessage}>{tap.message}</Text>
                  <Text style={styles.tapTime}>{format(new Date(tap.created_at), 'MMM d, h:mm a')}</Text>
                </View>
              </View>
              {tap.action_required && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>Action Required</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  filterText: {
    fontSize: 14,
    color: '#888',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  tapCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  tapCardUnread: {
    borderColor: '#6C63FF',
    borderWidth: 2,
  },
  tapHeader: {
    flexDirection: 'row',
  },
  tapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tapContent: {
    flex: 1,
  },
  tapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C63FF',
    marginLeft: 8,
  },
  tapMessage: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 20,
    marginBottom: 8,
  },
  tapTime: {
    fontSize: 12,
    color: '#888',
  },
  actionBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FF5252',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

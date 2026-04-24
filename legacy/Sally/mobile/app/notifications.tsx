import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from './lib/constants';
import { useNotifications, AppNotification } from './lib/notifications-context';
import { useAuth } from './lib/auth-context';

type FilterType = 'all' | 'unread' | 'streak' | 'feature' | 'tip' | 'general';

const FILTER_OPTIONS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: 'unread', label: 'Unread', icon: 'mail-unread' },
  { key: 'streak', label: 'Streaks', icon: 'flame' },
  { key: 'feature', label: 'Updates', icon: 'sparkles' },
  { key: 'tip', label: 'Tips', icon: 'bulb' },
];

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function NotificationCard({
  notification,
  onPress,
  onDelete,
}: {
  notification: AppNotification;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity
      style={[s.notifCard, !notification.read && s.notifCardUnread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[s.notifIconWrap, { backgroundColor: notification.color + '18' }]}>
        <Ionicons name={notification.icon as any} size={22} color={notification.color} />
      </View>
      <View style={s.notifContent}>
        <View style={s.notifHeader}>
          <Text style={[s.notifTitle, !notification.read && s.notifTitleUnread]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={s.notifTime}>{getTimeAgo(notification.created_at)}</Text>
        </View>
        <Text style={s.notifBody} numberOfLines={2}>{notification.body}</Text>
        <View style={s.notifFooter}>
          <View style={[s.notifTypeBadge, { backgroundColor: notification.color + '15' }]}>
            <Text style={[s.notifTypeText, { color: notification.color }]}>
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </Text>
          </View>
          {!notification.read && <View style={[s.unreadDot, { backgroundColor: notification.color }]} />}
        </View>
      </View>
      <TouchableOpacity style={s.deleteBtn} onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="close" size={16} color={COLORS.textLight} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications, unreadCount, isLoading, preferences,
    markAsRead, markAllAsRead, deleteNotification,
    clearAllNotifications, refreshNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  const handleNotificationPress = useCallback((notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_type === 'navigate' && notification.action_data) {
      router.push(notification.action_data as any);
    }
  }, [markAsRead, router]);

  const handleDeleteNotification = useCallback((id: number) => {
    deleteNotification(id);
  }, [deleteNotification]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to remove all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearAllNotifications() },
      ]
    );
  }, [clearAllNotifications]);

  if (!user) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color={COLORS.textLight} />
          <Text style={s.emptyTitle}>Sign in to view notifications</Text>
          <Text style={s.emptySubtitle}>Create an account to receive personalized notifications and streak reminders.</Text>
          <TouchableOpacity style={s.signInBtn} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={s.signInBtnText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => router.push('/notification-settings' as any)} style={s.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Summary Bar */}
      <View style={s.summaryBar}>
        <View style={s.summaryLeft}>
          <View style={s.unreadBadge}>
            <Text style={s.unreadBadgeText}>{unreadCount}</Text>
          </View>
          <Text style={s.summaryText}>
            {unreadCount === 0 ? 'All caught up!' : `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <View style={s.summaryActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={s.summaryAction}>
              <Ionicons name="checkmark-done" size={18} color={COLORS.primaryLight} />
              <Text style={s.summaryActionText}>Read All</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={s.summaryAction}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notification Status */}
      {!preferences.notifications_enabled && (
        <View style={s.disabledBanner}>
          <Ionicons name="notifications-off" size={18} color={COLORS.warning} />
          <Text style={s.disabledBannerText}>Notifications are currently disabled</Text>
          <TouchableOpacity onPress={() => router.push('/notification-settings' as any)}>
            <Text style={s.disabledBannerLink}>Enable</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterContainer}>
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[s.filterChip, filter === opt.key && s.filterChipActive]}
            onPress={() => setFilter(opt.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={opt.icon as any}
              size={14}
              color={filter === opt.key ? COLORS.white : COLORS.textLight}
            />
            <Text style={[s.filterChipText, filter === opt.key && s.filterChipTextActive]}>
              {opt.label}
            </Text>
            {opt.key === 'unread' && unreadCount > 0 && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Notification List */}
      <ScrollView
        style={s.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primaryLight}
            colors={[COLORS.primaryLight]}
          />
        }
      >
        {isLoading && !refreshing ? (
          <View style={s.loadingState}>
            <ActivityIndicator size="large" color={COLORS.primaryLight} />
            <Text style={s.loadingText}>Loading notifications...</Text>
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons
              name={filter === 'unread' ? 'checkmark-circle-outline' : 'notifications-outline'}
              size={64}
              color={COLORS.textLight}
            />
            <Text style={s.emptyTitle}>
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </Text>
            <Text style={s.emptySubtitle}>
              {filter === 'unread'
                ? 'You\'ve read all your notifications. Great job staying on top of things!'
                : filter === 'all'
                  ? 'Notifications about your streak, new features, and tips will appear here.'
                  : `No ${filter} notifications to show right now.`}
            </Text>
          </View>
        ) : (
          <>
            {filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handleNotificationPress(notification)}
                onDelete={() => handleDeleteNotification(notification.id)}
              />
            ))}
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  settingsBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },

  summaryBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unreadBadge: {
    backgroundColor: COLORS.primaryLight, borderRadius: 10,
    minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.white },
  summaryText: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
  summaryActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  summaryActionText: { fontSize: 13, color: COLORS.primaryLight, fontWeight: '600' },

  disabledBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 8, paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)',
  },
  disabledBannerText: { flex: 1, fontSize: 13, color: COLORS.warning, fontWeight: '500' },
  disabledBannerLink: { fontSize: 13, color: COLORS.primaryLight, fontWeight: '700' },

  filterScroll: { maxHeight: 52 },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  filterChipText: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.white },
  filterBadge: {
    backgroundColor: COLORS.error, borderRadius: 8,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4, marginLeft: 2,
  },
  filterBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.white },

  listContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 16, marginBottom: 8, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  notifCardUnread: {
    backgroundColor: 'rgba(59,130,246,0.06)',
    borderColor: 'rgba(59,130,246,0.15)',
  },
  notifIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '600', color: COLORS.white, flex: 1, marginRight: 8 },
  notifTitleUnread: { fontWeight: '800' },
  notifTime: { fontSize: 11, color: COLORS.textLight, fontWeight: '500' },
  notifBody: { fontSize: 13, color: COLORS.textLight, lineHeight: 19, marginBottom: 8 },
  notifFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  notifTypeText: { fontSize: 11, fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },

  loadingState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.textLight },

  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  signInBtn: {
    marginTop: 24, backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14,
  },
  signInBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});

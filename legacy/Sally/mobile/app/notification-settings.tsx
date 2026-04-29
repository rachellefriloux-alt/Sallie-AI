import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from './lib/constants';
import { useNotifications } from './lib/notifications-context';
import { useAuth } from './lib/auth-context';

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
];

function formatTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { preferences, updatePreference, toggleMasterSwitch, generateStreakReminder } = useNotifications();
  const [timePickerField, setTimePickerField] = useState<'reminder_time' | 'quiet_hours_start' | 'quiet_hours_end' | null>(null);

  if (!user) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Notification Settings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color={COLORS.textLight} />
          <Text style={s.emptyTitle}>Sign in required</Text>
          <Text style={s.emptySubtitle}>Please sign in to manage your notification preferences.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleTestNotification = () => {
    generateStreakReminder();
    Alert.alert('Test Notification Sent', 'A streak reminder notification has been generated. Check your notification center!');
  };

  const notificationCategories = [
    {
      title: 'Notification Types',
      description: 'Choose which types of notifications you want to receive',
      items: [
        {
          icon: 'flame',
          color: '#f59e0b',
          label: 'Streak Alerts',
          description: 'Daily reminders to maintain your streak',
          key: 'streak_alerts' as const,
          value: preferences.streak_alerts,
        },
        {
          icon: 'time',
          color: '#3b82f6',
          label: 'Daily Reminders',
          description: 'Scheduled check-in reminders',
          key: 'daily_reminders' as const,
          value: preferences.daily_reminders,
        },
        {
          icon: 'sparkles',
          color: '#8b5cf6',
          label: 'Feature Updates',
          description: 'New features and improvements',
          key: 'feature_updates' as const,
          value: preferences.feature_updates,
        },
        {
          icon: 'bar-chart',
          color: '#10b981',
          label: 'Weekly Summary',
          description: 'Weekly activity and progress report',
          key: 'weekly_summary' as const,
          value: preferences.weekly_summary,
        },
        {
          icon: 'bulb',
          color: '#ec4899',
          label: 'Tips & Tricks',
          description: 'Helpful tips to get more from Sallie',
          key: 'tips_and_tricks' as const,
          value: preferences.tips_and_tricks,
        },
      ],
    },
  ];

  const scheduleSettings = [
    {
      icon: 'alarm',
      color: '#3b82f6',
      label: 'Reminder Time',
      description: 'When to send daily reminders',
      value: formatTime(preferences.reminder_time),
      key: 'reminder_time' as const,
    },
    {
      icon: 'moon',
      color: '#8b5cf6',
      label: 'Quiet Hours Start',
      description: 'Stop notifications after this time',
      value: formatTime(preferences.quiet_hours_start),
      key: 'quiet_hours_start' as const,
    },
    {
      icon: 'sunny',
      color: '#f59e0b',
      label: 'Quiet Hours End',
      description: 'Resume notifications after this time',
      value: formatTime(preferences.quiet_hours_end),
      key: 'quiet_hours_end' as const,
    },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notification Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Master Toggle */}
        <View style={s.masterSection}>
          <View style={s.masterIconWrap}>
            <Ionicons
              name={preferences.notifications_enabled ? 'notifications' : 'notifications-off'}
              size={32}
              color={preferences.notifications_enabled ? COLORS.primaryLight : COLORS.textLight}
            />
          </View>
          <Text style={s.masterTitle}>
            Notifications {preferences.notifications_enabled ? 'Enabled' : 'Disabled'}
          </Text>
          <Text style={s.masterSubtitle}>
            {preferences.notifications_enabled
              ? 'You\'ll receive notifications based on your preferences below.'
              : 'All notifications are currently turned off. Enable to stay updated.'}
          </Text>
          <View style={s.masterToggleRow}>
            <Text style={s.masterToggleLabel}>Enable Notifications</Text>
            <Switch
              value={preferences.notifications_enabled}
              onValueChange={(val) => toggleMasterSwitch(val)}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primaryLight + '60' }}
              thumbColor={preferences.notifications_enabled ? COLORS.primaryLight : COLORS.textLight}
            />
          </View>
        </View>

        {/* Notification Categories */}
        {notificationCategories.map((category, ci) => (
          <View key={ci} style={s.section}>
            <Text style={s.sectionTitle}>{category.title}</Text>
            <Text style={s.sectionDescription}>{category.description}</Text>
            <View style={s.settingsList}>
              {category.items.map((item, ii) => (
                <View
                  key={ii}
                  style={[
                    s.settingItem,
                    ii < category.items.length - 1 && s.settingItemBorder,
                    !preferences.notifications_enabled && s.settingItemDisabled,
                  ]}
                >
                  <View style={s.settingItemLeft}>
                    <View style={[s.settingIcon, { backgroundColor: item.color + '18' }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <View style={s.settingTextWrap}>
                      <Text style={[s.settingLabel, !preferences.notifications_enabled && s.textDisabled]}>
                        {item.label}
                      </Text>
                      <Text style={s.settingDescription}>{item.description}</Text>
                    </View>
                  </View>
                  <Switch
                    value={item.value && preferences.notifications_enabled}
                    onValueChange={(val) => updatePreference(item.key, val)}
                    disabled={!preferences.notifications_enabled}
                    trackColor={{ false: 'rgba(255,255,255,0.1)', true: item.color + '60' }}
                    thumbColor={item.value && preferences.notifications_enabled ? item.color : COLORS.textLight}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Schedule Settings */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Schedule</Text>
          <Text style={s.sectionDescription}>Configure when you receive notifications</Text>
          <View style={s.settingsList}>
            {scheduleSettings.map((item, ii) => (
              <TouchableOpacity
                key={ii}
                style={[
                  s.settingItem,
                  ii < scheduleSettings.length - 1 && s.settingItemBorder,
                  !preferences.notifications_enabled && s.settingItemDisabled,
                ]}
                onPress={() => preferences.notifications_enabled && setTimePickerField(item.key)}
                disabled={!preferences.notifications_enabled}
                activeOpacity={0.7}
              >
                <View style={s.settingItemLeft}>
                  <View style={[s.settingIcon, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={s.settingTextWrap}>
                    <Text style={[s.settingLabel, !preferences.notifications_enabled && s.textDisabled]}>
                      {item.label}
                    </Text>
                    <Text style={s.settingDescription}>{item.description}</Text>
                  </View>
                </View>
                <View style={s.timeValueWrap}>
                  <Text style={[s.timeValue, !preferences.notifications_enabled && s.textDisabled]}>
                    {item.value}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Test & Debug */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Test</Text>
          <TouchableOpacity
            style={[s.testButton, !preferences.notifications_enabled && { opacity: 0.5 }]}
            onPress={handleTestNotification}
            disabled={!preferences.notifications_enabled}
            activeOpacity={0.7}
          >
            <Ionicons name="paper-plane" size={20} color={COLORS.primaryLight} />
            <Text style={s.testButtonText}>Send Test Streak Reminder</Text>
          </TouchableOpacity>
          <Text style={s.testHint}>
            This will generate a streak reminder notification in your notification center.
          </Text>
        </View>

        {/* Info Card */}
        <View style={s.infoCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.primaryLight} />
          <View style={s.infoTextWrap}>
            <Text style={s.infoTitle}>About Notifications</Text>
            <Text style={s.infoBody}>
              Sallie sends you helpful reminders to maintain your streak, updates about new features,
              and tips to get the most out of your cognitive sessions. You can customize exactly what
              you receive and when.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={timePickerField !== null} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>
                {timePickerField === 'reminder_time' ? 'Reminder Time' :
                 timePickerField === 'quiet_hours_start' ? 'Quiet Hours Start' :
                 'Quiet Hours End'}
              </Text>
              <TouchableOpacity onPress={() => setTimePickerField(null)}>
                <Ionicons name="close" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
            <ScrollView style={s.timeList} showsVerticalScrollIndicator={false}>
              {TIME_OPTIONS.map(time => {
                const isSelected = timePickerField && preferences[timePickerField] === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[s.timeOption, isSelected && s.timeOptionActive]}
                    onPress={() => {
                      if (timePickerField) {
                        updatePreference(timePickerField, time);
                      }
                      setTimePickerField(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.timeOptionText, isSelected && s.timeOptionTextActive]}>
                      {formatTime(time)}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={22} color={COLORS.primaryLight} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 8, textAlign: 'center', lineHeight: 20 },

  masterSection: {
    alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24,
    marginHorizontal: 16, marginTop: 8, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  masterIconWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(59,130,246,0.12)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  masterTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginBottom: 6 },
  masterSubtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  masterToggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
  },
  masterToggleLabel: { fontSize: 16, fontWeight: '600', color: COLORS.white },

  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  sectionDescription: { fontSize: 13, color: COLORS.textLight, marginBottom: 12, opacity: 0.7 },

  settingsList: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  settingItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  settingItemDisabled: { opacity: 0.4 },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingTextWrap: { flex: 1 },
  settingLabel: { fontSize: 15, color: COLORS.white, fontWeight: '600' },
  settingDescription: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  textDisabled: { color: COLORS.textLight },

  timeValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeValue: { fontSize: 14, color: COLORS.primaryLight, fontWeight: '600' },

  testButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
  },
  testButtonText: { fontSize: 15, fontWeight: '600', color: COLORS.primaryLight },
  testHint: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', marginTop: 8, opacity: 0.7 },

  infoCard: {
    flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 24,
    padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(59,130,246,0.06)',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.15)',
  },
  infoTextWrap: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  infoBody: { fontSize: 13, color: COLORS.textLight, lineHeight: 19 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.bgMedium, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '60%', paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  timeList: { paddingHorizontal: 16 },
  timeOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 12, marginVertical: 2,
  },
  timeOptionActive: { backgroundColor: 'rgba(59,130,246,0.1)' },
  timeOptionText: { fontSize: 16, color: COLORS.white, fontWeight: '500' },
  timeOptionTextActive: { color: COLORS.primaryLight, fontWeight: '700' },
});

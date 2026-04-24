/**
 * Settings Screen
 * Application settings and preferences
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './lib/constants';
import { useAuth } from './lib/auth-context';

interface SettingItem {
  id: string;
  label: string;
  icon: string;
  type: 'toggle' | 'link' | 'value';
  value?: boolean | string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    voiceEnabled: false,
    hapticFeedback: true,
    autoSync: true,
    biometricAuth: false,
    limbicDisplay: true,
    heritageSync: true,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const sections = [
    {
      title: 'Appearance',
      items: [
        { id: 'darkMode', label: 'Dark Mode', icon: 'moon-outline', type: 'toggle' as const },
        { id: 'avatar', label: 'Avatar Selection', icon: 'person-circle-outline', type: 'link' as const },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { id: 'notifications', label: 'Push Notifications', icon: 'notifications-outline', type: 'toggle' as const },
        { id: 'notification-settings', label: 'Notification Settings', icon: 'options-outline', type: 'link' as const },
      ],
    },
    {
      title: 'Voice & Input',
      items: [
        { id: 'voiceEnabled', label: 'Voice Interface', icon: 'mic-outline', type: 'toggle' as const },
        { id: 'hapticFeedback', label: 'Haptic Feedback', icon: 'phone-portrait-outline', type: 'toggle' as const },
      ],
    },
    {
      title: 'Sallie Systems',
      items: [
        { id: 'limbicDisplay', label: 'Show Limbic State', icon: 'pulse-outline', type: 'toggle' as const },
        { id: 'heritageSync', label: 'Heritage DNA Sync', icon: 'sync-outline', type: 'toggle' as const },
        { id: 'autoSync', label: 'Auto Sync', icon: 'cloud-upload-outline', type: 'toggle' as const },
      ],
    },
    {
      title: 'Security',
      items: [
        { id: 'biometricAuth', label: 'Biometric Authentication', icon: 'finger-print-outline', type: 'toggle' as const },
      ],
    },
    {
      title: 'About',
      items: [
        { id: 'about', label: 'About Sallie', icon: 'information-circle-outline', type: 'link' as const },
        { id: 'version', label: 'Version', icon: 'code-slash-outline', type: 'value' as const, value: '0.1.0' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingRow}
                onPress={() => {
                  if (item.type === 'toggle') toggleSetting(item.id);
                  else if (item.type === 'link') {
                    if (item.id === 'avatar') router.push('/avatar');
                    else if (item.id === 'about') router.push('/about');
                    else if (item.id === 'notification-settings') router.push('/notification-settings');
                  }
                }}
                activeOpacity={item.type === 'toggle' ? 1 : 0.7}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.purpleLight} />
                  <Text style={styles.settingLabel}>{item.label}</Text>
                </View>
                {item.type === 'toggle' && (
                  <Switch
                    value={settings[item.id as keyof typeof settings] as boolean}
                    onValueChange={() => toggleSetting(item.id)}
                    trackColor={{ false: '#333', true: COLORS.purpleLight + '60' }}
                    thumbColor={settings[item.id as keyof typeof settings] ? COLORS.purpleLight : '#666'}
                  />
                )}
                {item.type === 'link' && <Ionicons name="chevron-forward" size={20} color="#666" />}
                {item.type === 'value' && <Text style={styles.settingValue}>{item.value}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.purpleLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 2 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, color: '#fff' },
  settingValue: { fontSize: 14, color: '#999' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, marginTop: 16, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  signOutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});

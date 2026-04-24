import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
  Alert, TextInput, Modal, ActivityIndicator, KeyboardAvoidingView, Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '../lib/constants';
import { ShimmerView } from '../lib/ShimmerView';
import { useAuth } from '../lib/auth-context';
import { useNotifications } from '../lib/notifications-context';

// ─── STREAK CARD ───
function StreakCard({ streakDays, lastActiveDate }: { streakDays: number; lastActiveDate: string | null }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (streakDays >= 7) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, [streakDays]);

  const getStreakLevel = () => {
    if (streakDays >= 100) return { label: 'Legendary', color: COLORS.gold, bg: 'rgba(255,215,0,0.12)' };
    if (streakDays >= 30) return { label: 'On Fire', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    if (streakDays >= 7) return { label: 'Blazing', color: '#f97316', bg: 'rgba(249,115,22,0.12)' };
    if (streakDays >= 3) return { label: 'Warming Up', color: '#eab308', bg: 'rgba(234,179,8,0.12)' };
    return { label: 'Getting Started', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };
  };

  const level = getStreakLevel();
  const nextMilestone = [3, 7, 14, 21, 30, 50, 60, 90, 100, 150, 200, 365].find(m => m > streakDays) || 365;
  const progress = streakDays / nextMilestone;

  const isActiveToday = () => {
    if (!lastActiveDate) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return lastActiveDate === todayStr;
  };

  const showShimmer = streakDays >= 7;

  const cardContent = (
    <>
      <View style={s.streakHeader}>
        <Animated.View style={[s.streakFlameContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="flame" size={32} color={level.color} />
        </Animated.View>
        <View style={s.streakInfo}>
          <Text style={s.streakDays}>{streakDays}</Text>
          <Text style={s.streakDaysLabel}>day streak</Text>
        </View>
        <View style={[s.streakLevelBadge, { backgroundColor: level.bg }]}>
          <Text style={[s.streakLevelText, { color: level.color }]}>{level.label}</Text>
        </View>
      </View>

      {/* Progress to next milestone */}
      <View style={s.streakProgress}>
        <View style={s.streakProgressBar}>
          <View style={[s.streakProgressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: level.color }]} />
        </View>
        <Text style={s.streakProgressText}>{streakDays}/{nextMilestone} days to next milestone</Text>
      </View>

      {/* Today status */}
      <View style={s.streakTodayRow}>
        <View style={[s.streakTodayDot, { backgroundColor: isActiveToday() ? COLORS.success : COLORS.textLight }]} />
        <Text style={s.streakTodayText}>
          {isActiveToday() ? 'Active today - streak safe!' : 'Chat with Sallie to keep your streak!'}
        </Text>
      </View>
    </>
  );

  return showShimmer ? (
    <ShimmerView style={s.streakCardWrapper} borderRadius={20}>
      <View style={s.streakCard}>{cardContent}</View>
    </ShimmerView>
  ) : (
    <View style={s.streakCard}>{cardContent}</View>
  );
}

// ─── AUTH SCREEN (inline) ───
function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email format'); return false; }
    if (mode === 'reset') return true;
    return true;
  };

  const handleSubmit = async () => {
    setError(''); setSuccessMsg('');
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email, password || '');
        if (res.error) setError(res.error);
        else if (res.message) setSuccessMsg(res.message);
      } else if (mode === 'signup') {
        const res = await signUp(email, password || '', displayName);
        if (res.error) setError(res.error);
        else if (res.message) setSuccessMsg(res.message);
      } else {
        const res = await resetPassword(email);
        if (res.error) setError(res.error);
        else setSuccessMsg(res.message || 'Check your email for reset instructions.');
      }
    } catch (e: any) { setError(e.message || 'Something went wrong'); }
    setLoading(false);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.authScroll} keyboardShouldPersistTaps="handled">
          <View style={s.authLogo}>
            <View style={s.authLogoCircle}>
              <Ionicons name="sparkles" size={36} color={COLORS.primaryLight} />
            </View>
            <Text style={s.authLogoText}>Sallie</Text>
            <Text style={s.authLogoSub}>Your AI Cognitive Partner</Text>
          </View>

          <Text style={s.authTitle}>
            {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </Text>
          <Text style={s.authSubtitle}>
            {mode === 'signin' ? 'Sign in to continue your cognitive journey' :
             mode === 'signup' ? 'Join millions thinking better with Sallie' :
             'Enter your email to receive reset instructions'}
          </Text>

          {error ? (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}
          {successMsg ? (
            <View style={s.successBox}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={s.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {mode === 'signup' && (
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Display Name</Text>
              <View style={s.inputWrap}>
                <Ionicons name="person-outline" size={18} color={COLORS.textLight} />
                <TextInput style={s.input} value={displayName} onChangeText={t => { setDisplayName(t); setError(''); }}
                  placeholder="Your name" placeholderTextColor={COLORS.textLight} />
              </View>
            </View>
          )}

          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Email</Text>
            <View style={s.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textLight} />
              <TextInput style={s.input} value={email} onChangeText={t => { setEmail(t); setError(''); }}
                placeholder="your@email.com" placeholderTextColor={COLORS.textLight}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
          </View>

          {mode !== 'reset' && (
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Password</Text>
              <View style={s.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} />
                <TextInput style={s.input} value={password} onChangeText={t => { setPassword(t); setError(''); }}
                  placeholder="Min. 6 characters" placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPw} />
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {mode === 'signup' && (
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Confirm Password</Text>
              <View style={s.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} />
                <TextInput style={s.input} value={confirmPw} onChangeText={t => { setConfirmPw(t); setError(''); }}
                  placeholder="Re-enter password" placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPw} />
              </View>
            </View>
          )}

          {mode === 'signin' && (
            <TouchableOpacity onPress={() => { setMode('reset'); setError(''); setSuccessMsg(''); }} style={s.forgotBtn}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[s.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={s.submitText}>
                {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={s.toggleRow}>
            {mode === 'signin' ? (
              <>
                <Text style={s.toggleLabel}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}>
                  <Text style={s.toggleLink}>Sign Up</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.toggleLabel}>Already have an account? </Text>
                <TouchableOpacity onPress={() => { setMode('signin'); setError(''); setSuccessMsg(''); }}>
                  <Text style={s.toggleLink}>Sign In</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── PROFILE SCREEN ───
export default function ProfileScreen() {
  const router = useRouter();
  const { user, sessionToken, isLoading, signOut, updateProfile, refreshUser } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim?.() ?? '';
  const { preferences, toggleMasterSwitch, unreadCount } = useNotifications();
  const [darkMode, setDarkMode] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Refresh user data on mount to get latest streak
  useEffect(() => {
    if (user?.user_id) {
      refreshUser();
    }
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primaryLight} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return <AuthScreen />;

  const userName = user.display_name || user.email.split('@')[0];
  const memberSince = (() => {
    try {
      const d = new Date(user.created_at);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return 'Recently';
    }
  })();

  const usageStats = [
    { label: 'Messages Sent', value: String(user.messages_sent || 0), icon: 'chatbubbles', color: '#3b82f6' },
    { label: 'Sessions', value: String(user.sessions_count || 0), icon: 'time', color: '#8b5cf6' },
    { label: 'Modes Used', value: `${user.modes_used || 0}/6`, icon: 'grid', color: '#10b981' },
    { label: 'Streak', value: `${user.streak_days || 0} days`, icon: 'flame', color: '#f59e0b' },
  ];

  const handleToggle = (label: string) => {
    switch (label) {
      case 'Dark Mode': setDarkMode(!darkMode); break;
      case 'Notifications':
        toggleMasterSwitch(!preferences.notifications_enabled);
        break;
      case 'Haptic Feedback': setHaptics(!haptics); break;
      case 'Auto-save Conversations': setAutoSave(!autoSave); break;
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    const res = await updateProfile(editName.trim());
    setSaving(false);
    if (res.error) Alert.alert('Error', res.error);
    else { setShowEditProfile(false); Alert.alert('Saved', 'Profile updated!'); }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const settingSections = [
    {
      title: 'Preferences', items: [
        { icon: 'moon', label: 'Dark Mode', type: 'toggle' as const, value: darkMode },
        { icon: 'notifications', label: 'Notifications', type: 'toggle' as const, value: preferences.notifications_enabled },
        { icon: 'options', label: 'Notification Preferences', type: 'nav' as const, onPress: () => router.push('/notification-settings' as any), badge: unreadCount > 0 ? unreadCount : undefined },
        { icon: 'phone-portrait', label: 'Haptic Feedback', type: 'toggle' as const, value: haptics },
        { icon: 'save', label: 'Auto-save Conversations', type: 'toggle' as const, value: autoSave },
      ],
    },
    {
      title: 'Account', items: [
        { icon: 'person', label: 'Edit Profile', type: 'nav' as const, onPress: () => { setEditName(userName); setShowEditProfile(true); } },
        { icon: 'card', label: 'Subscription', type: 'nav' as const, onPress: () => router.push('/pricing') },
        { icon: 'download', label: 'Export Data', type: 'nav' as const, onPress: async () => {
          if (!apiUrl || !sessionToken) {
            Alert.alert('Export', 'Set EXPO_PUBLIC_API_URL and sign in to export from the app.');
            return;
          }
          try {
            const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/user/export?format=json`, {
              headers: { Authorization: `Bearer ${sessionToken}` },
            });
            if (res.ok) {
              const data = await res.json();
              Alert.alert('Export', `Exported ${data.conversations?.length ?? 0} conversations. Data is in your session; use the web app to download the file.`);
            } else {
              Alert.alert('Export', 'Export failed. Try again or use the web app.');
            }
          } catch {
            Alert.alert('Export', 'Could not reach the server. Check EXPO_PUBLIC_API_URL and try again.');
          }
        } },
        { icon: 'shield-checkmark', label: 'Privacy & Security', type: 'nav' as const, onPress: () => Alert.alert('Privacy', 'Your data is encrypted end-to-end.') },
      ],
    },
    {
      title: 'Support', items: [
        { icon: 'help-circle', label: 'Help Center', type: 'nav' as const, onPress: () => router.push('/about') },
        { icon: 'mail', label: 'Contact Support', type: 'nav' as const, onPress: () => router.push('/contact') },
        { icon: 'information-circle', label: 'About Sallie', type: 'nav' as const, onPress: () => router.push('/about') },
      ],
    },
    {
      title: 'App Info', items: [
        { icon: 'code-slash', label: 'Version', type: 'info' as const, info: '5.4.2' },
        { icon: 'server', label: 'AI Model', type: 'info' as const, info: 'Gemini Flash' },
        { icon: 'globe', label: 'Region', type: 'info' as const, info: 'Auto-detect' },
      ],
    },
  ];

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with notification bell */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={s.notifBellBtn}
            onPress={() => router.push('/notifications' as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
              size={24}
              color={unreadCount > 0 ? COLORS.primaryLight : COLORS.textLight}
            />
            {unreadCount > 0 && (
              <View style={s.notifBellBadge}>
                <Text style={s.notifBellBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Notification Banner (if notifications disabled) */}
        {!preferences.notifications_enabled && (
          <TouchableOpacity
            style={s.notifBanner}
            onPress={() => router.push('/notification-settings' as any)}
            activeOpacity={0.7}
          >
            <View style={s.notifBannerLeft}>
              <Ionicons name="notifications-off" size={20} color={COLORS.warning} />
              <View>
                <Text style={s.notifBannerTitle}>Notifications Disabled</Text>
                <Text style={s.notifBannerSub}>Tap to enable streak reminders and updates</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}

        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.avatarContainer}>
            <View style={s.avatar}>
              <Text style={s.avatarLetter}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={s.onlineDot} />
          </View>
          <Text style={s.profileName}>{userName}</Text>
          <Text style={s.profileEmail}>{user.email}</Text>
          <Text style={s.memberSince}>Member since {memberSince}</Text>
          <View style={s.planBadge}>
            <Ionicons name="sparkles" size={14} color={COLORS.warning} />
            <Text style={s.planText}>{(user.plan || 'free').charAt(0).toUpperCase() + (user.plan || 'free').slice(1)} Plan</Text>
          </View>
          <TouchableOpacity style={s.upgradeCTA} onPress={() => router.push('/pricing')} activeOpacity={0.8}>
            <Text style={s.upgradeCTAText}>Upgrade to Pro</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Streak Card */}
        <View style={s.streakSection}>
          <Text style={s.sectionTitle}>Your Streak</Text>
          <StreakCard streakDays={user.streak_days || 0} lastActiveDate={user.last_active_date || null} />
        </View>

        {/* Stats */}
        <View style={s.statsContainer}>
          <Text style={s.sectionTitle}>Your Activity</Text>
          <View style={s.statsGrid}>
            {usageStats.map((stat, i) => (
              <View key={i} style={s.statCard}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        {settingSections.map((section, si) => (
          <View key={si} style={s.settingSection}>
            <Text style={s.settingSectionTitle}>{section.title}</Text>
            <View style={s.settingsList}>
              {section.items.map((item: any, ii) => (
                <TouchableOpacity key={ii}
                  style={[s.settingItem, ii < section.items.length - 1 && s.settingItemBorder]}
                  onPress={() => { if (item.type === 'toggle') handleToggle(item.label); else if (item.onPress) item.onPress(); }}
                  activeOpacity={item.type === 'info' ? 1 : 0.7} disabled={item.type === 'info'}>
                  <View style={s.settingItemLeft}>
                    <View style={s.settingIcon}><Ionicons name={item.icon} size={20} color={COLORS.primaryLight} /></View>
                    <Text style={s.settingLabel}>{item.label}</Text>
                    {item.badge && (
                      <View style={s.settingBadge}>
                        <Text style={s.settingBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  {item.type === 'toggle' && (
                    <Switch value={item.value} onValueChange={() => handleToggle(item.label)}
                      trackColor={{ false: 'rgba(255,255,255,0.1)', true: COLORS.primaryLight + '60' }}
                      thumbColor={item.value ? COLORS.primaryLight : COLORS.textLight} />
                  )}
                  {item.type === 'nav' && <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />}
                  {item.type === 'info' && <Text style={s.settingInfo}>{item.info}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity style={s.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
          <Ionicons name="log-out" size={20} color={COLORS.error} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Ionicons name="close" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
            <Text style={s.inputLabel}>Display Name</Text>
            <TextInput style={s.modalInput} value={editName} onChangeText={setEditName}
              placeholder="Your name" placeholderTextColor={COLORS.textLight} />
            <TouchableOpacity style={[s.submitBtn, saving && { opacity: 0.6 }]} onPress={handleSaveProfile} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgDark },
  // Auth styles
  authScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  authLogo: { alignItems: 'center', marginBottom: 32 },
  authLogoCircle: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(59,130,246,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  authLogoText: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  authLogoSub: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  authTitle: { fontSize: 26, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: 6 },
  authSubtitle: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: COLORS.error, fontSize: 13, flex: 1 },
  successBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', borderRadius: 12, padding: 12, marginBottom: 16 },
  successText: { color: COLORS.success, fontSize: 13, flex: 1 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textLight, marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.white, paddingVertical: 14 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText: { color: COLORS.primaryLight, fontSize: 13, fontWeight: '600' },
  submitBtn: { backgroundColor: COLORS.primaryLight, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8, elevation: 6, shadowColor: COLORS.primaryLight, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  submitText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  toggleLabel: { color: COLORS.textLight, fontSize: 14 },
  toggleLink: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '700' },
  // Profile styles
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  notifBellBtn: { position: 'relative', width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  notifBellBadge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  notifBellBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.white },
  notifBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, marginTop: 8, marginBottom: 4,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'rgba(245,158,11,0.06)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)',
  },
  notifBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  notifBannerTitle: { fontSize: 14, fontWeight: '700', color: COLORS.warning },
  notifBannerSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  profileCard: { alignItems: 'center', paddingVertical: 28, marginHorizontal: 20, marginTop: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  avatarContainer: { position: 'relative', marginBottom: 14 },
  avatar: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(59,130,246,0.15)', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 30, fontWeight: '800', color: COLORS.primaryLight },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.success, borderWidth: 3, borderColor: COLORS.bgDark },
  profileName: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  profileEmail: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  memberSince: { fontSize: 12, color: COLORS.textLight, marginTop: 4, fontStyle: 'italic' },
  planBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12 },
  planText: { fontSize: 13, fontWeight: '600', color: COLORS.warning },
  upgradeCTA: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  upgradeCTAText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  // Streak Card
  streakSection: { paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 14 },
  streakCardWrapper: {},
  streakCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakFlameContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(245,158,11,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  streakInfo: {
    flex: 1,
  },
  streakDays: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 40,
  },
  streakDaysLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
    marginTop: -2,
  },
  streakLevelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  streakLevelText: {
    fontSize: 12,
    fontWeight: '700',
  },
  streakProgress: {
    marginBottom: 12,
  },
  streakProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  streakProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  streakProgressText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  streakTodayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  streakTodayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  streakTodayText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  // Stats
  statsContainer: { paddingHorizontal: 20, paddingTop: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.white, marginTop: 8 },
  statLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 4, fontWeight: '500' },
  settingSection: { paddingHorizontal: 20, paddingTop: 28 },
  settingSectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  settingsList: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  settingItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.1)', justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, color: COLORS.white, fontWeight: '500' },
  settingBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 5,
  },
  settingBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.white },
  settingInfo: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 28, paddingVertical: 16, borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  signOutText: { fontSize: 16, fontWeight: '600', color: COLORS.error },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: COLORS.bgMedium, borderRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: COLORS.white, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 8 },
});

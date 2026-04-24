import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';

// ─── Types ───
export interface NotificationPreferences {
  notifications_enabled: boolean;
  daily_reminders: boolean;
  streak_alerts: boolean;
  feature_updates: boolean;
  weekly_summary: boolean;
  tips_and_tricks: boolean;
  reminder_time: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

export interface AppNotification {
  id: string;
  type: 'streak' | 'feature' | 'tip' | 'reminder' | 'achievement' | 'general';
  title: string;
  body: string;
  icon: string;
  color: string;
  read: boolean;
  action_type?: string;
  action_data?: string;
  created_at: string;
}

interface NotificationsContextType {
  preferences: NotificationPreferences;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  updatePreference: (key: keyof NotificationPreferences, value: boolean | string) => Promise<void>;
  toggleMasterSwitch: (enabled: boolean) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  generateStreakReminder: () => Promise<void>;
}

const defaultPreferences: NotificationPreferences = {
  notifications_enabled: true,
  daily_reminders: true,
  streak_alerts: true,
  feature_updates: true,
  weekly_summary: true,
  tips_and_tricks: true,
  reminder_time: '09:00',
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
};

const NotificationsContext = createContext<NotificationsContextType>({
  preferences: defaultPreferences,
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  updatePreference: async () => {},
  toggleMasterSwitch: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  clearAllNotifications: async () => {},
  refreshNotifications: async () => {},
  generateStreakReminder: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

// ─── Streak motivation messages ───
const STREAK_MESSAGES = [
  { title: 'Keep Your Streak Alive!', body: 'You\'re on a roll! Don\'t break your streak today. Open Sallie and keep the momentum going.' },
  { title: 'Your Streak Needs You!', body: 'A quick chat with Sallie is all it takes to maintain your streak. Let\'s keep growing together!' },
  { title: 'Streak Reminder', body: 'Consistency is key to growth. Take a moment to connect with Sallie and extend your streak.' },
  { title: 'Don\'t Lose Your Progress!', body: 'Your streak represents your commitment to growth. Keep it alive with a session today!' },
  { title: 'Time for Your Daily Check-in', body: 'Great minds think daily. Continue your streak with Sallie and unlock new insights.' },
  { title: 'Your Cognitive Workout Awaits', body: 'Just like physical exercise, mental fitness requires consistency. Keep your streak going!' },
];

// ─── Feature update notifications ───
const FEATURE_UPDATES: Omit<AppNotification, 'id' | 'read' | 'created_at'>[] = [
  {
    type: 'feature',
    title: 'New: Enhanced Creative Mode',
    body: 'Creative Studio now includes collaborative brainstorming with AI-powered mind maps. Try it out!',
    icon: 'color-palette',
    color: '#ec4899',
    action_type: 'navigate',
    action_data: '/chat',
  },
  {
    type: 'feature',
    title: 'Wellness Coach Upgrade',
    body: 'New guided meditation sessions and breathing exercises are now available in Wellness mode.',
    icon: 'heart',
    color: '#10b981',
    action_type: 'navigate',
    action_data: '/chat',
  },
  {
    type: 'feature',
    title: 'Smart Conversation Export',
    body: 'You can now export your conversations as PDF or Markdown. Check your profile settings!',
    icon: 'download',
    color: '#3b82f6',
    action_type: 'navigate',
    action_data: '/profile',
  },
  {
    type: 'tip',
    title: 'Pro Tip: Voice Commands',
    body: 'Did you know you can switch modes by saying "Switch to Creative mode"? Try it in your next session!',
    icon: 'mic',
    color: '#8b5cf6',
  },
  {
    type: 'tip',
    title: 'Maximize Your Sessions',
    body: 'For best results, start each session by telling Sallie your goal. She\'ll tailor the conversation to help you achieve it.',
    icon: 'bulb',
    color: '#f59e0b',
  },
  {
    type: 'feature',
    title: 'New Analytics Dashboard',
    body: 'Track your cognitive growth with the new analytics dashboard. See patterns in your thinking over time.',
    icon: 'analytics',
    color: '#1e40af',
    action_type: 'navigate',
    action_data: '/features',
  },
];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Load preferences and notifications when user logs in
  useEffect(() => {
    if (user?.user_id) {
      loadPreferences(user.user_id);
      loadNotifications(user.user_id);
      // Generate initial notifications for new users
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        seedNotificationsIfNeeded(user.user_id);
      }
    } else {
      setPreferences(defaultPreferences);
      setNotifications([]);
      hasInitialized.current = false;
    }
  }, [user?.user_id]);

  const loadPreferences = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data) {
        setPreferences({
          notifications_enabled: data.notifications_enabled ?? true,
          daily_reminders: data.daily_reminders ?? true,
          streak_alerts: data.streak_alerts ?? true,
          feature_updates: data.feature_updates ?? true,
          weekly_summary: data.weekly_summary ?? true,
          tips_and_tricks: data.tips_and_tricks ?? true,
          reminder_time: data.reminder_time || '09:00',
          quiet_hours_start: data.quiet_hours_start || '22:00',
          quiet_hours_end: data.quiet_hours_end || '07:00',
        });
      } else {
        // Create default preferences
        await supabase.from('notification_preferences').insert({
          user_id: userId,
          ...defaultPreferences,
        });
      }
    } catch (e) {
      console.log('Error loading notification preferences:', e);
    }
  };

  const loadNotifications = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('app_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data as AppNotification[]);
      }
    } catch (e) {
      console.log('Error loading notifications:', e);
    }
  };

  const seedNotificationsIfNeeded = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('app_notifications')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (!error && (!data || data.length === 0)) {
        // Seed with welcome + a few feature notifications
        const now = new Date();
        const seedNotifs = [
          {
            user_id: userId,
            type: 'general',
            title: 'Welcome to Sallie!',
            body: 'Your AI cognitive partner is ready. Start a conversation to begin your journey of growth and discovery.',
            icon: 'sparkles',
            color: '#3b82f6',
            read: false,
            created_at: now.toISOString(),
          },
          {
            user_id: userId,
            type: 'tip',
            title: 'Explore All 6 Modes',
            body: 'Sallie has 6 specialized cognitive modes: General, Creative, Analytical, Wellness, Productivity, and Learning. Try them all!',
            icon: 'grid',
            color: '#8b5cf6',
            read: false,
            action_type: 'navigate',
            action_data: '/features',
            created_at: new Date(now.getTime() - 60000).toISOString(),
          },
          {
            user_id: userId,
            type: 'streak',
            title: 'Your Streak Starts Now!',
            body: 'You\'ve started your first streak! Come back daily to keep it growing and unlock achievements.',
            icon: 'flame',
            color: '#f59e0b',
            read: false,
            created_at: new Date(now.getTime() - 120000).toISOString(),
          },
          {
            user_id: userId,
            type: 'feature',
            title: 'New: Enhanced Creative Mode',
            body: 'Creative Studio now includes collaborative brainstorming with AI-powered mind maps. Try it out!',
            icon: 'color-palette',
            color: '#ec4899',
            read: false,
            action_type: 'navigate',
            action_data: '/chat',
            created_at: new Date(now.getTime() - 300000).toISOString(),
          },
        ];

        const { data: inserted } = await supabase
          .from('app_notifications')
          .insert(seedNotifs)
          .select();

        if (inserted) {
          setNotifications(inserted as AppNotification[]);
        }
      }
    } catch (e) {
      console.log('Error seeding notifications:', e);
    }
  };

  const updatePreference = useCallback(async (key: keyof NotificationPreferences, value: boolean | string) => {
    if (!user?.user_id) return;

    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    try {
      await supabase
        .from('notification_preferences')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('user_id', user.user_id);
    } catch (e) {
      console.log('Error updating preference:', e);
      // Revert on error
      setPreferences(preferences);
    }
  }, [user?.user_id, preferences]);

  const toggleMasterSwitch = useCallback(async (enabled: boolean) => {
    if (!user?.user_id) return;

    const updated = { ...preferences, notifications_enabled: enabled };
    setPreferences(updated);

    try {
      await supabase
        .from('notification_preferences')
        .update({ notifications_enabled: enabled, updated_at: new Date().toISOString() })
        .eq('user_id', user.user_id);
    } catch (e) {
      console.log('Error toggling master switch:', e);
      setPreferences(preferences);
    }
  }, [user?.user_id, preferences]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await supabase.from('app_notifications').update({ read: true }).eq('id', id);
    } catch (e) {
      console.log('Error marking notification as read:', e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user?.user_id) return;
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await supabase.from('app_notifications')
        .update({ read: true })
        .eq('user_id', user.user_id)
        .eq('read', false);
    } catch (e) {
      console.log('Error marking all as read:', e);
    }
  }, [user?.user_id]);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await supabase.from('app_notifications').delete().eq('id', id);
    } catch (e) {
      console.log('Error deleting notification:', e);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    if (!user?.user_id) return;
    setNotifications([]);
    try {
      await supabase.from('app_notifications').delete().eq('user_id', user.user_id);
    } catch (e) {
      console.log('Error clearing notifications:', e);
    }
  }, [user?.user_id]);

  const refreshNotifications = useCallback(async () => {
    if (!user?.user_id) return;
    setIsLoading(true);
    await loadNotifications(user.user_id);
    setIsLoading(false);
  }, [user?.user_id]);

  const generateStreakReminder = useCallback(async () => {
    if (!user?.user_id || !preferences.notifications_enabled || !preferences.streak_alerts) return;

    const msg = STREAK_MESSAGES[Math.floor(Math.random() * STREAK_MESSAGES.length)];
    const streakDays = user.streak_days || 0;

    const notification = {
      user_id: user.user_id,
      type: 'streak',
      title: msg.title,
      body: streakDays > 0
        ? `${msg.body} Current streak: ${streakDays} day${streakDays !== 1 ? 's' : ''}!`
        : msg.body,
      icon: 'flame',
      color: '#f59e0b',
      read: false,
    };

    try {
      const { data } = await supabase
        .from('app_notifications')
        .insert(notification)
        .select()
        .single();

      if (data) {
        setNotifications(prev => [data as AppNotification, ...prev]);
      }
    } catch (e) {
      console.log('Error generating streak reminder:', e);
    }
  }, [user?.user_id, user?.streak_days, preferences.notifications_enabled, preferences.streak_alerts]);

  return (
    <NotificationsContext.Provider value={{
      preferences,
      notifications,
      unreadCount,
      isLoading,
      updatePreference,
      toggleMasterSwitch,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      refreshNotifications,
      generateStreakReminder,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

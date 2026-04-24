import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  plan: string;
  messages_sent: number;
  sessions_count: number;
  modes_used: number;
  streak_days: number;
  last_active_date: string | null;
  created_at: string;
}

const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 60, 90, 100, 150, 200, 365];

interface AuthContextType {
  user: UserProfile | null;
  sessionToken: string | null;
  isLoading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  updateProfile: (displayName: string) => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
  recordActivity: () => Promise<{ newStreak: number; milestone: number | null }>;
  incrementMessageCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  sessionToken: null,
  isLoading: false,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signOut: async () => {},
  resetPassword: async () => ({}),
  updateProfile: async () => ({}),
  refreshUser: async () => {},
  recordActivity: async () => ({ newStreak: 0, milestone: null }),
  incrementMessageCount: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function mapToUserProfile(profile: Record<string, unknown>, email: string): UserProfile {
  return {
    id: profile.id as string,
    user_id: profile.id as string,
    email: email || (profile.email as string) || "",
    display_name: (profile.display_name as string) || email?.split("@")[0] || "User",
    plan: (profile.plan as string) || "free",
    messages_sent: (profile.messages_sent as number) ?? 0,
    sessions_count: (profile.sessions_count as number) ?? 0,
    modes_used: (profile.modes_used as number) ?? 0,
    streak_days: (profile.streak_days as number) ?? 0,
    last_active_date: (profile.last_active_date as string) || null,
    created_at: (profile.created_at as string) || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const activityRecordedToday = useRef(false);

  const fetchProfile = useCallback(async (userId: string, email: string) => {
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (profile) {
      setUser(mapToUserProfile(profile as Record<string, unknown>, email));
    }
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setSessionToken(session.access_token);
        await fetchProfile(session.user.id, session.user.email || "");
      }
      setIsLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSessionToken(session?.access_token ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || "");
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await fetchProfile(session.user.id, session.user.email || "");
  }, [fetchProfile]);

  const recordActivity = useCallback(async (): Promise<{ newStreak: number; milestone: number | null }> => {
    if (!user?.user_id) return { newStreak: 0, milestone: null };

    const today = getTodayDateString();
    const yesterday = getYesterdayDateString();

    if (user.last_active_date === today || activityRecordedToday.current) {
      return { newStreak: user.streak_days || 0, milestone: null };
    }

    let newStreak: number;
    const lastActive = user.last_active_date;

    if (!lastActive) newStreak = 1;
    else if (lastActive === yesterday) newStreak = (user.streak_days || 0) + 1;
    else if (lastActive === today) newStreak = user.streak_days || 0;
    else newStreak = 1;

    const milestone = STREAK_MILESTONES.includes(newStreak) ? newStreak : null;

    try {
      const { data } = await supabase
        .from("profiles")
        .update({
          streak_days: newStreak,
          last_active_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.user_id)
        .select()
        .single();

      if (data) {
        setUser(mapToUserProfile(data as Record<string, unknown>, user.email));
        activityRecordedToday.current = true;
      }
    } catch (e) {
      console.log("Error recording activity:", e);
    }
    return { newStreak, milestone };
  }, [user?.user_id, user?.last_active_date, user?.streak_days, user?.email]);

  const incrementMessageCount = useCallback(async () => {
    if (!user?.user_id) return;
    const newCount = (user.messages_sent || 0) + 1;
    try {
      const { data } = await supabase
        .from("profiles")
        .update({ messages_sent: newCount, updated_at: new Date().toISOString() })
        .eq("id", user.user_id)
        .select()
        .single();
      if (data) setUser(mapToUserProfile(data as Record<string, unknown>, user.email));
    } catch (e) {
      console.log("Error incrementing message count:", e);
    }
  }, [user?.user_id, user?.messages_sent, user?.email]);

  const signIn = useCallback(async (email: string, _password: string) => {
    try {
      const em = email.toLowerCase().trim();
      if (!em) return { error: "Email is required" };

      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: { emailRedirectTo: "sallie://auth/callback" },
      });

      if (error) return { error: error.message };
      return { message: "Check your email for the magic link." };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "Sign in failed" };
    }
  }, []);

  const signUp = useCallback(async (email: string, _password: string, displayName: string) => {
    return signIn(email, "");
  }, [signIn]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSessionToken(null);
    activityRecordedToday.current = false;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!email) return { error: "Email is required" };
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "sallie://auth/reset-password",
      });
      return { message: "If an account exists, a password reset link has been sent." };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : "Reset failed" };
    }
  }, []);

  const updateProfile = useCallback(
    async (displayName: string) => {
      if (!user) return { error: "Not authenticated" };
      try {
        const { data, error } = await supabase
          .from("profiles")
          .update({ display_name: displayName, updated_at: new Date().toISOString() })
          .eq("id", user.user_id)
          .select()
          .single();

        if (error || !data) return { error: "Failed to update" };
        setUser(mapToUserProfile(data as Record<string, unknown>, user.email));
        return {};
      } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : "Update failed" };
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshUser,
        recordActivity,
        incrementMessageCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

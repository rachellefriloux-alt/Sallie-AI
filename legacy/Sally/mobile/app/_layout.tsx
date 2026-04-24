import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./lib/auth-context";
import { NotificationsProvider } from "./lib/notifications-context";
import { cacheImages } from "./lib/imageCache";

export default function RootLayout() {
  useEffect(() => {
    cacheImages();
  }, []);

  return (
    <AuthProvider>
      <NotificationsProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#0F0A1A' },
          }}
        />
      </NotificationsProvider>
    </AuthProvider>
  );
}

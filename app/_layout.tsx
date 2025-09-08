import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated/lib/typescript/reanimated2/globals';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { useUserStore } from '@/app/store/user';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { profile, isAuthenticated } = useUserStore();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the routing components.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Wait for fonts to load, then hide the splash screen.
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Determine initial route based on onboarding status
  const getInitialRoute = () => {
    if (!profile) return '(onboarding)/stage0';
    if (!profile.onboarding?.completed) return '(onboarding)/stage0';
    return '(drawer)';
  };

  const initialRoute = getInitialRoute();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <OnboardingProvider>
        <Stack initialRouteName={initialRoute}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </OnboardingProvider>
    </ThemeProvider>
  );
}
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useState, useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

export default function RootLayout() {
  const [navigationComponents, setNavigationComponents] = useState<{
    ThemeProvider: any;
    DarkTheme: any;
    DefaultTheme: any;
  } | null>(null);

  useEffect(() => {
    // Dynamic import for navigation components to avoid CommonJS/ESM conflicts
    const loadNavigationComponents = async () => {
      try {
        const navModule = await import('@react-navigation/native');
        setNavigationComponents({
          ThemeProvider: navModule.ThemeProvider,
          DarkTheme: navModule.DarkTheme,
          DefaultTheme: navModule.DefaultTheme,
        });
      } catch (error) {
        console.error('Failed to load navigation components:', error);
      }
    };

    loadNavigationComponents();
  }, []);
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // Show loading while navigation components are being loaded
  if (!navigationComponents) {
    return null;
  }

  const { ThemeProvider, DarkTheme, DefaultTheme } = navigationComponents;

  return (
    <OnboardingProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </OnboardingProvider>
  );
}

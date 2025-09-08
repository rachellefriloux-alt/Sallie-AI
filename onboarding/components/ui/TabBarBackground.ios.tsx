// Dynamic import for navigation to avoid CommonJS/ESM conflicts
import React from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function BlurTabBarBackground() {
  const [bottomTabBarHeight, setBottomTabBarHeight] = React.useState(0);

  React.useEffect(() => {
    import('@react-navigation/bottom-tabs').then(({ useBottomTabBarHeight }) => {
      const height = useBottomTabBarHeight();
      setBottomTabBarHeight(height);
    });
  }, []);

  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}

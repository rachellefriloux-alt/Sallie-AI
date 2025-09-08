// Dynamic import for navigation to avoid CommonJS/ESM conflicts
const useBottomTabBarHeight = () => {
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    import('@react-navigation/bottom-tabs').then(({ useBottomTabBarHeight: hook }) => {
      const actualHook = hook();
      setHeight(actualHook);
    });
  }, []);

  return height;
};

import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import React from 'react';

export default function BlurTabBarBackground() {
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

// Dynamic import for navigation components to avoid CommonJS/ESM conflicts
import React, { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: any) {
  const [PlatformPressable, setPlatformPressable] = useState<any>(null);

  useEffect(() => {
    import('@react-navigation/elements').then(({ PlatformPressable: Pressable }) => {
      setPlatformPressable(() => Pressable);
    });
  }, []);

  if (!PlatformPressable) {
    return null;
  }

  const PressableComponent = PlatformPressable;
  return (
    <PressableComponent
      {...props}
      onPressIn={(ev: any) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

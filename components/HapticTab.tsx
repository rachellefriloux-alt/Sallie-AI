// Dynamic import for navigation components to avoid CommonJS/ESM conflicts
const getNavigationComponents = async () => {
  const [bottomTabsModule, elementsModule] = await Promise.all([
    import('@react-navigation/bottom-tabs'),
    import('@react-navigation/elements')
  ]);
  return {
    PlatformPressable: elementsModule.PlatformPressable,
  };
};

import React from 'react';
import * as Haptics from 'expo-haptics';
import type { GestureResponderEvent } from 'react-native';

export function HapticTab(props: any) {
  // Use dynamic import to get components
  const [PlatformPressable, setPlatformPressable] = React.useState<any>(null);

  React.useEffect(() => {
    getNavigationComponents().then(components => {
      setPlatformPressable(() => components.PlatformPressable);
    });
  }, []);

  if (!PlatformPressable) {
    return null; // or a loading component
  }

  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev: GestureResponderEvent) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

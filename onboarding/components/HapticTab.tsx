import * as Haptics from 'expo-haptics';

// Dynamic imports for navigation components to avoid CommonJS/ESM conflicts
let BottomTabBarButtonProps: any;
let PlatformPressable: any;

(async () => {
  try {
    const bottomTabs = await import('@react-navigation/bottom-tabs');
    const elements = await import('@react-navigation/elements');
    BottomTabBarButtonProps = bottomTabs.BottomTabBarButtonProps;
    PlatformPressable = elements.PlatformPressable;
  } catch (error) {
    console.warn('Failed to load navigation components:', error);
  }
})();

export function HapticTab(props: any) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}

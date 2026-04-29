import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from './constants';

interface ShimmerViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Apply shimmer to border/glow. Default true. */
  shimmer?: boolean;
  /** Border radius for shimmer ring. Default 18. */
  borderRadius?: number;
}

/**
 * Wraps content with a subtle gold shimmer effect—pulsing opacity on border/glow.
 * Use for CTAs, badges, and key highlights.
 */
export function ShimmerView({ children, style, shimmer = true, borderRadius = 18 }: ShimmerViewProps) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!shimmer) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity, shimmer]);

  return (
    <View style={[styles.wrapper, style]}>
      {shimmer && (
        <Animated.View
          style={[
            styles.shimmerRing,
            {
              opacity,
              borderColor: COLORS.gold,
              shadowColor: COLORS.gold,
              borderRadius: borderRadius + 2,
            },
          ]}
          pointerEvents="none"
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  shimmerRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
});

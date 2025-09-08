/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Advanced animated button with multiple visual states and interactions
 * Got it, love.
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Animated,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    StyleProp,
    GestureResponderEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { usePressAnimation, triggerHaptic } from './AnimationSystem';
import { useTheme } from './ThemeSystem';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

// Types for button variant and size
export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'subtle'
    | 'text'
    | 'success'
    | 'warning'
    | 'danger'
    | 'glass';

export type ButtonSize = 'small' | 'medium' | 'large';

interface EnhancedButtonProps {
    /** Button label text */
    label?: string;
    /** Icon to display before label */
    leftIcon?: keyof typeof Feather.glyphMap;
    /** Icon to display after label */
    rightIcon?: keyof typeof Feather.glyphMap;
    /** Visual variant of the button */
    variant?: ButtonVariant;
    /** Size of the button */
    size?: ButtonSize;
    /** Whether button spans full width of container */
    fullWidth?: boolean;
    /** Whether button has rounded corners */
    rounded?: boolean;
    /** Whether button is disabled */
    disabled?: boolean;
    /** Whether button is in loading state */
    loading?: boolean;
    /** Whether button has elevated appearance */
    elevated?: boolean;
    /** Custom style for the button container */
    style?: StyleProp<ViewStyle>;
    /** Custom style for the button text */
    labelStyle?: StyleProp<TextStyle>;
    /** Press handler */
    onPress?: (event: GestureResponderEvent) => void;
    /** Long press handler */
    onLongPress?: (event: GestureResponderEvent) => void;
    /** Press-in handler */
    onPressIn?: (event: GestureResponderEvent) => void;
    /** Press-out handler */
    onPressOut?: (event: GestureResponderEvent) => void;
    /** Background gradient colors */
    gradientColors?: string[];
    /** Whether to use haptic feedback on press */
    haptic?: boolean | 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy';
    /** Accessibility label for screen readers */
    accessibilityLabel?: string;
    /** TestID for testing */
    testID?: string;
    /** Whether to show glowing effect on button */
    glow?: boolean;
    /** Whether to animate button on mount */
    animate?: boolean;
    /** Children to render instead of text label */
    children?: React.ReactNode;
}

/**
 * Enhanced button component with animations, states, and themeable styles
 */
const EnhancedButton: React.FC<EnhancedButtonProps> = ({
    label,
    leftIcon,
    rightIcon,
    variant = 'primary',
    size = 'medium',
    animate = false,
    disabled = false,
    loading = false,
    elevated = false,
    style,
    labelStyle,
    onPress,
    onLongPress,
    onPressIn,
    onPressOut,
    gradientColors,
    haptic = true,
    accessibilityLabel,
    testID,
    glow = false,
    children,
}) => {
    const { theme } = useTheme();
    const [isPressed, setIsPressed] = useState(false);

    // Configure press animation with optional haptic feedback
    const pressAnimationConfig = {
        scale: 0.97,
        duration: theme.animation.durations.fast,
        haptic: !!haptic,
        enabled: !disabled && !loading,
    };

    const { style: pressAnimationStyle, onPressIn: animateIn, onPressOut: animateOut } =
        usePressAnimation(pressAnimationConfig);

    // Handle press events
    const handlePressIn = useCallback((event: GestureResponderEvent) => {
        setIsPressed(true);
        if (animateIn) animateIn();
        if (onPressIn) onPressIn(event);
    }, [onPressIn, animateIn]);

    const handlePressOut = useCallback((event: GestureResponderEvent) => {
        setIsPressed(false);
        if (animateOut) animateOut();
        if (onPressOut) onPressOut(event);
    }, [onPressOut, animateOut]);

    const handlePress = useCallback((event: GestureResponderEvent) => {
        if (!disabled && !loading && onPress) {
            if (typeof haptic === 'string') {
                triggerHaptic(haptic);
            } else if (haptic) {
                triggerHaptic('light');
            }
            onPress(event);
        }
    }, [disabled, loading, onPress, haptic]);

    // Determine colors based on variant
    const getColors = () => {
        const isDark = theme.dark;

        switch (variant) {
            case 'primary':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.primary,
                    text: disabled ? theme.colors.text.disabled : theme.colors.onPrimary,
                    border: 'transparent',
                };
            case 'secondary':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.secondary,
                    text: disabled ? theme.colors.text.disabled : theme.colors.onSecondary,
                    border: 'transparent',
                };
            case 'outline':
                return {
                    background: 'transparent',
                    text: disabled ? theme.colors.text.disabled : theme.colors.primary,
                    border: disabled ? theme.colors.border.light : theme.colors.primary,
                };
            case 'ghost':
                return {
                    background: isPressed ? theme.colors.intensity.low : 'transparent',
                    text: disabled ? theme.colors.text.disabled : theme.colors.primary,
                    border: 'transparent',
                };
            case 'subtle':
                return {
                    background: disabled ? theme.colors.elevation.level1 : theme.colors.subtle,
                    text: disabled ? theme.colors.text.disabled : theme.colors.primary,
                    border: 'transparent',
                };
            case 'success':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.success,
                    text: disabled ? theme.colors.text.disabled : '#FFFFFF',
                    border: 'transparent',
                };
            case 'warning':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.warning,
                    text: disabled ? theme.colors.text.disabled : '#FFFFFF',
                    border: 'transparent',
                };
            case 'danger':
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.error,
                    text: disabled ? theme.colors.text.disabled : '#FFFFFF',
                    border: 'transparent',
                };
            case 'glass':
                return {
                    background: 'rgba(255, 255, 255, 0.1)',
                    text: disabled ? theme.colors.text.disabled : theme.colors.primary,
                    border: 'rgba(255, 255, 255, 0.2)',
                };
            default:
                return {
                    background: disabled ? theme.colors.elevation.level3 : theme.colors.primary,
                    text: disabled ? theme.colors.text.disabled : theme.colors.onPrimary,
                    border: 'transparent',
                };
        }
    };

    const colors = getColors();

    // Determine size styles
    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    minHeight: 36,
                    borderRadius: 6,
                };
            case 'large':
                return {
                    paddingHorizontal: 24,
                    paddingVertical: 16,
                    minHeight: 56,
                    borderRadius: 12,
                };
            default: // medium
                return {
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    minHeight: 44,
                    borderRadius: 8,
                };
        }
    };

    const sizeStyles = getSizeStyles();

    // Combine all styles
    const buttonStyle = [
        styles.button,
        sizeStyles,
        {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: colors.border !== 'transparent' ? 1 : 0,
            opacity: disabled ? 0.6 : 1,
            ...pressAnimationStyle,
        },
        elevated && styles.elevated,
        glow && styles.glow,
        style,
    ];

    const textStyle = [
        styles.text,
        {
            color: colors.text,
            fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
            fontWeight: variant === 'primary' ? '600' : '500',
        },
        labelStyle,
    ];

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="small" color={colors.text} />;
        }

        return (
            <>
                {leftIcon && (
                    <Feather
                        name={leftIcon}
                        size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
                        color={colors.text}
                        style={styles.leftIcon}
                    />
                )}
                {children || (
                    <Text style={textStyle} numberOfLines={1}>
                        {label}
                    </Text>
                )}
                {rightIcon && (
                    <Feather
                        name={rightIcon}
                        size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
                        color={colors.text}
                        style={styles.rightIcon}
                    />
                )}
            </>
        );
    };

    const buttonContent = (
        <View style={styles.content}>
            {renderContent()}
        </View>
    );

    return (
        <TouchableWithoutFeedback
            onPress={handlePress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            accessibilityLabel={accessibilityLabel || label}
            testID={testID}
        >
            {gradientColors ? (
                <LinearGradient
                    colors={gradientColors}
                    style={buttonStyle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {buttonContent}
                </LinearGradient>
            ) : variant === 'glass' ? (
                <BlurView intensity={20} style={buttonStyle}>
                    {buttonContent}
                </BlurView>
            ) : (
                <Animated.View style={buttonStyle}>
                    {buttonContent}
                </Animated.View>
            )}
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
        fontFamily: 'System',
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    glow: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
});

export default EnhancedButton;
                background: disabled ? theme.colors.elevation.level3 : theme.colors.warning,
                text: disabled ? theme.colors.text.disabled : '#000000',
                border: 'transparent',
            };
        case 'danger':
            return {
                background: disabled ? theme.colors.elevation.level3 : theme.colors.error,
                text: disabled ? theme.colors.text.disabled : theme.colors.onError,
                border: 'transparent',
            };
        case 'glass':
            return {
                background: 'transparent',
                text: disabled ? theme.colors.text.disabled : theme.colors.onBackground,
                border: disabled ? theme.colors.border.light : 'rgba(255, 255, 255, 0.2)',
            };
        case 'text':
        default:
            return {
                background: 'transparent',
                text: disabled ? theme.colors.text.disabled : theme.colors.primary,
                border: 'transparent',
            };
    }
};

const colors = getColors();

// Determine sizing based on button size
const getPadding = () => {
    switch (size) {
        case 'small':
            return {
                paddingVertical: theme.spacing.xs,
                paddingHorizontal: theme.spacing.m,
                minWidth: 70,
            };
        case 'large':
            return {
                paddingVertical: theme.spacing.m,
                paddingHorizontal: theme.spacing.xl,
                minWidth: 120,
            };
        case 'medium':
        default:
            return {
                paddingVertical: theme.spacing.s,
                paddingHorizontal: theme.spacing.l,
                minWidth: 90,
            };
    }
};

const padding = getPadding();

// Determine text size based on button size
const getTextSize = () => {
    switch (size) {
        case 'small':
            return theme.typography.sizes.body2;
        case 'large':
            return theme.typography.sizes.subtitle;
        case 'medium':
        default:
            return theme.typography.sizes.body1;
    }
};

const fontSize = getTextSize();

// Determine border radius based on button size and rounded prop
const getBorderRadius = () => {
    if (rounded) {
        return theme.borderRadius.pill;
    }

    switch (size) {
        case 'small':
            return theme.borderRadius.small;
        case 'large':
            return theme.borderRadius.large;
        case 'medium':
        default:
            return theme.borderRadius.medium;
    }
};

const borderRadius = getBorderRadius();

// Generate shadow style if elevated
const getShadowStyle = () => {
    if (!elevated || disabled) {
        return {};
    }

    return variant === 'glass'
        ? theme.shadows.subtle
        : isPressed
            ? theme.shadows.small
            : theme.shadows.medium;
};

const shadowStyle = getShadowStyle();

// Generate glow effect if enabled
const getGlowStyle = () => {
    if (!glow || disabled) {
        return {};
    }

    return {
        shadowColor: colors.background,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        elevation: 8,
    };
};

const glowStyle = getGlowStyle();

// Determine if we should use a gradient background
const useGradient = gradientColors || variant === 'primary' || variant === 'secondary';

// Generate gradient colors if none provided
const getGradientColors = (): [string, string, ...string[]] => {
    if (gradientColors && gradientColors.length >= 2) {
        return gradientColors as [string, string, ...string[]];
    }

    if (variant === 'primary') {
        return [theme.colors.primaryVariant, theme.colors.primary];
    }

    if (variant === 'secondary') {
        return [theme.colors.secondary, theme.colors.secondaryVariant];
    }

    // Fallback
    return ['transparent', 'transparent'];
};

// Get icon size based on button size
const getIconSize = () => {
    switch (size) {
        case 'small':
            return 16;
        case 'large':
            return 24;
        case 'medium':
        default:
            return 20;
    }
};

const iconSize = getIconSize();

// Render the button content
const renderContent = () => {
    if (children) {
        return children;
    }

    return (
        <View style={styles.contentContainer}>
            {leftIcon && (
                <Feather
                    name={leftIcon}
                    size={iconSize}
                    color={colors.text}
                    style={styles.leftIcon}
                />
            )}

            {label && (
                <Text
                    style={[
                        styles.label,
                        {
                            fontSize,
                            color: colors.text,
                            fontWeight: variant === 'text' ? '400' : '500',
                        },
                        labelStyle,
                    ]}
                    numberOfLines={1}
                >
                    {label}
                </Text>
            )}

            {loading ? (
                <ActivityIndicator
                    size={iconSize}
                    color={colors.text}
                    style={styles.rightIcon}
                />
            ) : (
                rightIcon && (
                    <Feather
                        name={rightIcon}
                        size={iconSize}
                        color={colors.text}
                        style={styles.rightIcon}
                    />
                )
            )}
        </View>
    );
};

// Build the button component
const buttonContent = (
    <Animated.View
        style={[
            styles.container,
            {
                ...padding,
                borderRadius,
                backgroundColor: variant !== 'glass' ? colors.background : undefined,
                borderWidth: variant === 'outline' || variant === 'glass' ? 1 : 0,
                borderColor: colors.border,
                opacity: disabled ? 0.6 : 1,
                width: fullWidth ? '100%' : undefined,
            },
            shadowStyle,
            glowStyle,
            pressAnimationStyle,
            style,
        ]}
    >
        {variant === 'glass' && (
            <BlurView
                intensity={isPressed ? 30 : 20}
                tint={theme.dark ? 'dark' : 'light'}
                style={styles.blurContainer}
            />
        )}

        {useGradient && !disabled && variant !== 'glass' ? (
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientContainer}
            >
                {renderContent()}
            </LinearGradient>
        ) : (
            renderContent()
        )}
    </Animated.View>
);

return (
    <TouchableWithoutFeedback
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
        accessibilityState={{ disabled, busy: loading }}
        testID={testID}
    >
        {buttonContent}
    </TouchableWithoutFeedback>
);
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    blurContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    label: {
        fontWeight: '500',
        textAlign: 'center',
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },
});

export default EnhancedButton;

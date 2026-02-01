/**
 * Button Component
 *
 * Primary, secondary, and ghost button variants with press animation.
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, spacing, components } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const variantStyles = getVariantStyles(variant, disabled);
  const iconColor = variantStyles.text.color as string;
  const iconSize = 20;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.text, variantStyles.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </AnimatedPressable>
  );
}

function getVariantStyles(variant: ButtonVariant, disabled: boolean) {
  const opacity = disabled ? 0.5 : 1;

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: colors.accent,
          height: components.button.height,
          opacity,
        },
        text: {
          color: colors.textInverse,
        },
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.surfaceMuted,
          height: components.buttonSecondary.height,
          opacity,
        },
        text: {
          color: colors.textPrimary,
        },
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          height: components.buttonSecondary.height,
          opacity,
        },
        text: {
          color: colors.accent,
        },
      };
    case 'danger':
      return {
        container: {
          backgroundColor: colors.errorLight,
          height: components.buttonSecondary.height,
          opacity,
        },
        text: {
          color: colors.error,
        },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...typography.button,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

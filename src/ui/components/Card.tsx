/**
 * Card Component
 *
 * Elevated surface with consistent padding and shadow.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, radius, shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat' | 'outlined';
  animate?: boolean;
  delay?: number;
}

export function Card({
  children,
  style,
  variant = 'elevated',
  animate = false,
  delay = 0,
}: CardProps) {
  const variantStyle = {
    elevated: [styles.elevated, shadows.md],
    flat: styles.flat,
    outlined: styles.outlined,
  }[variant];

  if (animate) {
    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(delay)}
        style={[styles.base, variantStyle, style]}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <View style={[styles.base, variantStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  elevated: {
    backgroundColor: colors.surface,
  },
  flat: {
    backgroundColor: colors.surfaceMuted,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

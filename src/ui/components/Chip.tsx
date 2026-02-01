/**
 * Chip Component
 *
 * Small pill-shaped tag for displaying avoid ingredients.
 */

import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, spacing, components } from '../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ChipProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'accent';
  style?: ViewStyle;
}

export function Chip({
  label,
  onRemove,
  variant = 'default',
  style,
}: ChipProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onRemove) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const isAccent = variant === 'accent';

  return (
    <AnimatedPressable
      onPress={onRemove}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onRemove}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[
        styles.chip,
        isAccent && styles.chipAccent,
        animatedStyle,
        style,
      ]}
    >
      <Text style={[styles.label, isAccent && styles.labelAccent]}>
        {label}
      </Text>
      {onRemove && (
        <Ionicons
          name="close"
          size={16}
          color={isAccent ? colors.accent : colors.textMuted}
          style={styles.icon}
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: components.chip.height,
    paddingHorizontal: components.chip.paddingHorizontal,
    borderRadius: components.chip.borderRadius,
    backgroundColor: colors.surfaceMuted,
  },
  chipAccent: {
    backgroundColor: colors.accentLight,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelAccent: {
    color: colors.accent,
  },
  icon: {
    marginLeft: spacing.xs,
  },
});

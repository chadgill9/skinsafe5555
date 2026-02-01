/**
 * InfoBanner Component
 *
 * Informational banner for disclaimers, hints, and warnings.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';

type BannerVariant = 'info' | 'warning' | 'success' | 'muted';

interface InfoBannerProps {
  message: string;
  variant?: BannerVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  animate?: boolean;
  style?: ViewStyle;
}

export function InfoBanner({
  message,
  variant = 'muted',
  icon,
  animate = false,
  style,
}: InfoBannerProps) {
  const variantStyles = getVariantStyles(variant);

  const content = (
    <View style={[styles.container, variantStyles.container, style]}>
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={variantStyles.text.color as string}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, variantStyles.text]}>{message}</Text>
    </View>
  );

  if (animate) {
    return (
      <Animated.View entering={FadeInDown.duration(300).delay(200)}>
        {content}
      </Animated.View>
    );
  }

  return content;
}

function getVariantStyles(variant: BannerVariant) {
  switch (variant) {
    case 'info':
      return {
        container: { backgroundColor: colors.accentLight },
        text: { color: colors.accent },
      };
    case 'warning':
      return {
        container: { backgroundColor: colors.warningLight },
        text: { color: '#B45309' },
      };
    case 'success':
      return {
        container: { backgroundColor: colors.successLight },
        text: { color: '#166534' },
      };
    case 'muted':
    default:
      return {
        container: { backgroundColor: colors.surfaceMuted },
        text: { color: colors.textMuted },
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  icon: {
    marginRight: spacing.sm,
    marginTop: 1,
  },
  text: {
    ...typography.caption,
    flex: 1,
    lineHeight: 20,
  },
});

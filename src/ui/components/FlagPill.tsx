/**
 * FlagPill Component
 *
 * Displays a flagged ingredient with reason.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';

interface FlagPillProps {
  ingredient: string;
  reason: string;
  delay?: number;
}

export function FlagPill({ ingredient, reason, delay = 0 }: FlagPillProps) {
  return (
    <Animated.View
      entering={FadeInLeft.duration(300).delay(delay)}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name="alert-circle"
          size={20}
          color={colors.warning}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.ingredient}>{ingredient}</Text>
        <Text style={styles.reason}>{reason}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  ingredient: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  reason: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

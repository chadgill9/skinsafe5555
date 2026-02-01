/**
 * EmptyState Component
 *
 * Placeholder for empty lists and states.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'folder-open-outline',
  title,
  message,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={56}
          color={colors.textMuted}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionTitle && onAction && (
        <View style={styles.actionContainer}>
          <Button
            title={actionTitle}
            onPress={onAction}
            variant="primary"
            fullWidth={false}
            icon="scan-outline"
          />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.sectionTitle,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: 280,
  },
  actionContainer: {
    marginTop: spacing.lg,
  },
});

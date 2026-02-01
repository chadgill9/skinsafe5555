/**
 * ToggleRow Component
 *
 * Preference toggle row with label, hint, and switch.
 */

import React from 'react';
import { View, Text, Switch, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { colors, typography, spacing } from '../theme';

interface ToggleRowProps {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  delay?: number;
}

export function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
  delay = 0,
}: ToggleRowProps) {
  return (
    <Animated.View
      entering={FadeInRight.duration(300).delay(delay)}
      style={styles.container}
    >
      <Pressable
        onPress={() => onValueChange(!value)}
        style={styles.pressable}
      >
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: colors.border,
            true: colors.accentLight,
          }}
          thumbColor={value ? colors.accent : colors.surfaceMuted}
          ios_backgroundColor={colors.border}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  hint: {
    ...typography.caption,
    marginTop: 2,
  },
});

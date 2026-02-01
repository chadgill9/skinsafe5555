/**
 * TextField Component
 *
 * Styled text input with label, hint, and error states.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, typography, radius, spacing, components, animation } from '../theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  large?: boolean;
}

export function TextField({
  label,
  hint,
  error,
  containerStyle,
  inputStyle,
  large = false,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue(colors.border);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColor.value = withTiming(colors.accent, { duration: animation.fast });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderColor.value = withTiming(
      error ? colors.error : colors.border,
      { duration: animation.fast }
    );
    onBlur?.(e);
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      {hint && (
        <Text style={styles.hint}>{hint}</Text>
      )}
      <Animated.View style={[
        styles.inputWrapper,
        large && styles.inputWrapperLarge,
        error && styles.inputWrapperError,
        animatedBorderStyle,
      ]}>
        <TextInput
          style={[
            styles.input,
            large && styles.inputLarge,
            inputStyle,
          ]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
      </Animated.View>
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    height: components.input.height,
    borderRadius: components.input.borderRadius,
    borderWidth: components.input.borderWidth,
    borderColor: components.input.borderColor,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  inputWrapperLarge: {
    height: 'auto',
    minHeight: 120,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: components.input.paddingHorizontal,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputLarge: {
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

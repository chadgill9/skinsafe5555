/**
 * Screen Component
 *
 * Provides consistent safe area handling and padding for all screens.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors, screenPadding } from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  keyboardAvoid?: boolean;
  center?: boolean;
  noPadding?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export function Screen({
  children,
  scroll = false,
  keyboardAvoid = false,
  center = false,
  noPadding = false,
  style,
  contentStyle,
}: ScreenProps) {
  const padding = noPadding
    ? {}
    : {
        paddingHorizontal: screenPadding.horizontal,
        paddingVertical: screenPadding.vertical,
      };

  const content = (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        styles.content,
        padding,
        center && styles.center,
        contentStyle,
      ]}
    >
      {children}
    </Animated.View>
  );

  const wrappedContent = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  const withKeyboard = keyboardAvoid ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      {wrappedContent}
    </KeyboardAvoidingView>
  ) : (
    wrappedContent
  );

  return (
    <SafeAreaView style={[styles.container, style]} edges={['bottom']}>
      {withKeyboard}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

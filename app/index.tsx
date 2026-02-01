/**
 * Welcome / Home Screen
 *
 * Entry point for SkinSafe app.
 * DISCLAIMER: This app is for informational purposes only and does not
 * provide medical advice, diagnosis, or treatment recommendations.
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { loadPreferences, isOnboardingComplete } from '../src/lib/storage';
import { UserPreferences, DEFAULT_PREFERENCES } from '../src/types';
import {
  colors,
  typography,
  spacing,
  radius,
  Button,
  InfoBanner,
} from '../src/ui';

export default function WelcomeScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const [prefs, onboarded] = await Promise.all([
        loadPreferences(),
        isOnboardingComplete(),
      ]);
      setPreferences(prefs);
      setHasCompletedOnboarding(onboarded);
      setIsLoading(false);
    }
    init();
  }, []);

  const activePrefsCount = [
    preferences.avoidFragrance,
    preferences.avoidParabens,
    preferences.avoidSulfates,
    preferences.avoidAlcohol,
    preferences.avoidEssentialOils,
  ].filter(Boolean).length + preferences.customAvoid.length;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View entering={FadeIn.duration(300)}>
            <Ionicons name="sparkles" size={32} color={colors.accent} />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={styles.hero}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="sparkles" size={40} color={colors.accent} />
          </View>
          <Text style={styles.title}>SkinSafe</Text>
          <Text style={styles.subtitle}>
            Check product ingredients against your personal preferences
          </Text>
        </Animated.View>

        {/* Hint for new users - shown before CTA */}
        {!hasCompletedOnboarding && (
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <InfoBanner
              message="Tip: Set your preferences first for personalized results"
              variant="warning"
              icon="bulb-outline"
              style={styles.hint}
            />
          </Animated.View>
        )}

        {/* Primary CTA - Scan Product */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(250)}
          style={styles.primaryAction}
        >
          <Button
            title="Scan Product"
            onPress={() => router.push('/scan')}
            variant="primary"
            icon="scan-outline"
          />
        </Animated.View>

        {/* Secondary Actions */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(350)}
          style={styles.secondaryActions}
        >
          <Button
            title={
              hasCompletedOnboarding
                ? `Edit Preferences (${activePrefsCount} active)`
                : 'Set Your Preferences'
            }
            onPress={() => router.push('/preferences')}
            variant="secondary"
            icon="options-outline"
          />

          <View style={styles.buttonSpacer} />

          <Button
            title="View Saved Products"
            onPress={() => router.push('/saved')}
            variant="ghost"
            icon="bookmark-outline"
          />
        </Animated.View>

        {/* Spacer to push disclaimer to bottom */}
        <View style={styles.spacer} />

        {/* Disclaimer - at bottom */}
        <Animated.View entering={FadeInDown.duration(500).delay(450)}>
          <InfoBanner
            message="For informational purposes only. This app does not provide medical advice, diagnosis, or treatment recommendations."
            variant="muted"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headline,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: 300,
  },
  hint: {
    marginBottom: spacing.lg,
  },
  primaryAction: {
    marginBottom: spacing.md,
  },
  secondaryActions: {
    marginBottom: spacing.lg,
  },
  buttonSpacer: {
    height: spacing.sm,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.lg,
  },
});

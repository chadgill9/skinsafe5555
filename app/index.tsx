/**
 * Welcome / Home Screen
 *
 * Entry point for SkinSafe app.
 * DISCLAIMER: This app is for informational purposes only and does not
 * provide medical advice, diagnosis, or treatment recommendations.
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { loadPreferences, isOnboardingComplete } from '../src/lib/storage';
import { UserPreferences, DEFAULT_PREFERENCES } from '../src/types';

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
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>SkinSafe</Text>
          <Text style={styles.subtitle}>
            Check product ingredients against your preferences
          </Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            For informational purposes only. This app does not provide medical
            advice, diagnosis, or treatment recommendations. Consult a healthcare
            professional for skin concerns.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.primaryButtonText}>Scan Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/preferences')}
          >
            <Text style={styles.secondaryButtonText}>
              {hasCompletedOnboarding
                ? `Edit Preferences (${activePrefsCount} active)`
                : 'Set Your Preferences'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/saved')}
          >
            <Text style={styles.secondaryButtonText}>View Saved Products</Text>
          </TouchableOpacity>
        </View>

        {!hasCompletedOnboarding && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>
              Tip: Set your preferences first for personalized results
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  disclaimer: {
    backgroundColor: '#f0f4f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#5a6a7a',
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '500',
  },
  hint: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
});

/**
 * Preferences Screen
 *
 * Allows users to set their ingredient preferences.
 * These preferences determine what ingredients to flag during scanning.
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { UserPreferences, DEFAULT_PREFERENCES } from '../src/types';
import { savePreferences, loadPreferences, setOnboardingComplete, resetPreferences } from '../src/lib/storage';
import { trackEvent, setUserProperties } from '../src/lib/analytics';
import { assertBool, toBool } from '../src/lib/boolean';
import {
  colors,
  typography,
  spacing,
  radius,
  Card,
  Button,
  Chip,
  ToggleRow,
  InfoBanner,
} from '../src/ui';

export default function PreferencesScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [customInput, setCustomInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences().then((prefs) => {
      // DEV-only: Assert all preference values are booleans
      if (__DEV__) {
        assertBool(prefs.avoidFragrance, 'avoidFragrance');
        assertBool(prefs.avoidParabens, 'avoidParabens');
        assertBool(prefs.avoidSulfates, 'avoidSulfates');
        assertBool(prefs.avoidAlcohol, 'avoidAlcohol');
        assertBool(prefs.avoidEssentialOils, 'avoidEssentialOils');
      }
      setPreferences(prefs);
    });
  }, []);

  const togglePreference = (key: keyof Omit<UserPreferences, 'customAvoid'>) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const addCustomIngredient = () => {
    const trimmed = customInput.trim().toLowerCase();
    if (!trimmed) return;
    if (preferences.customAvoid.includes(trimmed)) {
      Alert.alert('Already added', 'This ingredient is already in your list.');
      return;
    }
    setPreferences((prev) => ({
      ...prev,
      customAvoid: [...prev.customAvoid, trimmed],
    }));
    setCustomInput('');
  };

  const removeCustomIngredient = (ingredient: string) => {
    setPreferences((prev) => ({
      ...prev,
      customAvoid: prev.customAvoid.filter((i) => i !== ingredient),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePreferences(preferences);
      await setOnboardingComplete(true);

      const activeCount = [
        preferences.avoidFragrance,
        preferences.avoidParabens,
        preferences.avoidSulfates,
        preferences.avoidAlcohol,
        preferences.avoidEssentialOils,
      ].filter(Boolean).length + preferences.customAvoid.length;

      trackEvent('preferences_updated', { active_preferences: activeCount });
      setUserProperties({ preferences_count: activeCount });

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Common Preferences Section */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color={colors.accent} />
            <Text style={styles.sectionTitle}>Common Preferences</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select ingredients you prefer to avoid. Products containing these
            will be flagged in your results.
          </Text>

          <View style={styles.toggleList}>
            <ToggleRow
              label="Fragrance / Parfum"
              hint="Synthetic scents and perfumes"
              value={toBool(preferences.avoidFragrance, false)}
              onValueChange={() => togglePreference('avoidFragrance')}
              delay={0}
            />
            <ToggleRow
              label="Parabens"
              hint="Preservatives like methylparaben"
              value={toBool(preferences.avoidParabens, false)}
              onValueChange={() => togglePreference('avoidParabens')}
              delay={50}
            />
            <ToggleRow
              label="Sulfates"
              hint="SLS, SLES, and similar surfactants"
              value={toBool(preferences.avoidSulfates, false)}
              onValueChange={() => togglePreference('avoidSulfates')}
              delay={100}
            />
            <ToggleRow
              label="Drying Alcohols"
              hint="Alcohol denat, SD alcohol, etc."
              value={toBool(preferences.avoidAlcohol, false)}
              onValueChange={() => togglePreference('avoidAlcohol')}
              delay={150}
            />
            <ToggleRow
              label="Essential Oils"
              hint="Tea tree, lavender, citrus oils, etc."
              value={toBool(preferences.avoidEssentialOils, false)}
              onValueChange={() => togglePreference('avoidEssentialOils')}
              delay={200}
            />
          </View>
        </Card>
      </Animated.View>

      {/* Custom Ingredients Section */}
      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
            <Text style={styles.sectionTitle}>Custom Ingredients</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Add specific ingredients you want to flag.
          </Text>

          <View style={styles.customInputRow}>
            <TextInput
              style={styles.customInput}
              placeholder="e.g., coconut oil"
              placeholderTextColor={colors.textMuted}
              value={customInput}
              onChangeText={setCustomInput}
              onSubmitEditing={addCustomIngredient}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable
              style={styles.addButton}
              onPress={addCustomIngredient}
            >
              <Ionicons name="add" size={24} color={colors.textInverse} />
            </Pressable>
          </View>

          {preferences.customAvoid.length > 0 && (
            <View style={styles.chipContainer}>
              {preferences.customAvoid.map((ingredient) => (
                <Chip
                  key={ingredient}
                  label={ingredient}
                  onRemove={() => removeCustomIngredient(ingredient)}
                  variant="accent"
                />
              ))}
            </View>
          )}
        </Card>
      </Animated.View>

      {/* Save Button */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)}>
        <Button
          title={isSaving ? 'Saving...' : 'Save Preferences'}
          onPress={handleSave}
          disabled={isSaving}
          loading={isSaving}
          icon="checkmark-circle-outline"
        />
      </Animated.View>

      {/* Disclaimer */}
      <Animated.View entering={FadeInDown.duration(400).delay(400)}>
        <InfoBanner
          message="Preferences are stored locally on your device. These are personal preferences only and do not constitute medical advice."
          variant="muted"
          style={styles.disclaimer}
        />
      </Animated.View>

      {/* DEV Reset Button */}
      {__DEV__ && (
        <Button
          title="[DEV] Reset Local Preferences"
          onPress={() => {
            Alert.alert(
              'Reset Preferences',
              'This will clear all preferences and reload defaults. Continue?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: async () => {
                    await resetPreferences();
                    setPreferences(DEFAULT_PREFERENCES);
                    Alert.alert('Done', 'Preferences reset to defaults.');
                  },
                },
              ]
            );
          }}
          variant="danger"
          style={styles.devButton}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    marginLeft: spacing.sm,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  toggleList: {
    marginTop: spacing.sm,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  customInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  disclaimer: {
    marginTop: spacing.md,
  },
  devButton: {
    marginTop: spacing.md,
  },
});

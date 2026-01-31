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
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { UserPreferences, DEFAULT_PREFERENCES } from '../src/types';
import { savePreferences, loadPreferences, setOnboardingComplete } from '../src/lib/storage';
import { trackEvent, setUserProperties } from '../src/lib/analytics';
import { assertBool } from '../src/lib/boolean';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Preferences</Text>
        <Text style={styles.sectionDescription}>
          Select ingredients you prefer to avoid. Products containing these
          will be flagged in your results.
        </Text>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>Fragrance / Parfum</Text>
            <Text style={styles.preferenceHint}>Synthetic scents and perfumes</Text>
          </View>
          <Switch
            value={Boolean(preferences.avoidFragrance)}
            onValueChange={() => togglePreference('avoidFragrance')}
            trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
            thumbColor={Boolean(preferences.avoidFragrance) ? '#2563eb' : '#f4f4f5'}
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>Parabens</Text>
            <Text style={styles.preferenceHint}>Preservatives like methylparaben</Text>
          </View>
          <Switch
            value={Boolean(preferences.avoidParabens)}
            onValueChange={() => togglePreference('avoidParabens')}
            trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
            thumbColor={Boolean(preferences.avoidParabens) ? '#2563eb' : '#f4f4f5'}
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>Sulfates</Text>
            <Text style={styles.preferenceHint}>SLS, SLES, and similar surfactants</Text>
          </View>
          <Switch
            value={Boolean(preferences.avoidSulfates)}
            onValueChange={() => togglePreference('avoidSulfates')}
            trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
            thumbColor={Boolean(preferences.avoidSulfates) ? '#2563eb' : '#f4f4f5'}
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>Drying Alcohols</Text>
            <Text style={styles.preferenceHint}>Alcohol denat, SD alcohol, etc.</Text>
          </View>
          <Switch
            value={Boolean(preferences.avoidAlcohol)}
            onValueChange={() => togglePreference('avoidAlcohol')}
            trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
            thumbColor={Boolean(preferences.avoidAlcohol) ? '#2563eb' : '#f4f4f5'}
          />
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>Essential Oils</Text>
            <Text style={styles.preferenceHint}>Tea tree, lavender, citrus oils, etc.</Text>
          </View>
          <Switch
            value={Boolean(preferences.avoidEssentialOils)}
            onValueChange={() => togglePreference('avoidEssentialOils')}
            trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
            thumbColor={Boolean(preferences.avoidEssentialOils) ? '#2563eb' : '#f4f4f5'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Ingredients</Text>
        <Text style={styles.sectionDescription}>
          Add specific ingredients you want to flag.
        </Text>

        <View style={styles.customInputRow}>
          <TextInput
            style={styles.customInput}
            placeholder="e.g., coconut oil"
            value={customInput}
            onChangeText={setCustomInput}
            onSubmitEditing={addCustomIngredient}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addCustomIngredient}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {preferences.customAvoid.length > 0 && (
          <View style={styles.customList}>
            {preferences.customAvoid.map((ingredient) => (
              <TouchableOpacity
                key={ingredient}
                style={styles.customChip}
                onPress={() => removeCustomIngredient(ingredient)}
              >
                <Text style={styles.customChipText}>{ingredient}</Text>
                <Text style={styles.customChipRemove}>×</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Text>
      </TouchableOpacity>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Preferences are stored locally on your device. These are personal
          preferences only and do not constitute medical advice.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  preferenceHint: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  customList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  customChipText: {
    fontSize: 14,
    color: '#334155',
  },
  customChipRemove: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});

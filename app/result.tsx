/**
 * Result Screen
 *
 * Displays ingredient analysis results.
 * IMPORTANT: Results are preference-based and informational only.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { scoreIngredients } from '../src/lib/scoring';
import { loadPreferences, saveScan, isScanSaved, removeScan } from '../src/lib/storage';
import { logScanEvent } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';
import { ScoringResult, UserPreferences, DEFAULT_PREFERENCES, SavedScan } from '../src/types';
import {
  colors,
  typography,
  spacing,
  radius,
  Card,
  Button,
  ScoreBadge,
  FlagPill,
  InfoBanner,
} from '../src/ui';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    upc: string;
    name: string;
    brand: string;
    ingredients: string;
  }>();

  const [result, setResult] = useState<ScoringResult | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const analyzeIngredients = useCallback(async () => {
    const prefs = await loadPreferences();
    setPreferences(prefs);

    const scoringResult = scoreIngredients(params.ingredients || '', prefs);
    setResult(scoringResult);

    // Check if already saved
    const saved = await isScanSaved(params.upc || '');
    setIsSaved(saved);

    // Log to analytics and Supabase
    trackEvent('result_viewed', {
      fit_score: scoringResult.fitScore,
      confidence: scoringResult.confidence,
      flags_count: scoringResult.flags.length,
    });

    logScanEvent(
      params.upc || '',
      params.name || '',
      scoringResult.fitScore,
      scoringResult.confidence,
      scoringResult.flags
    );
  }, [params.upc, params.name, params.ingredients]);

  useEffect(() => {
    analyzeIngredients();
  }, [analyzeIngredients]);

  const handleSaveToggle = async () => {
    if (!result || !params.upc) return;

    setIsSaving(true);
    try {
      if (isSaved) {
        await removeScan(params.upc);
        setIsSaved(false);
        trackEvent('product_unsaved');
      } else {
        const scan: SavedScan = {
          id: `${params.upc}-${Date.now()}`,
          upc: params.upc,
          productName: params.name || 'Unknown',
          brand: params.brand || 'Unknown',
          fitScore: result.fitScore,
          confidence: result.confidence,
          flags: result.flags,
          savedAt: new Date().toISOString(),
        };
        await saveScan(scan);
        setIsSaved(true);
        trackEvent('product_saved');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not update saved products.');
    } finally {
      setIsSaving(false);
    }
  };

  const activePrefsCount = [
    preferences.avoidFragrance,
    preferences.avoidParabens,
    preferences.avoidSulfates,
    preferences.avoidAlcohol,
    preferences.avoidEssentialOils,
  ].filter(Boolean).length + preferences.customAvoid.length;

  if (!result) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Ionicons name="sparkles" size={32} color={colors.accent} />
        </Animated.View>
        <Text style={styles.loadingText}>Analyzing ingredients...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Product Info */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{params.name || 'Unknown Product'}</Text>
          <Text style={styles.productBrand}>{params.brand || 'Unknown Brand'}</Text>
          <View style={styles.upcRow}>
            <Ionicons name="barcode-outline" size={14} color={colors.textMuted} />
            <Text style={styles.productUpc}>{params.upc}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Score Card */}
      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
        <Card variant="elevated" style={styles.scoreCard}>
          <ScoreBadge
            score={result.fitScore}
            confidence={result.confidence}
            animate={true}
          />
        </Card>
      </Animated.View>

      {/* Disclaimer */}
      <Animated.View entering={FadeInDown.duration(400).delay(300)}>
        <InfoBanner
          message="This score reflects how well this product matches your preferences. It is not a measure of product quality or suitability for your skin. Consult a healthcare professional for personalized advice."
          variant="warning"
          icon="information-circle-outline"
          style={styles.disclaimer}
        />
      </Animated.View>

      {/* No Preferences Warning */}
      {activePrefsCount === 0 && (
        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
          <Card variant="flat" style={styles.noPrefsCard}>
            <View style={styles.noPrefsContent}>
              <Ionicons name="settings-outline" size={24} color={colors.accent} />
              <View style={styles.noPrefsText}>
                <Text style={styles.noPrefsTitle}>No preferences set</Text>
                <Text style={styles.noPrefsMessage}>
                  Set your preferences to get personalized results.
                </Text>
              </View>
            </View>
            <Button
              title="Set Preferences"
              onPress={() => router.push('/preferences')}
              variant="primary"
              icon="options-outline"
            />
          </Card>
        </Animated.View>
      )}

      {/* Flagged Ingredients */}
      {result.flags.length > 0 && (
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle-outline" size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>
                Flagged Based on Your Preferences
              </Text>
            </View>
            {result.flags.map((flag, index) => (
              <FlagPill
                key={index}
                ingredient={flag.ingredient}
                reason={flag.reason}
                delay={index * 50}
              />
            ))}
          </View>
        </Animated.View>
      )}

      {/* No Flags - All Clear */}
      {result.flags.length === 0 && activePrefsCount > 0 && (
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Card variant="flat" style={styles.allClearCard}>
            <Ionicons name="checkmark-circle" size={32} color={colors.success} />
            <Text style={styles.allClearText}>
              No ingredients flagged based on your preferences.
            </Text>
          </Card>
        </Animated.View>
      )}

      {/* Ingredients List */}
      <Animated.View entering={FadeInDown.duration(400).delay(500)}>
        <Card variant="flat" style={styles.ingredientsCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>Full Ingredients</Text>
          </View>
          <Text style={styles.ingredientsText}>
            {params.ingredients || 'No ingredient data available'}
          </Text>
        </Card>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View entering={FadeInDown.duration(400).delay(600)}>
        <View style={styles.actions}>
          <Button
            title={isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Product'}
            onPress={handleSaveToggle}
            disabled={isSaving}
            variant={isSaved ? 'secondary' : 'primary'}
            icon={isSaved ? 'checkmark-circle' : 'bookmark-outline'}
          />

          <View style={styles.buttonSpacer} />

          <Button
            title="Scan Another"
            onPress={() => router.push('/scan')}
            variant="secondary"
            icon="scan-outline"
          />
        </View>
      </Animated.View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },
  productHeader: {
    marginBottom: spacing.lg,
  },
  productName: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  productBrand: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  upcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  productUpc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  disclaimer: {
    marginBottom: spacing.md,
  },
  noPrefsCard: {
    marginBottom: spacing.md,
  },
  noPrefsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noPrefsText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  noPrefsTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  noPrefsMessage: {
    ...typography.caption,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyBold,
    marginLeft: spacing.sm,
    color: colors.textPrimary,
  },
  allClearCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  allClearText: {
    ...typography.body,
    color: colors.success,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  ingredientsCard: {
    marginBottom: spacing.lg,
  },
  ingredientsText: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
  },
  actions: {
    marginTop: spacing.sm,
  },
  buttonSpacer: {
    height: spacing.sm,
  },
});

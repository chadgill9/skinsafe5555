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
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { scoreIngredients } from '../src/lib/scoring';
import { loadPreferences, saveScan, isScanSaved, removeScan } from '../src/lib/storage';
import { logScanEvent } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';
import { ScoringResult, UserPreferences, DEFAULT_PREFERENCES, SavedScan } from '../src/types';

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return 'High confidence';
      case 'MED':
        return 'Medium confidence';
      default:
        return 'Low confidence';
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
        <Text style={styles.loadingText}>Analyzing ingredients...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{params.name || 'Unknown Product'}</Text>
        <Text style={styles.productBrand}>{params.brand || 'Unknown Brand'}</Text>
        <Text style={styles.productUpc}>UPC: {params.upc}</Text>
      </View>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>Fit Score</Text>
        <Text style={[styles.scoreValue, { color: getScoreColor(result.fitScore) }]}>
          {result.fitScore}
        </Text>
        <Text style={styles.scoreMax}>/100</Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            {getConfidenceLabel(result.confidence)}
          </Text>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          This score reflects how well this product matches your preferences.
          It is not a measure of product quality or suitability for your skin.
          Consult a healthcare professional for personalized advice.
        </Text>
      </View>

      {activePrefsCount === 0 && (
        <View style={styles.noPrefsWarning}>
          <Text style={styles.noPrefsText}>
            No preferences set. Set your preferences to get personalized results.
          </Text>
          <TouchableOpacity
            style={styles.setPrefsButton}
            onPress={() => router.push('/preferences')}
          >
            <Text style={styles.setPrefsButtonText}>Set Preferences</Text>
          </TouchableOpacity>
        </View>
      )}

      {result.flags.length > 0 && (
        <View style={styles.flagsSection}>
          <Text style={styles.flagsTitle}>Flagged Based on Your Preferences</Text>
          {result.flags.map((flag, index) => (
            <View key={index} style={styles.flagItem}>
              <View style={styles.flagDot} />
              <View style={styles.flagContent}>
                <Text style={styles.flagIngredient}>{flag.ingredient}</Text>
                <Text style={styles.flagReason}>{flag.reason}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {result.flags.length === 0 && activePrefsCount > 0 && (
        <View style={styles.noFlagsSection}>
          <Text style={styles.noFlagsText}>
            No ingredients flagged based on your preferences.
          </Text>
        </View>
      )}

      <View style={styles.ingredientsSection}>
        <Text style={styles.ingredientsTitle}>Ingredients</Text>
        <Text style={styles.ingredientsText}>
          {params.ingredients || 'No ingredient data available'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, isSaved && styles.savedButton]}
          onPress={handleSaveToggle}
          disabled={isSaving}
        >
          <Text style={[styles.saveButtonText, isSaved && styles.savedButtonText]}>
            {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Product'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={() => router.push('/scan')}
        >
          <Text style={styles.scanAgainButtonText}>Scan Another</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  productInfo: {
    marginBottom: 24,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  productUpc: {
    fontSize: 12,
    color: '#94a3b8',
  },
  scoreCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 12,
  },
  confidenceBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    color: '#64748b',
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 18,
  },
  noPrefsWarning: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  noPrefsText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 12,
  },
  setPrefsButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  setPrefsButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  flagsSection: {
    marginBottom: 24,
  },
  flagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  flagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginTop: 6,
    marginRight: 12,
  },
  flagContent: {
    flex: 1,
  },
  flagIngredient: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    textTransform: 'capitalize',
  },
  flagReason: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noFlagsSection: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  noFlagsText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
  },
  ingredientsSection: {
    marginBottom: 24,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  ingredientsText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  savedButton: {
    backgroundColor: '#dcfce7',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedButtonText: {
    color: '#166534',
  },
  scanAgainButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanAgainButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '500',
  },
});

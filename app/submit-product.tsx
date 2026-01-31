/**
 * Submit Product Screen
 *
 * Allows users to submit product info when not found in database.
 * Works offline - saves locally and optionally syncs to cloud.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addProduct, isSupabaseConfigured, areWritesEnabled } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';
import { logInfo, logWarn } from '../src/lib/logger';

const TAG = 'SubmitProduct';

export default function SubmitProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ upc: string }>();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const isValid = name.trim() && brand.trim() && ingredients.trim();

  const handleSubmit = async () => {
    if (!isValid) {
      setStatusMessage('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    const productData = {
      upc: params.upc || '',
      name: name.trim(),
      brand: brand.trim(),
      ingredients: ingredients.trim(),
    };

    try {
      // Check if Supabase is configured and writes are enabled
      if (!isSupabaseConfigured()) {
        logInfo(TAG, 'Supabase not configured - proceeding offline', { upc: productData.upc });
        trackEvent('product_submitted', { mode: 'offline_no_config' });
      } else if (!areWritesEnabled()) {
        logWarn(TAG, 'Supabase writes disabled - proceeding locally', { upc: productData.upc });
        trackEvent('product_submitted', { mode: 'writes_disabled' });
      } else {
        // Try to save to cloud
        logInfo(TAG, 'Attempting cloud save', { upc: productData.upc });
        const result = await addProduct({
          upc: productData.upc,
          name: productData.name,
          brand: productData.brand,
          ingredients_raw_text: productData.ingredients,
        });

        if (result.data) {
          logInfo(TAG, 'Product saved to cloud', { upc: productData.upc });
          trackEvent('product_submitted', { mode: 'cloud' });
        } else if (result.offline) {
          logWarn(TAG, 'Offline - cloud save skipped', { upc: productData.upc });
          trackEvent('product_submitted', { mode: 'offline_network' });
        } else if (result.error) {
          logWarn(TAG, 'Cloud save failed - continuing locally', {
            upc: productData.upc,
            error: result.error,
          });
          trackEvent('product_submitted', { mode: 'cloud_failed' });
        }
      }

      // Always proceed to result - local scoring works regardless
      router.replace({
        pathname: '/result',
        params: {
          upc: productData.upc,
          name: productData.name,
          brand: productData.brand,
          ingredients: productData.ingredients,
        },
      });
    } catch (error) {
      // Even on exception, proceed to result - local scoring still works
      logWarn(TAG, 'Exception during submit - proceeding locally', {
        upc: productData.upc,
        error: String(error),
      });
      trackEvent('product_submitted', { mode: 'exception_fallback' });

      router.replace({
        pathname: '/result',
        params: {
          upc: productData.upc,
          name: productData.name,
          brand: productData.brand,
          ingredients: productData.ingredients,
        },
      });
    }
  };

  // Determine info message based on configuration
  const getInfoMessage = () => {
    if (!isSupabaseConfigured()) {
      return 'Product will be analyzed locally.';
    }
    if (!areWritesEnabled()) {
      return 'Product will be analyzed locally. Cloud sync is disabled.';
    }
    return null;
  };

  const infoMessage = getInfoMessage();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Product</Text>
          <Text style={styles.subtitle}>
            Enter the product information to analyze its ingredients.
          </Text>
        </View>

        {infoMessage && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>{infoMessage}</Text>
          </View>
        )}

        <View style={styles.upcBadge}>
          <Text style={styles.upcLabel}>UPC</Text>
          <Text style={styles.upcValue}>{params.upc || 'Unknown'}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Daily Moisturizer SPF 30"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., CeraVe"
              value={brand}
              onChangeText={setBrand}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Ingredients *</Text>
            <Text style={styles.fieldHint}>
              Copy the full ingredient list from the product packaging
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Water, Glycerin, Niacinamide..."
              value={ingredients}
              onChangeText={setIngredients}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>

        {statusMessage ? (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isValid || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Analyzing...' : 'Analyze Ingredients'}
          </Text>
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This analysis is for informational purposes only. Results are based
            on your personal preferences, not medical recommendations.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  infoBanner: {
    backgroundColor: '#dbeafe',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBannerText: {
    color: '#1e40af',
    fontSize: 13,
    textAlign: 'center',
  },
  upcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  upcLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 8,
  },
  upcValue: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#334155',
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  field: {},
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  statusBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    color: '#92400e',
    fontSize: 13,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
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

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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { addProduct, isSupabaseConfigured, areWritesEnabled } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';
import { logInfo, logWarn } from '../src/lib/logger';
import {
  colors,
  typography,
  spacing,
  radius,
  Card,
  Button,
  InfoBanner,
} from '../src/ui';

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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="create-outline" size={32} color={colors.accent} />
            </View>
            <Text style={styles.title}>Add Product</Text>
            <Text style={styles.subtitle}>
              Enter the product information to analyze its ingredients.
            </Text>
          </View>
        </Animated.View>

        {/* Info Banner */}
        {infoMessage && (
          <Animated.View entering={FadeInDown.duration(400).delay(150)}>
            <InfoBanner
              message={infoMessage}
              variant="info"
              icon="information-circle-outline"
              style={styles.infoBanner}
            />
          </Animated.View>
        )}

        {/* UPC Badge */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View style={styles.upcBadge}>
            <Ionicons name="barcode-outline" size={18} color={colors.textMuted} />
            <Text style={styles.upcLabel}>UPC</Text>
            <Text style={styles.upcValue}>{params.upc || 'Not provided'}</Text>
          </View>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Card variant="elevated" style={styles.formCard}>
            {/* Product Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Daily Moisturizer SPF 30"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Brand */}
            <View style={styles.field}>
              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., CeraVe"
                placeholderTextColor={colors.textMuted}
                value={brand}
                onChangeText={setBrand}
                autoCapitalize="words"
              />
            </View>

            {/* Ingredients */}
            <View style={styles.field}>
              <Text style={styles.label}>Ingredients *</Text>
              <Text style={styles.fieldHint}>
                Copy the full ingredient list from the product packaging
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Water, Glycerin, Niacinamide..."
                placeholderTextColor={colors.textMuted}
                value={ingredients}
                onChangeText={setIngredients}
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </Card>
        </Animated.View>

        {/* Status Message */}
        {statusMessage ? (
          <Animated.View entering={FadeInDown.duration(300)}>
            <InfoBanner
              message={statusMessage}
              variant="warning"
              style={styles.statusBanner}
            />
          </Animated.View>
        ) : null}

        {/* Submit Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Button
            title={isSubmitting ? 'Analyzing...' : 'Analyze Ingredients'}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
            icon="sparkles-outline"
          />
        </Animated.View>

        {/* Disclaimer */}
        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <InfoBanner
            message="This analysis is for informational purposes only. Results are based on your personal preferences, not medical recommendations."
            variant="muted"
            style={styles.disclaimer}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
  },
  infoBanner: {
    marginBottom: spacing.md,
  },
  upcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  upcLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  upcValue: {
    ...typography.body,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.textSecondary,
  },
  formCard: {
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  fieldHint: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  statusBanner: {
    marginBottom: spacing.md,
  },
  disclaimer: {
    marginTop: spacing.md,
  },
});

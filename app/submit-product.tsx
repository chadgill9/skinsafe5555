/**
 * Submit Product Screen
 *
 * Allows users to submit product info when not found in database.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addProduct, isSupabaseConfigured } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';

export default function SubmitProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ upc: string }>();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = name.trim() && brand.trim() && ingredients.trim();

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isSupabaseConfigured()) {
        // Offline mode - proceed directly to results
        trackEvent('product_submitted', { offline: true });
        router.replace({
          pathname: '/result',
          params: {
            upc: params.upc || '',
            name: name.trim(),
            brand: brand.trim(),
            ingredients: ingredients.trim(),
          },
        });
        return;
      }

      const product = await addProduct({
        upc: params.upc || '',
        name: name.trim(),
        brand: brand.trim(),
        ingredients_raw_text: ingredients.trim(),
      });

      trackEvent('product_submitted', { offline: false });

      if (product) {
        router.replace({
          pathname: '/result',
          params: {
            upc: product.upc,
            name: product.name,
            brand: product.brand,
            ingredients: product.ingredients_raw_text,
          },
        });
      } else {
        // Failed to save to DB but continue anyway
        router.replace({
          pathname: '/result',
          params: {
            upc: params.upc || '',
            name: name.trim(),
            brand: brand.trim(),
            ingredients: ingredients.trim(),
          },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not submit product. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Product</Text>
          <Text style={styles.subtitle}>
            Help build our database by adding this product's information.
          </Text>
        </View>

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

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isValid || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit & Analyze'}
          </Text>
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            By submitting, you confirm this information is accurate to the best
            of your knowledge. Product data is shared to help other users.
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

/**
 * Scan Screen
 *
 * Manual UPC entry with optional camera scanning.
 * Camera is disabled by default due to Expo Go compatibility issues.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getProductByUPC } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';
import { logInfo, logWarn, logError } from '../src/lib/logger';

const TAG = 'Scan';

export default function ScanScreen() {
  const router = useRouter();
  const [manualUpc, setManualUpc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [offlineBanner, setOfflineBanner] = useState(false);

  useEffect(() => {
    trackEvent('scan_started');
    logInfo(TAG, 'Scan screen loaded');
  }, []);

  const processUpc = async (upc: string) => {
    try {
      const result = await getProductByUPC(upc);

      if (result.offline) {
        logWarn(TAG, 'Offline mode - lookup unavailable', { upc });
        setOfflineBanner(true);
        Alert.alert(
          'Online Lookup Unavailable',
          'You can still add this product manually.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsLoading(false),
            },
            {
              text: 'Add Product',
              onPress: () => {
                router.push({
                  pathname: '/submit-product',
                  params: { upc },
                });
              },
            },
          ]
        );
        setIsLoading(false);
        return;
      }

      if (result.error) {
        logError(TAG, 'Lookup error', { upc, error: result.error });
        Alert.alert(
          'Lookup Error',
          'Could not check our database. You can still add this product manually.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsLoading(false),
            },
            {
              text: 'Add Product',
              onPress: () => {
                router.push({
                  pathname: '/submit-product',
                  params: { upc },
                });
              },
            },
          ]
        );
        setIsLoading(false);
        return;
      }

      if (result.data) {
        logInfo(TAG, 'Product found', { upc, name: result.data.name });
        trackEvent('scan_completed', { found: true });
        router.push({
          pathname: '/result',
          params: {
            upc: result.data.upc,
            name: result.data.name,
            brand: result.data.brand,
            ingredients: result.data.ingredients_raw_text,
          },
        });
      } else {
        logInfo(TAG, 'Product not found', { upc });
        trackEvent('product_not_found');
        Alert.alert(
          'Product Not Found',
          'This product is not in our database yet. Would you like to add it?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsLoading(false),
            },
            {
              text: 'Add Product',
              onPress: () => {
                router.push({
                  pathname: '/submit-product',
                  params: { upc },
                });
              },
            },
          ]
        );
        setIsLoading(false);
      }
    } catch (error) {
      logError(TAG, 'Exception in processUpc', { upc, error: String(error) });
      trackEvent('scan_failed');
      Alert.alert(
        'Error',
        'Could not process the barcode. You can still add this product manually.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsLoading(false),
          },
          {
            text: 'Add Product',
            onPress: () => {
              router.push({
                pathname: '/submit-product',
                params: { upc },
              });
            },
          },
        ]
      );
      setIsLoading(false);
    }
  };

  const handleManualSubmit = () => {
    const trimmed = manualUpc.trim();
    if (!trimmed) {
      Alert.alert('Invalid UPC', 'Please enter a valid UPC code.');
      return;
    }
    logInfo(TAG, 'Manual UPC entered', { upc: trimmed });
    trackEvent('manual_upc_entered');
    setIsLoading(true);
    processUpc(trimmed);
  };

  return (
    <View style={styles.container}>
      {offlineBanner && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            Online lookup unavailable. You can still add products manually.
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>Look Up Product</Text>
        <Text style={styles.subtitle}>
          Enter the UPC barcode number from the product packaging
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g., 012345678901"
          value={manualUpc}
          onChangeText={setManualUpc}
          keyboardType="number-pad"
          maxLength={14}
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleManualSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Looking up...' : 'Look Up Product'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.push({ pathname: '/submit-product', params: { upc: '' } })}
        >
          <Text style={styles.skipButtonText}>Add Product Without UPC</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Where to find the UPC</Text>
          <Text style={styles.infoText}>
            The UPC is the 12-digit number below the barcode on product packaging.
            It usually starts with 0 and is found on the back or bottom of the product.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  offlineBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: '#92400e',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
  },
  infoBox: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

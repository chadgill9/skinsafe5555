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
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { getProductByUPC } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';
import { logInfo, logWarn, logError } from '../src/lib/logger';
import {
  colors,
  typography,
  spacing,
  radius,
  Button,
  Card,
  InfoBanner,
} from '../src/ui';

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {offlineBanner && (
          <Animated.View entering={FadeIn.duration(300)}>
            <InfoBanner
              message="Online lookup unavailable. You can still add products manually."
              variant="warning"
              icon="cloud-offline-outline"
              style={styles.offlineBanner}
            />
          </Animated.View>
        )}

        <View style={styles.content}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.header}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="barcode-outline" size={40} color={colors.accent} />
          </View>
          <Text style={styles.title}>Look Up Product</Text>
          <Text style={styles.subtitle}>
            Enter the UPC barcode number from the product packaging
          </Text>
        </Animated.View>

        {/* UPC Input */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <TextInput
            style={styles.input}
            placeholder="012345678901"
            value={manualUpc}
            onChangeText={setManualUpc}
            keyboardType="number-pad"
            maxLength={14}
            placeholderTextColor={colors.textMuted}
          />
        </Animated.View>

        {/* Buttons */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Button
            title={isLoading ? 'Looking up...' : 'Look Up Product'}
            onPress={handleManualSubmit}
            disabled={isLoading}
            loading={isLoading}
            icon="search-outline"
          />

          <View style={styles.buttonSpacer} />

          <Button
            title="Add Product Without UPC"
            onPress={() => router.push({ pathname: '/submit-product', params: { upc: '' } })}
            variant="ghost"
            icon="add-circle-outline"
          />
        </Animated.View>

        {/* Info Box */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Card variant="flat" style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="help-circle-outline" size={20} color={colors.accent} />
              <Text style={styles.infoTitle}>Where to find the UPC</Text>
            </View>
            <Text style={styles.infoText}>
              The UPC is the 12-digit number below the barcode on product packaging.
              It usually starts with 0 and is found on the back or bottom of the product.
            </Text>
          </Card>
        </Animated.View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  offlineBanner: {
    margin: spacing.md,
    marginBottom: 0,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
    maxWidth: 280,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  buttonSpacer: {
    height: spacing.sm,
  },
  infoCard: {
    marginTop: spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.bodyBold,
    marginLeft: spacing.sm,
    color: colors.textPrimary,
  },
  infoText: {
    ...typography.body,
    color: colors.textMuted,
  },
});

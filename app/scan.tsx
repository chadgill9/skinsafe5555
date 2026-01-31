/**
 * Scan Screen
 *
 * Barcode scanner for product UPCs with manual entry fallback.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { getProductByUPC } from '../src/lib/supabase';
import { trackEvent } from '../src/lib/analytics';
import { logInfo, logWarn, logError } from '../src/lib/logger';

const TAG = 'Scan';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [manualUpc, setManualUpc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [offlineBanner, setOfflineBanner] = useState(false);

  useEffect(() => {
    trackEvent('scan_started');
    logInfo(TAG, 'Scan screen loaded');
  }, []);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (!isScanning || isLoading) return;

    setIsScanning(false);
    setIsLoading(true);

    const upc = result.data;
    logInfo(TAG, 'Barcode scanned', { upc });
    await processUpc(upc);
  };

  const processUpc = async (upc: string) => {
    try {
      // Try to find product in database
      const result = await getProductByUPC(upc);

      // Check if we're in offline mode
      if (result.offline) {
        logWarn(TAG, 'Offline mode - lookup unavailable', { upc });
        setOfflineBanner(true);
        // Offer to add product manually since we can't look up
        Alert.alert(
          'Online Lookup Unavailable',
          'You can still add this product manually.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setIsScanning(true);
                setIsLoading(false);
              },
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

      // Check for errors
      if (result.error) {
        logError(TAG, 'Lookup error', { upc, error: result.error });
        Alert.alert(
          'Lookup Error',
          'Could not check our database. You can still add this product manually.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setIsScanning(true);
                setIsLoading(false);
              },
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
        // Product not found - offer to submit
        Alert.alert(
          'Product Not Found',
          'This product is not in our database yet. Would you like to add it?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => {
                setIsScanning(true);
                setIsLoading(false);
              },
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
            onPress: () => {
              setIsScanning(true);
              setIsLoading(false);
            },
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

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            To scan product barcodes, please allow camera access.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => setShowManualEntry(true)}
          >
            <Text style={styles.manualButtonText}>Enter UPC Manually</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {offlineBanner && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            Online lookup unavailable. You can still add products manually.
          </Text>
        </View>
      )}
      {!showManualEntry ? (
        <>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
            }}
            onBarcodeScanned={isScanning ? handleBarCodeScanned : undefined}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
          </View>
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              {isLoading
                ? 'Looking up product...'
                : 'Point camera at product barcode'}
            </Text>
          </View>
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setShowManualEntry(true)}
            >
              <Text style={styles.switchButtonText}>Enter UPC Manually</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.manualContainer}>
          <Text style={styles.manualTitle}>Enter UPC Code</Text>
          <Text style={styles.manualHint}>
            Find the barcode number on the product packaging
          </Text>
          <TextInput
            style={styles.manualInput}
            placeholder="e.g., 012345678901"
            value={manualUpc}
            onChangeText={setManualUpc}
            keyboardType="number-pad"
            autoFocus={true}
            maxLength={14}
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
            style={styles.switchButton}
            onPress={() => setShowManualEntry(false)}
          >
            <Text style={styles.switchButtonText}>Use Camera Instead</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  offlineBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#fef3c7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 100,
  },
  offlineBannerText: {
    color: '#92400e',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 180,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructions: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
  },
  switchButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  manualButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '500',
  },
  manualContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'center',
  },
  manualTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  manualHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  manualInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

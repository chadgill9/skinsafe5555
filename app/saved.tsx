/**
 * Saved Products Screen
 *
 * Displays list of saved product scans.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { loadSavedScans, removeScan } from '../src/lib/storage';
import { trackEvent } from '../src/lib/analytics';
import { SavedScan } from '../src/types';

export default function SavedScreen() {
  const router = useRouter();
  const [scans, setScans] = useState<SavedScan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadScans = useCallback(async () => {
    const data = await loadSavedScans();
    setScans(data);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      trackEvent('saved_list_viewed');
      loadScans();
    }, [loadScans])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadScans();
  };

  const handleRemove = (scan: SavedScan) => {
    Alert.alert(
      'Remove Product',
      `Remove ${scan.productName} from your saved list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeScan(scan.upc);
            trackEvent('product_unsaved');
            loadScans();
          },
        },
      ]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#eab308';
    return '#ef4444';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: SavedScan }) => (
    <TouchableOpacity
      style={styles.scanItem}
      onLongPress={() => handleRemove(item)}
    >
      <View style={styles.scanInfo}>
        <Text style={styles.scanName} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.scanBrand}>{item.brand}</Text>
        <Text style={styles.scanDate}>Saved {formatDate(item.savedAt)}</Text>
      </View>
      <View style={styles.scanScore}>
        <Text style={[styles.scoreValue, { color: getScoreColor(item.fitScore) }]}>
          {item.fitScore}
        </Text>
        <Text style={styles.scoreLabel}>Fit</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Saved Products</Text>
          <Text style={styles.emptyText}>
            Products you save will appear here for easy reference.
          </Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.scanButtonText}>Scan a Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={scans}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
          />
          <View style={styles.hint}>
            <Text style={styles.hintText}>Long press to remove a product</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    padding: 16,
    paddingBottom: 60,
  },
  scanItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scanInfo: {
    flex: 1,
    marginRight: 16,
  },
  scanName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  scanBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scanDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  scanScore: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});

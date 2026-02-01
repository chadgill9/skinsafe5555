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
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { loadSavedScans, removeScan } from '../src/lib/storage';
import { trackEvent } from '../src/lib/analytics';
import { SavedScan } from '../src/types';
import {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  Card,
  EmptyState,
  getScoreColor,
} from '../src/ui';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item, index }: { item: SavedScan; index: number }) => {
    const scoreColor = getScoreColor(item.fitScore);

    return (
      <Animated.View entering={FadeInRight.duration(300).delay(index * 50)}>
        <Pressable
          style={({ pressed }) => [
            styles.productCard,
            pressed && styles.productCardPressed,
          ]}
          onLongPress={() => handleRemove(item)}
        >
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.productName}
            </Text>
            <Text style={styles.productBrand}>{item.brand}</Text>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
              <Text style={styles.productDate}>{formatDate(item.savedAt)}</Text>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '15' }]}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>
                {item.fitScore}
              </Text>
            </View>
            <Text style={styles.scoreLabel}>Fit Score</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View entering={FadeIn.duration(300)}>
          <Ionicons name="bookmark" size={32} color={colors.accent} />
        </Animated.View>
        <Text style={styles.loadingText}>Loading saved products...</Text>
      </View>
    );
  }

  if (scans.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="bookmark-outline"
          title="No Saved Products"
          message="Products you save will appear here for easy reference."
          actionTitle="Scan a Product"
          onAction={() => router.push('/scan')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      />

      {/* Hint Banner */}
      <Animated.View entering={FadeIn.duration(400).delay(300)} style={styles.hintBanner}>
        <Ionicons name="hand-left-outline" size={14} color={colors.textMuted} />
        <Text style={styles.hintText}>Long press to remove a product</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl + 40,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  productCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  productName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  productBrand: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  productDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  scoreLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  hintBanner: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  hintText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});

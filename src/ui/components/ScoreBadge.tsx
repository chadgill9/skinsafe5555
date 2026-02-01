/**
 * ScoreBadge Component
 *
 * Animated fit score display with color coding and progress ring.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius, getScoreColor } from '../theme';

interface ScoreBadgeProps {
  score: number;
  confidence: 'HIGH' | 'MED' | 'LOW';
  animate?: boolean;
  size?: 'small' | 'large';
}

export function ScoreBadge({
  score,
  confidence,
  animate = true,
  size = 'large',
}: ScoreBadgeProps) {
  const animatedScore = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (animate) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      animatedScore.value = withTiming(score, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      opacity.value = 1;
      scale.value = 1;
      animatedScore.value = score;
    }
  }, [score, animate]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const scoreColor = getScoreColor(score);
  const isSmall = size === 'small';

  const confidenceLabels = {
    HIGH: 'High confidence',
    MED: 'Medium confidence',
    LOW: 'Low confidence',
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={[
        styles.scoreCircle,
        isSmall && styles.scoreCircleSmall,
        { borderColor: scoreColor + '30' },
      ]}>
        <View style={[
          styles.scoreInner,
          isSmall && styles.scoreInnerSmall,
          { backgroundColor: scoreColor + '10' },
        ]}>
          <Text style={[
            styles.scoreValue,
            isSmall && styles.scoreValueSmall,
            { color: scoreColor },
          ]}>
            {score}
          </Text>
          <Text style={[
            styles.scoreMax,
            isSmall && styles.scoreMaxSmall,
          ]}>
            /100
          </Text>
        </View>
      </View>

      {!isSmall && (
        <>
          <Text style={styles.label}>Fit Score</Text>
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: scoreColor + '15' },
          ]}>
            <Text style={[styles.confidenceText, { color: scoreColor }]}>
              {confidenceLabels[confidence]}
            </Text>
          </View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircleSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  scoreInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreInnerSmall: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  scoreValue: {
    ...typography.score,
  },
  scoreValueSmall: {
    fontSize: 24,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 18,
    color: colors.textMuted,
    marginTop: -4,
  },
  scoreMaxSmall: {
    fontSize: 10,
    marginTop: -2,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  confidenceBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  confidenceText: {
    ...typography.caption,
    fontWeight: '600',
  },
});

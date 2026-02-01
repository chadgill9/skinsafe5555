/**
 * SkinSafe Design System
 *
 * Ulta-inspired beauty retail aesthetic:
 * - Clean white base, bold typography
 * - Warm coral/peach accent (feminine, inviting)
 * - Generous spacing, soft cards, rounded elements
 */

import { Platform } from 'react-native';

// ============================================================================
// COLORS (60-30-10 Rule)
// ============================================================================

export const colors = {
  // 60% - Background & base surfaces
  background: '#FAFAFA',
  surface: '#FFFFFF',

  // 30% - Secondary surfaces & subtle elements
  surfaceMuted: '#F5F5F7',
  surfaceElevated: '#FFFFFF',
  border: '#E8E8ED',
  divider: '#F0F0F5',

  // 10% - Accent (warm coral - Ulta-inspired)
  accent: '#E85A6B',        // Primary CTA coral
  accentLight: '#FEE8EA',   // Light coral for backgrounds
  accentDark: '#D14456',    // Pressed state

  // Text hierarchy
  textPrimary: '#1A1A1A',   // Headlines, primary text
  textSecondary: '#404040', // Body text (spec: #404040)
  textMuted: '#8E8E93',     // Captions, hints
  textInverse: '#FFFFFF',   // On accent backgrounds

  // Semantic colors
  success: '#34C759',
  successLight: '#E8F9EE',
  warning: '#FF9500',
  warningLight: '#FFF4E5',
  error: '#FF3B30',
  errorLight: '#FFEBEA',

  // Score colors
  scoreGood: '#34C759',
  scoreMedium: '#FF9500',
  scorePoor: '#FF3B30',
};

// ============================================================================
// SPACING (8px base unit)
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
} as const;

// Screen padding
export const screenPadding = {
  horizontal: 24,
  vertical: 24,
};

// ============================================================================
// BORDER RADIUS (12px everywhere)
// ============================================================================

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Headline - 28-32px bold
  headline: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },

  // Title - 24px bold
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },

  // Section title - 18-20px semibold
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },

  // Body - 15-16px regular
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.15,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  // Body bold - 16px semibold
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.15,
    color: colors.textSecondary,
  },

  // Caption - 13px
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textMuted,
    lineHeight: 18,
  },

  // Small - 12px
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textMuted,
    lineHeight: 16,
  },

  // Button text
  button: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },

  // Score display
  score: {
    fontSize: 56,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),

  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
    default: {},
  }),

  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
};

// ============================================================================
// COMPONENT SPECS
// ============================================================================

export const components = {
  card: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  button: {
    height: 56,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },

  buttonSecondary: {
    height: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },

  input: {
    height: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  chip: {
    height: 36,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
};

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// Helper to get score color
export function getScoreColor(score: number): string {
  if (score >= 80) return colors.scoreGood;
  if (score >= 50) return colors.scoreMedium;
  return colors.scorePoor;
}

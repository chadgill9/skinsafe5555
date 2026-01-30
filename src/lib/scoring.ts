/**
 * SkinSafe Ingredient Scoring Engine
 *
 * IMPORTANT: This provides informational analysis only.
 * Results are based on user preferences and are NOT medical advice.
 * Users should consult healthcare professionals for skin concerns.
 */

import {
  UserPreferences,
  ScoringResult,
  IngredientFlag,
  ConfidenceLevel,
} from '../types';

// Ingredient keyword mappings for preference-based flagging
const FRAGRANCE_KEYWORDS = [
  'fragrance', 'parfum', 'perfume', 'aroma', 'linalool', 'limonene',
  'citronellol', 'geraniol', 'coumarin', 'eugenol',
];

const PARABEN_KEYWORDS = [
  'methylparaben', 'propylparaben', 'butylparaben', 'ethylparaben',
  'isobutylparaben', 'paraben',
];

const SULFATE_KEYWORDS = [
  'sodium lauryl sulfate', 'sodium laureth sulfate', 'sls', 'sles',
  'ammonium lauryl sulfate', 'ammonium laureth sulfate',
];

const ALCOHOL_KEYWORDS = [
  'alcohol denat', 'sd alcohol', 'isopropyl alcohol', 'ethanol',
  'denatured alcohol',
];

const ESSENTIAL_OIL_KEYWORDS = [
  'essential oil', 'tea tree oil', 'lavender oil', 'eucalyptus oil',
  'peppermint oil', 'rosemary oil', 'citrus oil', 'lemon oil',
  'orange oil', 'bergamot oil',
];

// Negative patterns - these should NOT trigger flags
const NEGATIVE_PATTERNS: Record<string, RegExp[]> = {
  fragrance: [
    /fragrance[- ]?free/i,
    /no[- ]?fragrance/i,
    /without[- ]?fragrance/i,
    /unscented/i,
  ],
  alcohol: [
    /alcohol[- ]?free/i,
    /no[- ]?alcohol/i,
    /cetyl alcohol/i, // fatty alcohol, not drying
    /cetearyl alcohol/i, // fatty alcohol, not drying
    /stearyl alcohol/i, // fatty alcohol, not drying
    /behenyl alcohol/i, // fatty alcohol, not drying
  ],
  paraben: [
    /paraben[- ]?free/i,
    /no[- ]?parabens?/i,
    /without[- ]?parabens?/i,
  ],
  sulfate: [
    /sulfate[- ]?free/i,
    /no[- ]?sulfates?/i,
    /without[- ]?sulfates?/i,
  ],
};

/**
 * Tokenize ingredient text into individual ingredients
 */
export function tokenizeIngredients(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Split on common INCI separators: comma, semicolon, newline, pipe
  const tokens = text
    .split(/[,;\n|]+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  return tokens;
}

/**
 * Check if ingredient text contains typical INCI formatting
 */
function hasInciFormat(text: string): boolean {
  // INCI lists typically have commas and parentheses
  const hasCommas = (text.match(/,/g) || []).length >= 3;
  const hasParens = /\([^)]+\)/.test(text);
  const hasTypicalInci = /aqua|water|glycerin|sodium|acid/i.test(text);

  return hasCommas || (hasParens && hasTypicalInci);
}

/**
 * Determine confidence level based on ingredient text quality
 */
export function determineConfidence(text: string): ConfidenceLevel {
  const tokens = tokenizeIngredients(text);
  const tokenCount = tokens.length;

  if (tokenCount < 6 || !text || text.trim().length === 0) {
    return 'LOW';
  }

  if (tokenCount >= 12 && hasInciFormat(text)) {
    return 'HIGH';
  }

  // 6-11 tokens
  return 'MED';
}

/**
 * Check if a keyword matches in the text using boundary-aware matching
 * Prevents false positives like "fragrance-free" triggering "fragrance"
 */
function matchesKeyword(
  ingredientText: string,
  keyword: string,
  category: string
): boolean {
  const lowerText = ingredientText.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();

  // First check negative patterns - if any match, return false
  const negativePatterns = NEGATIVE_PATTERNS[category] || [];
  for (const pattern of negativePatterns) {
    if (pattern.test(lowerText)) {
      return false;
    }
  }

  // Use word boundary matching
  // Match keyword only if it's not preceded/followed by letters or hyphens that would change meaning
  const boundaryRegex = new RegExp(
    `(?:^|[^a-z-])${escapeRegex(lowerKeyword)}(?:[^a-z-]|$)`,
    'i'
  );

  return boundaryRegex.test(lowerText);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Score ingredients against user preferences
 */
export function scoreIngredients(
  ingredientsText: string,
  preferences: UserPreferences
): ScoringResult {
  const flags: IngredientFlag[] = [];
  const tokens = tokenizeIngredients(ingredientsText);
  const confidence = determineConfidence(ingredientsText);

  // If no meaningful input, return neutral score
  if (tokens.length === 0) {
    return {
      fitScore: 50,
      flags: [],
      confidence: 'LOW',
    };
  }

  // Check each preference category
  if (preferences.avoidFragrance) {
    for (const keyword of FRAGRANCE_KEYWORDS) {
      if (matchesKeyword(ingredientsText, keyword, 'fragrance')) {
        flags.push({
          ingredient: keyword,
          reason: 'May be a concern based on your fragrance preference',
          category: 'fragrance',
        });
        break; // One flag per category
      }
    }
  }

  if (preferences.avoidParabens) {
    for (const keyword of PARABEN_KEYWORDS) {
      if (matchesKeyword(ingredientsText, keyword, 'paraben')) {
        flags.push({
          ingredient: keyword,
          reason: 'May be a concern based on your paraben preference',
          category: 'paraben',
        });
        break;
      }
    }
  }

  if (preferences.avoidSulfates) {
    for (const keyword of SULFATE_KEYWORDS) {
      if (matchesKeyword(ingredientsText, keyword, 'sulfate')) {
        flags.push({
          ingredient: keyword,
          reason: 'May be a concern based on your sulfate preference',
          category: 'sulfate',
        });
        break;
      }
    }
  }

  if (preferences.avoidAlcohol) {
    for (const keyword of ALCOHOL_KEYWORDS) {
      if (matchesKeyword(ingredientsText, keyword, 'alcohol')) {
        flags.push({
          ingredient: keyword,
          reason: 'May be a concern based on your alcohol preference',
          category: 'alcohol',
        });
        break;
      }
    }
  }

  if (preferences.avoidEssentialOils) {
    for (const keyword of ESSENTIAL_OIL_KEYWORDS) {
      if (matchesKeyword(ingredientsText, keyword, 'essential_oil')) {
        flags.push({
          ingredient: keyword,
          reason: 'May be a concern based on your essential oil preference',
          category: 'essential_oil',
        });
        break;
      }
    }
  }

  // Check custom avoid list
  for (const customIngredient of preferences.customAvoid) {
    if (customIngredient && matchesKeyword(ingredientsText, customIngredient, 'custom')) {
      flags.push({
        ingredient: customIngredient,
        reason: 'May be a concern based on your custom preference',
        category: 'custom',
      });
    }
  }

  // Calculate fit score
  // Start at 100, deduct based on flags and their severity
  const activePreferencesCount = [
    preferences.avoidFragrance,
    preferences.avoidParabens,
    preferences.avoidSulfates,
    preferences.avoidAlcohol,
    preferences.avoidEssentialOils,
  ].filter(Boolean).length + preferences.customAvoid.length;

  let fitScore: number;
  if (activePreferencesCount === 0) {
    // No preferences set - neutral score
    fitScore = 75;
  } else {
    // Deduct points per flag relative to total active preferences
    const flagPenalty = flags.length * (50 / Math.max(activePreferencesCount, 1));
    fitScore = Math.max(0, Math.round(100 - flagPenalty));
  }

  return {
    fitScore,
    flags,
    confidence,
  };
}

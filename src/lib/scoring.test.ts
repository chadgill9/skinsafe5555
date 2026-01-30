/**
 * SkinSafe Scoring Engine Tests
 *
 * Run with: npm run test:scoring
 */

import {
  tokenizeIngredients,
  determineConfidence,
  scoreIngredients,
} from './scoring';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types';

// Test utilities
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${(error as Error).message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertTrue(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertFalse(condition: boolean, message: string) {
  if (condition) {
    throw new Error(message);
  }
}

// ============================================================================
// Test Suite
// ============================================================================

console.log('\nSkinSafe Scoring Engine Tests\n');
console.log('═'.repeat(50));

// ---------------------------------------------------------------------------
// Tokenization Tests
// ---------------------------------------------------------------------------

console.log('\nTokenization:');

test('tokenizes comma-separated ingredients', () => {
  const tokens = tokenizeIngredients('Water, Glycerin, Niacinamide');
  assertEqual(tokens.length, 3);
  assertEqual(tokens[0], 'water');
  assertEqual(tokens[1], 'glycerin');
  assertEqual(tokens[2], 'niacinamide');
});

test('tokenizes semicolon-separated ingredients', () => {
  const tokens = tokenizeIngredients('Water; Glycerin; Niacinamide');
  assertEqual(tokens.length, 3);
});

test('handles mixed separators', () => {
  const tokens = tokenizeIngredients('Water, Glycerin; Acid\nBase');
  assertEqual(tokens.length, 4);
});

test('handles empty input', () => {
  const tokens = tokenizeIngredients('');
  assertEqual(tokens.length, 0);
});

test('trims whitespace from tokens', () => {
  const tokens = tokenizeIngredients('  Water  ,  Glycerin  ');
  assertEqual(tokens[0], 'water');
  assertEqual(tokens[1], 'glycerin');
});

// ---------------------------------------------------------------------------
// Confidence Level Tests
// ---------------------------------------------------------------------------

console.log('\nConfidence Levels:');

test('LOW confidence for empty input', () => {
  assertEqual(determineConfidence(''), 'LOW');
});

test('LOW confidence for < 6 tokens', () => {
  assertEqual(determineConfidence('Water, Glycerin, Oil'), 'LOW');
});

test('MED confidence for 6-11 tokens', () => {
  const ingredients = 'Water, Glycerin, Niacinamide, Acid, Base, Oil, Vitamin';
  assertEqual(determineConfidence(ingredients), 'MED');
});

test('HIGH confidence for >= 12 tokens with INCI format', () => {
  const fullInci = `
    Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Dimethicone,
    Petrolatum, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer,
    Xanthan Gum, Sodium Lauroyl Lactylate, Sodium Hyaluronate
  `;
  assertEqual(determineConfidence(fullInci), 'HIGH');
});

// ---------------------------------------------------------------------------
// Boundary-Aware Matching Tests (Critical for false positive prevention)
// ---------------------------------------------------------------------------

console.log('\nBoundary-Aware Matching:');

test('fragrance-free does NOT flag fragrance', () => {
  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, avoidFragrance: true };
  const result = scoreIngredients('Water, Glycerin, Fragrance-Free Formula', prefs);

  const hasFragranceFlag = result.flags.some(f => f.category === 'fragrance');
  assertFalse(hasFragranceFlag, 'Should not flag fragrance in fragrance-free');
});

test('parfum DOES flag fragrance when user avoids', () => {
  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, avoidFragrance: true };
  const result = scoreIngredients('Water, Glycerin, Parfum, Dimethicone', prefs);

  const hasFragranceFlag = result.flags.some(f => f.category === 'fragrance');
  assertTrue(hasFragranceFlag, 'Should flag parfum as fragrance');
});

test('alcohol-free does NOT flag alcohol', () => {
  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, avoidAlcohol: true };
  const result = scoreIngredients('Water, Alcohol-Free, Glycerin', prefs);

  const hasAlcoholFlag = result.flags.some(f => f.category === 'alcohol');
  assertFalse(hasAlcoholFlag, 'Should not flag alcohol in alcohol-free');
});

test('cetyl alcohol does NOT flag drying alcohol', () => {
  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, avoidAlcohol: true };
  const result = scoreIngredients('Water, Cetyl Alcohol, Cetearyl Alcohol, Glycerin', prefs);

  const hasAlcoholFlag = result.flags.some(f => f.category === 'alcohol');
  assertFalse(hasAlcoholFlag, 'Fatty alcohols should not trigger alcohol flag');
});

test('alcohol denat DOES flag when user avoids alcohol', () => {
  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, avoidAlcohol: true };
  const result = scoreIngredients('Water, Alcohol Denat, Glycerin', prefs);

  const hasAlcoholFlag = result.flags.some(f => f.category === 'alcohol');
  assertTrue(hasAlcoholFlag, 'Should flag alcohol denat');
});

test('paraben-free does NOT flag parabens', () => {
  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, avoidParabens: true };
  const result = scoreIngredients('Water, Glycerin, Paraben-Free', prefs);

  const hasParabenFlag = result.flags.some(f => f.category === 'paraben');
  assertFalse(hasParabenFlag, 'Should not flag paraben in paraben-free');
});

test('methylparaben DOES flag when user avoids parabens', () => {
  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, avoidParabens: true };
  const result = scoreIngredients('Water, Glycerin, Methylparaben', prefs);

  const hasParabenFlag = result.flags.some(f => f.category === 'paraben');
  assertTrue(hasParabenFlag, 'Should flag methylparaben');
});

// ---------------------------------------------------------------------------
// Scoring Result Tests
// ---------------------------------------------------------------------------

console.log('\nScoring Results:');

test('empty ingredients returns neutral score and LOW confidence', () => {
  const result = scoreIngredients('', DEFAULT_PREFERENCES);

  assertEqual(result.fitScore, 50);
  assertEqual(result.confidence, 'LOW');
  assertEqual(result.flags.length, 0);
});

test('no preferences set returns 75 score', () => {
  const result = scoreIngredients('Water, Glycerin, Fragrance, Parfum', DEFAULT_PREFERENCES);

  assertEqual(result.fitScore, 75, 'No preferences = neutral score of 75');
  assertEqual(result.flags.length, 0, 'No preferences = no flags');
});

test('multiple flags reduce score appropriately', () => {
  const prefs: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    avoidFragrance: true,
    avoidParabens: true,
    avoidSulfates: true,
  };

  const badProduct = 'Water, Fragrance, Methylparaben, Sodium Lauryl Sulfate, Glycerin';
  const result = scoreIngredients(badProduct, prefs);

  assertEqual(result.flags.length, 3, 'Should have 3 flags');
  assertTrue(result.fitScore <= 50, 'Score should be 50 or lower with many flags');
});

test('clean product with preferences returns high score', () => {
  const prefs: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    avoidFragrance: true,
    avoidParabens: true,
  };

  const cleanProduct = 'Aqua, Glycerin, Niacinamide, Cetearyl Alcohol, Dimethicone';
  const result = scoreIngredients(cleanProduct, prefs);

  assertEqual(result.flags.length, 0, 'Should have no flags');
  assertEqual(result.fitScore, 100, 'Score should be 100 with no flags');
});

test('custom avoid list flags specified ingredients', () => {
  const prefs: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    customAvoid: ['coconut oil', 'shea butter'],
  };

  const result = scoreIngredients('Water, Coconut Oil, Glycerin', prefs);

  assertEqual(result.flags.length, 1);
  assertEqual(result.flags[0].category, 'custom');
});

test('flags use preference-based language', () => {
  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, avoidFragrance: true };
  const result = scoreIngredients('Water, Parfum, Glycerin', prefs);

  assertTrue(
    result.flags[0].reason.includes('based on your'),
    'Flag reason should use preference-based language'
  );
  assertFalse(
    result.flags[0].reason.toLowerCase().includes('unsafe'),
    'Flag reason should not use "unsafe"'
  );
  assertFalse(
    result.flags[0].reason.toLowerCase().includes('bad'),
    'Flag reason should not use "bad"'
  );
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('\n' + '═'.repeat(50));
console.log(`\nResults: ${passed} passed, ${failed} failed`);
console.log('');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All tests passed!\n');
  process.exit(0);
}

# CLAUDE.md - SkinSafe Project Guide

## Project Overview

SkinSafe is a React Native mobile app (iOS/Android) built with Expo that helps users check skincare product ingredients against their personal preferences. Users scan product barcodes or enter UPC codes, and the app scores products based on flagged ingredients.

**Tech Stack:** TypeScript, Expo SDK 54, React Native 0.81.5, Expo Router, Supabase (optional), AsyncStorage

## Quick Commands

```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run test:scoring   # Run scoring engine tests (20+ test cases)
npm run check:copy     # CRITICAL: Compliance check for banned phrases
```

## Directory Structure

```
app/                    # Expo Router screens (file-based navigation)
├── _layout.tsx         # Root layout with Stack navigation
├── index.tsx           # Welcome screen with disclaimer
├── preferences.tsx     # User preference toggles
├── scan.tsx            # Manual UPC entry
├── result.tsx          # Scoring results display
├── saved.tsx           # Saved products list
└── submit-product.tsx  # Manual product submission

src/lib/
├── scoring.ts          # Core ingredient scoring engine
├── scoring.test.ts     # Scoring test suite
├── storage.ts          # AsyncStorage wrapper
├── supabase.ts         # Database operations
└── boolean.ts          # Type safety for boolean coercion

docs/                   # Project documentation
├── MVP_DEFINITION.md   # Scope and success criteria
├── DECISION_LOG.md     # Architectural decisions
└── RISK_REGISTER.md    # Risk management
```

## Critical Compliance Rules

**This is a healthcare-adjacent app. Compliance is non-negotiable.**

### Banned Language (will fail CI)
NEVER use these words/phrases in UI text:
- "safe" / "unsafe" (except in app name "SkinSafe")
- "treat" / "cure" / "diagnose" / "heal"
- "harmful" / "dangerous" / "toxic"
- Any medical claims or health promises

### Required Language Pattern
Always use preference-based framing:
- "may be a concern based on your preferences"
- "flagged based on your settings"
- "for informational purposes only"

Run `npm run check:copy` before committing to verify compliance.

## Scoring Engine (src/lib/scoring.ts)

The core algorithm uses keyword-based matching:

1. Tokenizes ingredient text (splits on `,`, `;`, `\n`, `|`)
2. Checks each preference category for keyword matches
3. Uses boundary-aware matching to prevent false positives:
   - "fragrance-free" does NOT flag fragrance
   - "cetyl alcohol" does NOT flag drying alcohol
4. Returns: `{ fitScore: 0-100, flags: IngredientFlag[], confidence: HIGH|MED|LOW }`

**Confidence levels:** HIGH (≥12 tokens + INCI format), MED (6-11 tokens), LOW (<6 tokens)

## Known Constraints

1. **Camera disabled** - expo-camera removed due to Expo Go new architecture crash. Manual UPC entry is the primary flow.
2. **Boolean type coercion** - AsyncStorage returns strings; use `toBool()` from `src/lib/boolean.ts` to normalize.
3. **Supabase writes disabled by default** - Set `EXPO_PUBLIC_ENABLE_SUPABASE_WRITES=true` to enable.
4. **No user authentication** - Deferred to post-MVP.

## Development Patterns

- **Offline-first:** Everything works without network. Supabase is optional.
- **Type safety:** Strict TypeScript. Use explicit types, avoid `any`.
- **Test core logic:** All scoring changes require test coverage in `scoring.test.ts`.
- **Graceful degradation:** Product lookups fail gracefully with user-friendly fallbacks.
- **Conservative defaults:** Writes disabled, no auth = read-only public data.

## Database Schema (Supabase)

Two tables: `products` (UPC, name, brand, ingredients) and `scans` (score history).
RLS is disabled for MVP. Schema in `supabase/schema.sql`.

## AsyncStorage Keys

```
@skinsafe_preferences        # UserPreferences object
@skinsafe_saved_scans        # SavedScan[] array
@skinsafe_onboarding_complete # boolean flag
```

## Before Submitting Code

1. Run `npm run test:scoring` - All tests must pass
2. Run `npm run check:copy` - No banned phrases allowed
3. Test on iOS simulator with `npm run ios`
4. Verify disclaimers appear on Welcome, Result, and Preferences screens

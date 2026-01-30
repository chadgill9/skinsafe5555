# SkinSafe MVP Definition

## One-Liner

SkinSafe helps users check skincare product ingredients against their personal preferences before purchasing.

## Target User

- Skincare-conscious consumers who want to avoid specific ingredients
- Users with sensitivities who track what works/doesn't work for them
- Anyone building a personal "product library" based on preferences

## Core Loop

```
Scan → Result (fit score + flags + confidence) → Save → Repeat
```

1. **Scan**: User scans product barcode or enters UPC manually
2. **Result**: App displays fit score, flagged ingredients (based on preferences), and confidence level
3. **Save**: User optionally saves product to their list
4. **Repeat**: User builds a library of products they've checked

## In Scope (MVP)

- [ ] Welcome screen with disclaimer
- [ ] User preferences (avoid: fragrance, parabens, sulfates, alcohol, essential oils, custom list)
- [ ] Barcode scanning (expo-camera)
- [ ] Manual UPC entry fallback
- [ ] Product lookup from Supabase (optional - works offline)
- [ ] Product submission when not found
- [ ] Ingredient scoring engine:
  - Tokenization of ingredient lists
  - Boundary-aware keyword matching
  - Confidence levels (HIGH/MED/LOW)
  - Preference-based flagging
- [ ] Result screen with fit score, flags, confidence, disclaimer
- [ ] Save products locally (AsyncStorage)
- [ ] Saved products list screen
- [ ] Analytics event stubs

## Out of Scope (NOT in MVP)

- ❌ User authentication / login
- ❌ Product reviews or ratings
- ❌ Subscription / paywall
- ❌ Duplicate product finder
- ❌ Selfie skin analysis
- ❌ Social features (sharing, following)
- ❌ Partnership / affiliate integrations
- ❌ Push notifications
- ❌ OCR ingredient scanning from photos
- ❌ Any claims that could be interpreted as:
  - Medical advice
  - Diagnosis
  - Treatment recommendations
  - "Safe" / "Unsafe" terminology

## Compliance Language Rules

All user-facing copy must follow these rules:

1. **Never use "safe" or "unsafe"** — Use "fit score" based on preferences
2. **Never diagnose** — We do not identify skin conditions
3. **Never treat** — We do not recommend treatments
4. **Never claim medical authority** — We are not dermatologists
5. **Always use hedging language:**
   - "May be a concern based on your preferences"
   - "For informational purposes only"
   - "Consult a healthcare professional"
6. **Include disclaimers** on:
   - Welcome screen
   - Result screen
   - Preferences screen

## Success Criteria

MVP is complete when:

1. A user can scan a product barcode and see a result
2. A user can set preferences and see flags based on those preferences
3. A user can save products locally
4. No banned phrases appear in any user-facing copy
5. App builds and exports for iOS without errors
6. TypeScript compiles without errors

## Technical Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: expo-router
- **Scanning**: expo-camera
- **Database**: Supabase (optional for MVP)
- **Local Storage**: AsyncStorage

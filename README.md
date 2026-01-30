# SkinSafe

Check skincare product ingredients against your personal preferences.

**DISCLAIMER:** This app is for informational purposes only. It does not provide medical advice, diagnosis, or treatment recommendations. Consult a healthcare professional for skin concerns.

## Core Loop

1. **Scan** - Scan a product barcode or enter UPC manually
2. **Result** - View fit score, flagged ingredients, and confidence level
3. **Save** - Save products for future reference
4. **Repeat** - Build your product reference library

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and configure (optional - works offline)
cp .env.example .env

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## Tech Stack

- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **Navigation:** expo-router (file-based)
- **Barcode Scanning:** expo-camera
- **Database:** Supabase (optional for MVP)
- **Local Storage:** AsyncStorage

## Project Structure

```
├── app/                    # Screens (expo-router)
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Welcome/Home
│   ├── preferences.tsx     # User preferences
│   ├── scan.tsx            # Barcode scanner
│   ├── result.tsx          # Scan results
│   ├── saved.tsx           # Saved products
│   └── submit-product.tsx  # Add new product
├── src/
│   ├── lib/
│   │   ├── scoring.ts      # Ingredient scoring engine
│   │   ├── supabase.ts     # Database client
│   │   ├── storage.ts      # AsyncStorage wrapper
│   │   └── analytics.ts    # Event tracking stubs
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   └── components/         # Shared components
├── supabase/
│   └── schema.sql          # Database schema
├── docs/                   # Project documentation
└── scripts/                # Build/check scripts
```

## Scripts

```bash
npm start           # Start Expo dev server
npm run ios         # Run on iOS
npm run android     # Run on Android
npm run web         # Run in browser
npm run test:scoring # Run scoring tests
npm run check:copy  # Check for banned phrases
```

## Supabase Setup (Optional)

The app works offline without Supabase. To enable cloud features:

1. Create a Supabase project at https://supabase.com
2. Run the schema from `supabase/schema.sql` in the SQL editor
3. Copy your project URL and anon key to `.env`

## Scoring Logic

The scoring engine:
- Tokenizes ingredient lists (splits on commas, semicolons, newlines)
- Uses boundary-aware matching to avoid false positives
- Calculates confidence based on ingredient list quality
- Returns: `{ fitScore: 0-100, flags: [], confidence: HIGH|MED|LOW }`

See `src/lib/scoring.ts` for implementation details.

## Compliance

This app follows strict compliance rules:
- No medical claims or diagnosis language
- No "safe/unsafe" terminology
- Uses preference-based framing ("may be a concern based on your preferences")
- Prominent disclaimers throughout the UI

## Contributing

See `docs/` for project documentation including:
- MVP definition and scope
- Decision log
- Risk register
- Delivery plan

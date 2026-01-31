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

### Step 1: Create Project
1. Go to https://supabase.com and create a new project
2. Wait for the project to finish provisioning (~2 minutes)

### Step 2: Run Schema
1. Go to SQL Editor in your Supabase dashboard
2. Create a new query
3. Paste the contents of `supabase/schema.sql`
4. Click "Run" to execute

### Step 3: Configure Environment
1. Go to Settings → API in your Supabase dashboard
2. Copy "Project URL" and "anon public" key
3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```
4. Fill in your values:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   EXPO_PUBLIC_ENABLE_SUPABASE_WRITES=false
   ```

### Step 4: Enable Writes (Optional)
By default, writes are disabled for security. To enable:
```
EXPO_PUBLIC_ENABLE_SUPABASE_WRITES=true
```

**Warning:** Only enable writes if you understand the security implications. See `docs/RISK_REGISTER.md`.

### Verify in Dashboard Checklist
After setup, verify in Supabase dashboard:

- [ ] **Table Editor → products**: Table exists with columns (id, upc, name, brand, ingredients_raw_text, created_at, updated_at)
- [ ] **Table Editor → scans**: Table exists with columns (id, upc, product_name, fit_score, confidence, flags_json, scanned_at)
- [ ] **SQL Editor**: Run `SELECT COUNT(*) FROM products;` — should return 0 (or sample data count)
- [ ] **API Settings**: anon key is copied correctly (starts with `eyJ`)
- [ ] **Project URL**: Matches format `https://xxxxx.supabase.co`

### Test Connectivity
After configuring `.env`, test the connection:
```bash
npm start
# In the app, scan any barcode
# Check terminal for "[Supabase]" logs
# If configured correctly: no "Missing URL" warning
```

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

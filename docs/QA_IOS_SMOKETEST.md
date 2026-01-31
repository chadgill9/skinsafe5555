# SkinSafe iOS QA Smoketest

Manual QA checklist for iOS. Follow these steps exactly to verify the MVP is working.

## Prerequisites

```bash
# 1. Install dependencies
npm install

# 2. Verify TypeScript compiles
npx tsc --noEmit

# 3. Run automated tests
npm run test:scoring
npm run check:copy

# 4. Start the development server
npm start
```

## Running on iOS Simulator

```bash
# Option A: From Expo CLI
npm run ios

# Option B: Press 'i' in the Expo CLI after npm start
```

Wait for the app to load in the simulator.

---

## 10-Step Manual Test Script

### Step 1: Welcome Screen Loads
- [ ] App opens to Welcome screen
- [ ] Disclaimer text is visible: "For informational purposes only"
- [ ] "Scan Product" button is tappable
- [ ] "Edit Preferences" / "Set Your Preferences" button is visible
- [ ] "View Saved Products" button is visible

**Pass criteria:** Welcome screen renders with disclaimer visible.

---

### Step 2: Preferences Screen
- [ ] Tap "Set Your Preferences" → navigates to Preferences
- [ ] All 5 toggle switches are visible (Fragrance, Parabens, Sulfates, Drying Alcohols, Essential Oils)
- [ ] Toggles respond to taps (on/off state changes)
- [ ] Custom ingredient input field works
- [ ] "Save Preferences" button is tappable and saves

**Pass criteria:** Can toggle preferences and save.

---

### Step 3: Scan Screen (Manual UPC Entry)
- [ ] From Welcome, tap "Scan Product" → Scan screen loads
- [ ] UPC input field is visible with placeholder "e.g., 012345678901"
- [ ] "Look Up Product" button is visible
- [ ] "Add Product Without UPC" link is visible
- [ ] Info box explains where to find UPC

**Pass criteria:** Scan screen loads with manual entry form.

---

### Step 4: UPC Lookup Flow
- [ ] Type: `012345678901` (test UPC)
- [ ] Tap "Look Up Product" button
- [ ] Loading state shows "Looking up..."

**Pass criteria:** Manual entry submits and shows loading state.

---

### Step 5: Product Not Found Flow
- [ ] After lookup, "Product not found" message appears
- [ ] "Add this product" option is visible
- [ ] Tap to open Submit Product screen

**Pass criteria:** Not-found flow navigates to submission.

---

### Step 6: Submit New Product
- [ ] Fill in product name: `Test Moisturizer`
- [ ] Fill in brand: `TestBrand`
- [ ] Fill in ingredients: `Water, Glycerin, Niacinamide, Fragrance, Methylparaben`
- [ ] Tap "Submit & Analyze"
- [ ] Navigates to Result screen

**Pass criteria:** Form validates and submits.

---

### Step 7: Result Screen Display
- [ ] Fit score is displayed (0-100 scale)
- [ ] Confidence level is shown (HIGH/MED/LOW)
- [ ] Flagged ingredients are listed (if preferences set)
- [ ] Flags use preference-based language: "may be a concern based on your preferences"
- [ ] Disclaimer is visible
- [ ] "Save" button is visible

**Pass criteria:** Score, confidence, flags all render correctly.

---

### Step 8: Save Product
- [ ] Tap "Save" button
- [ ] Visual confirmation (button changes or toast appears)
- [ ] Navigate to Saved screen
- [ ] Product appears in saved list

**Pass criteria:** Product persists to saved list.

---

### Step 9: Saved List Persistence
- [ ] Close the app completely (swipe up in app switcher)
- [ ] Reopen the app
- [ ] Navigate to Saved screen
- [ ] Previously saved product is still there

**Pass criteria:** AsyncStorage persistence works.

---

### Step 10: Offline Mode (Airplane Mode Test)
- [ ] Enable Airplane Mode on simulator (Device → Airplane Mode, or use Network Link Conditioner)
- [ ] Try to scan/look up a new UPC
- [ ] App shows: "Online lookup unavailable" message (not a crash)
- [ ] Manual entry and local scoring still work
- [ ] Submit new product → saves locally
- [ ] App does not crash

**Pass criteria:** App degrades gracefully without network.

---

## Permission Prompts to Verify

| Permission | When Prompted | Expected Behavior |
|------------|---------------|-------------------|
| Network (optional) | Product lookup | App handles offline gracefully with "Online lookup unavailable" message |

> **Note:** Camera permission was removed in favor of manual UPC entry for Expo Go compatibility.

---

## Logs: Where to Find Them

### Expo Console Logs
Logs appear in the terminal where you ran `npm start`. Look for:
- `[Supabase]` - Database operations
- `[Storage]` - AsyncStorage operations
- `[Scoring]` - Ingredient scoring
- `[Analytics]` - Event tracking
- `[Logger]` - General app logs

### React Native LogBox
Warnings and errors appear as yellow/red overlays in the app during development.

### Simulator Console
For deeper debugging:
1. Open Xcode
2. Window → Devices and Simulators
3. Select your simulator
4. Click "Open Console"

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Missing Supabase URL" warning | Not configured | Expected for offline dev - ignore |
| Slow first load | Metro bundler cold start | Wait for bundle to complete |
| TypeScript errors on start | Dependencies issue | Run `npm install` again |
| Product lookup fails | Offline or Supabase not configured | Expected - use "Add Product" flow |
| Keyboard covers input | Platform difference | KeyboardAvoidingView should handle it |

---

## QA Sign-Off

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Step 1: Welcome screen | ☐ | ☐ | |
| Step 2: Preferences | ☐ | ☐ | |
| Step 3: Scan screen | ☐ | ☐ | |
| Step 4: UPC lookup | ☐ | ☐ | |
| Step 5: Not found flow | ☐ | ☐ | |
| Step 6: Submit product | ☐ | ☐ | |
| Step 7: Result display | ☐ | ☐ | |
| Step 8: Save product | ☐ | ☐ | |
| Step 9: Persistence | ☐ | ☐ | |
| Step 10: Offline mode | ☐ | ☐ | |

**Tester:** _________________ **Date:** _________________

**Overall Status:** PASS / FAIL

**Notes:**

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

**Pass criteria:** Welcome screen renders with disclaimer and all navigation buttons visible.

---

### Step 2: Preferences Screen
- [ ] Tap "Set Your Preferences" → navigates to Preferences
- [ ] All 5 toggle switches are visible (Fragrance, Parabens, Sulfates, Drying Alcohols, Essential Oils)
- [ ] Toggles respond to taps (on/off state changes)
- [ ] Custom ingredient input field works
- [ ] "Save Preferences" button is tappable and saves
- [ ] Enable at least Fragrance and Parabens for testing

**Pass criteria:** Can toggle preferences and save successfully.

---

### Step 3: Scan Screen Loads (Manual UPC Entry)
- [ ] From Welcome, tap "Scan Product" → Scan screen loads
- [ ] Title shows "Look Up Product"
- [ ] UPC input field is visible with placeholder "e.g., 012345678901"
- [ ] "Look Up Product" button is visible
- [ ] "Add Product Without UPC" link is visible below the button
- [ ] Info box explains where to find UPC on product packaging

**Pass criteria:** Scan screen loads with manual UPC entry form and all elements visible.

---

### Step 4: Invalid UPC Handling
- [ ] Leave UPC field empty
- [ ] Tap "Look Up Product" button
- [ ] Alert appears: "Invalid UPC" with message "Please enter a valid UPC code."
- [ ] Tap OK to dismiss
- [ ] App does not crash
- [ ] Input field remains usable

**Pass criteria:** Empty UPC shows friendly error alert and does not crash.

---

### Step 5: Product Not Found Flow
- [ ] Type: `012345678901` (test UPC unlikely to exist)
- [ ] Tap "Look Up Product" button
- [ ] Loading state shows "Looking up..."
- [ ] Alert appears: "Product Not Found" with message about adding it
- [ ] "Add Product" button is visible in alert
- [ ] Tap "Add Product" → navigates to Submit Product screen
- [ ] UPC is pre-filled in the form

**Pass criteria:** Unknown UPC shows not-found alert and navigates to product submission.

---

### Step 6: Submit New Product
- [ ] Fill in product name: `Test Moisturizer`
- [ ] Fill in brand: `TestBrand`
- [ ] Fill in ingredients: `Water, Glycerin, Niacinamide, Fragrance, Methylparaben`
- [ ] Tap "Submit & Analyze"
- [ ] Navigates to Result screen

**Pass criteria:** Form validates, submits, and navigates to results.

---

### Step 7: Result Screen Display
- [ ] Fit score is displayed (0-100 scale)
- [ ] Confidence level is shown (HIGH/MED/LOW)
- [ ] Flagged ingredients are listed (Fragrance and Methylparaben should be flagged)
- [ ] Flags show preference-based language (not medical claims)
- [ ] Disclaimer is visible at top of results
- [ ] "Save Product" button is visible

**Pass criteria:** Score, confidence, and flags all render correctly with compliant language.

---

### Step 8: Save Product
- [ ] Tap "Save Product" button
- [ ] Button changes to "Saved" (visual confirmation)
- [ ] Navigate back to Welcome screen
- [ ] Tap "View Saved Products"
- [ ] Product appears in saved list with fit score

**Pass criteria:** Product persists to saved list and displays correctly.

---

### Step 9: Persistence After Restart
- [ ] Close the app completely (swipe up in app switcher)
- [ ] Reopen the app
- [ ] Navigate to Saved screen
- [ ] Previously saved product is still there
- [ ] Fit score and product name are correct

**Pass criteria:** AsyncStorage persistence works across app restarts.

---

### Step 10: Offline Mode Behavior
- [ ] Enable Airplane Mode on simulator (Device → Airplane Mode)
- [ ] Navigate to Scan screen
- [ ] Enter any UPC and tap "Look Up Product"
- [ ] Alert appears: "Online Lookup Unavailable" (not a crash)
- [ ] Tap "Add Product" to add manually
- [ ] Submit new product → saves locally and shows results
- [ ] Local scoring still works (flags appear based on preferences)
- [ ] App does not crash at any point

**Pass criteria:** App degrades gracefully without network; local scoring and saving work.

---

## Offline Behavior Summary

| Action | Online | Offline |
|--------|--------|---------|
| UPC Lookup | Checks Supabase | Shows "Online Lookup Unavailable" alert |
| Add Product | Saves to Supabase (if enabled) | Saves locally only |
| Scoring | Works | Works (local engine) |
| Save to List | Works | Works (AsyncStorage) |
| View Saved | Works | Works |

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
| "Missing Supabase URL" warning | Supabase not configured | Expected for offline dev - ignore |
| Slow first load | Metro bundler cold start | Wait for bundle to complete |
| TypeScript errors on start | Dependencies issue | Run `npm install` again |
| Product lookup fails | Offline or Supabase not configured | Expected - use "Add Product" flow |
| Keyboard covers input | Platform difference | KeyboardAvoidingView should handle it |
| Offline banner appears | No network connectivity | Expected behavior - app still works |

---

## QA Sign-Off

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Step 1: Welcome screen | ☐ | ☐ | |
| Step 2: Preferences | ☐ | ☐ | |
| Step 3: Scan screen loads | ☐ | ☐ | |
| Step 4: Invalid UPC handling | ☐ | ☐ | |
| Step 5: Not found flow | ☐ | ☐ | |
| Step 6: Submit product | ☐ | ☐ | |
| Step 7: Result display | ☐ | ☐ | |
| Step 8: Save product | ☐ | ☐ | |
| Step 9: Persistence | ☐ | ☐ | |
| Step 10: Offline mode | ☐ | ☐ | |

**Tester:** _________________ **Date:** _________________

**Overall Status:** PASS / FAIL

**Notes:**

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
- [ ] Disclaimer text is visible: "for informational purposes only"
- [ ] "Get Started" button is tappable

**Pass criteria:** Welcome screen renders with disclaimer visible.

---

### Step 2: Preferences Screen
- [ ] Tap "Get Started" → navigates to Preferences
- [ ] All toggle switches are visible (Fragrance, Parabens, Sulfates, Silicones, Alcohol)
- [ ] Toggles respond to taps (on/off state changes)
- [ ] "Continue" button is tappable

**Pass criteria:** Can toggle preferences and proceed.

---

### Step 3: Camera Permission Prompt
- [ ] Tap "Continue" → Scan screen loads
- [ ] iOS camera permission dialog appears
- [ ] Tap "Allow" → camera preview shows

**Pass criteria:** Permission prompt appears and camera activates.

---

### Step 4: Manual UPC Entry
- [ ] Tap "Enter UPC manually" link
- [ ] Text input appears
- [ ] Type: `012345678901` (or any UPC)
- [ ] Tap "Look Up" button

**Pass criteria:** Manual entry modal works.

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
| Camera | First visit to Scan screen | iOS permission dialog appears |
| Camera denied | User denies permission | App shows "Camera access required" message with settings link |

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
| Camera shows black | Simulator limitation | Test on physical device |
| "Missing Supabase URL" warning | Not configured | Expected for offline dev - ignore |
| Slow first load | Metro bundler cold start | Wait for bundle to complete |
| TypeScript errors on start | Dependencies issue | Run `npm install` again |

---

## QA Sign-Off

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| Step 1: Welcome screen | ☐ | ☐ | |
| Step 2: Preferences | ☐ | ☐ | |
| Step 3: Camera permission | ☐ | ☐ | |
| Step 4: Manual UPC entry | ☐ | ☐ | |
| Step 5: Not found flow | ☐ | ☐ | |
| Step 6: Submit product | ☐ | ☐ | |
| Step 7: Result display | ☐ | ☐ | |
| Step 8: Save product | ☐ | ☐ | |
| Step 9: Persistence | ☐ | ☐ | |
| Step 10: Offline mode | ☐ | ☐ | |

**Tester:** _________________ **Date:** _________________

**Overall Status:** PASS / FAIL

**Notes:**

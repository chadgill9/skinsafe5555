# SkinSafe Delivery Plan

## Overview

Two-week sprint to ship MVP vertical slice.

**Goal:** Shippable iOS app that demonstrates core loop: Scan → Result → Save

---

## Week 1: Foundation + Core Loop

### Day 1-2: Project Setup ✅
- [x] Initialize Expo project with TypeScript
- [x] Configure expo-router navigation
- [x] Set up Supabase client
- [x] Create database schema
- [x] Implement AsyncStorage wrapper
- [x] Add analytics stubs

**Done when:** Project builds, TypeScript compiles, navigation works.

### Day 3-4: Scanning + Lookup ✅
- [x] Implement barcode scanner (expo-camera)
- [x] Add manual UPC entry fallback
- [x] Build product lookup from Supabase
- [x] Create product submission flow

**Done when:** User can scan barcode and see product info (or submit new).

### Day 5: Scoring Engine ✅
- [x] Implement ingredient tokenization
- [x] Add keyword matching for preference categories
- [x] Build boundary-aware matching (prevent false positives)
- [x] Calculate confidence levels
- [x] Return structured scoring result

**Done when:** Scoring function passes test cases.

---

## Week 2: Polish + Hardening

### Day 6-7: UI Polish
- [x] Welcome screen with disclaimer
- [x] Preferences screen with toggles + custom list
- [x] Result screen with score, flags, confidence
- [x] Saved products list screen
- [ ] Visual polish pass (spacing, colors, typography)

**Done when:** All screens implemented with compliance-safe copy.

### Day 8: Testing + Hardening
- [x] Add scoring test harness (10+ test cases)
- [x] Implement banned phrase checker (check:copy)
- [ ] Manual QA on iOS simulator
- [ ] Fix any TypeScript errors

**Done when:** All tests pass, no banned phrases in src/.

### Day 9: Documentation
- [x] MVP Definition document
- [x] Decision Log (8+ decisions)
- [x] Risk Register (10+ risks)
- [x] Delivery Plan (this document)
- [x] README with setup instructions

**Done when:** All docs in /docs, README complete.

### Day 10: Release Prep
- [ ] Final TypeScript check (npx tsc --noEmit)
- [ ] Run all verification scripts
- [ ] Export iOS build (npx expo export --platform ios)
- [ ] Verify build artifacts
- [ ] Tag release (v0.1.0-mvp)

**Done when:** iOS export succeeds, app runs on simulator.

---

## Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Project bootstrap | Day 2 | ✅ DONE |
| Core loop functional | Day 5 | ✅ DONE |
| All screens implemented | Day 7 | ✅ DONE |
| Tests + compliance checks | Day 8 | ✅ DONE |
| Documentation complete | Day 9 | ✅ DONE |
| iOS export successful | Day 10 | ⏳ PENDING |

---

## Definition of Done (MVP)

MVP is shippable when ALL of the following are true:

1. **Functional**
   - [ ] User can scan barcode or enter UPC
   - [ ] User can set ingredient preferences
   - [ ] User sees fit score + flags + confidence
   - [ ] User can save/unsave products
   - [ ] App works offline (without Supabase)

2. **Technical**
   - [ ] `npx tsc --noEmit` passes
   - [ ] `npm run test:scoring` passes (all 10+ cases)
   - [ ] `npm run check:copy` passes (no banned phrases)
   - [ ] `npx expo export --platform ios` succeeds

3. **Compliance**
   - [ ] No "safe/unsafe" language in UI
   - [ ] No medical claims
   - [ ] Disclaimers on Welcome, Result, Preferences screens
   - [ ] All flags use preference-based framing

4. **Documentation**
   - [ ] /docs/MVP_DEFINITION.md exists
   - [ ] /docs/DECISION_LOG.md has 8+ decisions
   - [ ] /docs/RISK_REGISTER.md has 10+ risks
   - [ ] /docs/DELIVERY_PLAN.md exists
   - [ ] README.md has setup instructions

---

## Post-MVP Backlog (Not in scope)

- User authentication
- Cross-device sync
- Product reviews
- Subscription/paywall
- OCR ingredient scanning
- Push notifications
- Social features

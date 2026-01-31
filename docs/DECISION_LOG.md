# SkinSafe Decision Log

Decisions are numbered and immutable. New decisions are appended. Reversals reference the original decision.

---

## D001: Use Expo React Native

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Need cross-platform mobile app (iOS + Android) with fast iteration.
**Decision:** Use Expo managed workflow with TypeScript.
**Rationale:**
- Single codebase for iOS and Android
- expo-camera provides barcode scanning out of the box
- expo-router gives file-based navigation (Next.js-like DX)
- Managed workflow means no native build complexity for MVP
- Can eject later if needed

**Consequences:** Limited access to native modules outside Expo ecosystem.

---

## D002: No Authentication for MVP

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Auth adds complexity. MVP needs to ship fast.
**Decision:** Skip authentication for MVP. Store all data locally.
**Rationale:**
- Reduces development time significantly
- No need for password reset, email verification, etc.
- User preferences are personal; local storage is acceptable
- Can add auth post-MVP when needed for sync/backup

**Consequences:** No cross-device sync. Data lost if app is deleted.

---

## D003: Keyword-Based Scoring (No AI/ML)

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Need to flag ingredients based on user preferences.
**Decision:** Use deterministic keyword matching, not ML models.
**Rationale:**
- Predictable and explainable results
- No API costs or latency
- Works offline
- Easier to test and validate
- Boundary-aware matching prevents false positives

**Consequences:** May miss ingredient variants or synonyms not in keyword lists.

---

## D004: Confidence Model Based on Token Count

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Ingredient lists vary in quality (full INCI vs. partial).
**Decision:** Assign confidence based on ingredient list characteristics:
- HIGH: ≥12 tokens + INCI format indicators
- MED: 6-11 tokens
- LOW: <6 tokens or missing

**Rationale:**
- Full INCI lists have many ingredients separated by commas
- Short lists may be incomplete or marketing copy
- Helps users understand result reliability

**Consequences:** Confidence is heuristic, not ground truth.

---

## D005: AsyncStorage for Local Persistence

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Need to persist preferences and saved products locally.
**Decision:** Use @react-native-async-storage/async-storage.
**Rationale:**
- Standard solution for React Native
- Simple key-value API
- Sufficient for MVP data sizes
- No SQLite complexity needed

**Consequences:** Not suitable for complex queries or large datasets.

---

## D006: Supabase for Cloud Database (Optional)

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Need shared product database for community contributions.
**Decision:** Use Supabase with PostgreSQL. Make it optional for MVP.
**Rationale:**
- Generous free tier
- Real-time capabilities for future features
- Row Level Security for when we add auth
- Works with Expo

**Consequences:** Adds external dependency. App must work offline.

---

## D007: Disable RLS for MVP

**Date:** 2025-01-30
**Status:** Accepted
**Context:** RLS requires auth. We have no auth in MVP.
**Decision:** Disable Row Level Security on products and scans tables.
**Rationale:**
- Products table contains only public product data (no PII)
- Scans table contains anonymous analytics (no user ID)
- Enables community-contributed product data
- Will enable RLS when auth is added post-MVP

**Consequences:** Anyone with anon key can read/write. Acceptable for MVP.

---

## D008: expo-camera for Barcode Scanning

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Need to scan product barcodes (UPC/EAN).
**Decision:** Use expo-camera's barcode scanning capability.
**Rationale:**
- Built into Expo ecosystem
- Supports UPC-A, UPC-E, EAN-13, EAN-8, Code128
- No additional dependencies needed
- Well-maintained

**Alternatives considered:**
- expo-barcode-scanner: Deprecated, wraps expo-camera anyway
- react-native-vision-camera: More powerful but requires bare workflow

**Consequences:** Tied to Expo's camera implementation.

---

## D009: No OCR for MVP

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Users may want to scan ingredient lists directly from packaging.
**Decision:** Do not implement OCR in MVP. Require manual entry or barcode scan.
**Rationale:**
- OCR adds significant complexity
- Accuracy varies with lighting, fonts, packaging
- Requires ML models or cloud APIs
- Manual entry is acceptable workaround

**Consequences:** Users must type ingredients for unlisted products.

---

## D010: Preference-Based Framing Only

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Healthcare apps must avoid medical claims.
**Decision:** Frame all results as preference-based, never as medical advice.
**Rationale:**
- Regulatory compliance (FDA, FTC)
- Reduces liability
- Accurate representation of what the app does
- "May be a concern based on your preferences" vs "Bad ingredient"

**Consequences:** Some users may want stronger guidance. We cannot provide it.

---

## D011: Ingredients Stored on Products Table

**Date:** 2025-01-30
**Status:** Accepted
**Context:** Need to store raw ingredient text for products.
**Decision:** Store `ingredients_raw_text` directly on the `products` table.
**Rationale:**
- Simpler schema (no joins required)
- One-to-one relationship (each product has one ingredient list)
- Faster reads for the primary use case (UPC lookup → score)
- Easier to maintain and reason about
- Alternative was separate `product_ingredients` table with FK

**Consequences:** Ingredient text is duplicated if product data is denormalized elsewhere (acceptable for MVP).

---

## D012: Supabase Writes Disabled by Default

**Date:** 2025-01-30
**Status:** Accepted
**Context:** MVP has no auth. Public writes to database are risky.
**Decision:** Add `EXPO_PUBLIC_ENABLE_SUPABASE_WRITES` flag, default to `false`.
**Rationale:**
- Prevents accidental insecure public submissions
- Reads remain enabled (product lookups work)
- Writes only enabled when explicitly configured
- Developer must consciously enable writes after understanding implications
- App still works fully offline

**Consequences:** New deployments must set flag to enable product submissions to cloud.

---

## Template for New Decisions

```
## D0XX: [Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by D0XX
**Context:** [What prompted this decision?]
**Decision:** [What was decided?]
**Rationale:** [Why?]
**Consequences:** [Trade-offs and implications]
```

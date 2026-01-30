-- SkinSafe MVP Database Schema
--
-- IMPORTANT DECISION LOG ENTRY:
-- For MVP, RLS (Row Level Security) is DISABLED to simplify development.
-- Products table: public read/write for MVP (community-contributed data)
-- Scans table: public insert for analytics (no sensitive data)
--
-- POST-MVP: Enable RLS with proper policies when auth is added.
-- See docs/DECISION_LOG.md for rationale.

-- =============================================================================
-- PRODUCTS TABLE
-- Stores product information including ingredients.
-- Community-contributed; no auth required for MVP.
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upc TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  ingredients_raw_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for UPC lookups (primary access pattern)
CREATE INDEX IF NOT EXISTS idx_products_upc ON products (upc);

-- Index for brand search (future feature)
CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- SCANS TABLE
-- Anonymous analytics: tracks scan events for product popularity & usage metrics.
-- No user-identifiable data. No auth required.
-- =============================================================================

CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upc TEXT NOT NULL,
  product_name TEXT,
  fit_score INTEGER,
  confidence TEXT CHECK (confidence IN ('HIGH', 'MED', 'LOW')),
  flags_json JSONB DEFAULT '[]'::jsonb,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries by UPC
CREATE INDEX IF NOT EXISTS idx_scans_upc ON scans (upc);

-- Index for time-based analytics
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans (scanned_at);

-- =============================================================================
-- RLS POLICY (DISABLED FOR MVP)
-- =============================================================================

-- For MVP, we disable RLS to allow anonymous access.
-- This is acceptable because:
-- 1. Products table contains only public product data (no PII)
-- 2. Scans table contains anonymous analytics (no user identification)
-- 3. No authentication system in MVP
--
-- To enable RLS post-MVP, uncomment and modify these policies:

-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Products are publicly readable"
--   ON products FOR SELECT
--   USING (true);

-- CREATE POLICY "Authenticated users can insert products"
--   ON products FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Anyone can insert scan events"
--   ON scans FOR INSERT
--   WITH CHECK (true);

-- =============================================================================
-- SAMPLE DATA (for development/testing)
-- =============================================================================

-- Uncomment to seed with test data:
/*
INSERT INTO products (upc, name, brand, ingredients_raw_text) VALUES
('012345678901', 'Test Moisturizer', 'TestBrand', 'Water, Glycerin, Niacinamide, Cetearyl Alcohol, Dimethicone, Petrolatum, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Xanthan Gum, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Ethylhexylglycerin'),
('012345678902', 'Fragrance Lotion', 'TestBrand', 'Water, Glycerin, Fragrance, Parfum, Methylparaben, Propylparaben, Sodium Lauryl Sulfate, Alcohol Denat'),
('012345678903', 'Gentle Cleanser', 'GentleCo', 'Aqua, Cocamidopropyl Betaine, Glycerin, Sodium Chloride, Citric Acid, Sodium Benzoate');
*/

/**
 * SkinSafe MVP Types
 * For informational purposes only - not medical advice
 */

export type ConfidenceLevel = 'HIGH' | 'MED' | 'LOW';

export interface UserPreferences {
  avoidFragrance: boolean;
  avoidParabens: boolean;
  avoidSulfates: boolean;
  avoidAlcohol: boolean;
  avoidEssentialOils: boolean;
  customAvoid: string[]; // user-defined ingredients to flag
}

export interface ScoringResult {
  fitScore: number; // 0-100, higher = better fit based on preferences
  flags: IngredientFlag[];
  confidence: ConfidenceLevel;
}

export interface IngredientFlag {
  ingredient: string;
  reason: string; // e.g., "May be a concern based on your fragrance preference"
  category: string; // e.g., "fragrance", "paraben", etc.
}

export interface Product {
  id?: string;
  upc: string;
  name: string;
  brand: string;
  ingredients_raw_text: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScanEvent {
  id?: string;
  upc: string;
  product_name: string;
  fit_score: number;
  confidence: ConfidenceLevel;
  flags_json: string; // JSON stringified IngredientFlag[]
  scanned_at: string;
}

export interface SavedScan {
  id: string;
  upc: string;
  productName: string;
  brand: string;
  fitScore: number;
  confidence: ConfidenceLevel;
  flags: IngredientFlag[];
  savedAt: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  avoidFragrance: false,
  avoidParabens: false,
  avoidSulfates: false,
  avoidAlcohol: false,
  avoidEssentialOils: false,
  customAvoid: [],
};

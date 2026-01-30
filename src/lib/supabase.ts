/**
 * Supabase Client & Data Access Layer
 *
 * For informational purposes only - not medical advice.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Product, ScanEvent, ConfidenceLevel } from '../types';

// Get env vars from Expo config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton client instance
let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create the Supabase client
 * Returns null if credentials are not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing URL or anon key. Running in offline mode.');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // No auth for MVP
      },
    });
  }

  return supabaseClient;
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Fetch a product by UPC code
 * Returns null if not found or if Supabase is not configured
 */
export async function getProductByUPC(upc: string): Promise<Product | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('upc', upc)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - product not found
        return null;
      }
      console.error('[Supabase] Error fetching product:', error.message);
      return null;
    }

    return data as Product;
  } catch (err) {
    console.error('[Supabase] Exception fetching product:', err);
    return null;
  }
}

/**
 * Add a new product to the database
 * Returns the created product or null on failure
 */
export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
  const client = getSupabaseClient();
  if (!client) {
    console.warn('[Supabase] Cannot add product - not configured');
    return null;
  }

  try {
    const { data, error } = await client
      .from('products')
      .insert({
        upc: product.upc,
        name: product.name,
        brand: product.brand,
        ingredients_raw_text: product.ingredients_raw_text,
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error adding product:', error.message);
      return null;
    }

    return data as Product;
  } catch (err) {
    console.error('[Supabase] Exception adding product:', err);
    return null;
  }
}

/**
 * Log a scan event for analytics
 * Returns true on success, false on failure
 */
export async function logScanEvent(
  upc: string,
  productName: string,
  fitScore: number,
  confidence: ConfidenceLevel,
  flags: unknown[]
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    // Silently skip logging if not configured
    return false;
  }

  try {
    const { error } = await client
      .from('scans')
      .insert({
        upc,
        product_name: productName,
        fit_score: fitScore,
        confidence,
        flags_json: JSON.stringify(flags),
        scanned_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[Supabase] Error logging scan:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Supabase] Exception logging scan:', err);
    return false;
  }
}

/**
 * Health check - test database connectivity
 */
export async function checkConnection(): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  try {
    const { error } = await client.from('products').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

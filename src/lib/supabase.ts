/**
 * Supabase Client & Data Access Layer
 *
 * For informational purposes only - not medical advice.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Product, ConfidenceLevel } from '../types';
import { logInfo, logWarn, logError } from './logger';

const TAG = 'Supabase';

// Get env vars from Expo config
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const writesEnabled = (
  Constants.expoConfig?.extra?.enableSupabaseWrites ||
  process.env.EXPO_PUBLIC_ENABLE_SUPABASE_WRITES || 'false'
) === 'true';

// Singleton client instance
let supabaseClient: SupabaseClient | null = null;

// Error result type for typed error handling
export interface SupabaseResult<T> {
  data: T | null;
  error: string | null;
  offline: boolean;
}

/**
 * Get or create the Supabase client
 * Returns null if credentials are not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    logWarn(TAG, 'Missing URL or anon key. Running in offline mode.');
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // No auth for MVP
      },
    });
    logInfo(TAG, 'Client initialized', { writesEnabled });
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
 * Check if Supabase writes are enabled
 */
export function areWritesEnabled(): boolean {
  return writesEnabled;
}

/**
 * Fetch a product by UPC code
 * Returns typed result with error handling
 */
export async function getProductByUPC(upc: string): Promise<SupabaseResult<Product>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: null, offline: true };
  }

  try {
    logInfo(TAG, 'Looking up product', { upc });

    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('upc', upc)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - product not found (not an error)
        logInfo(TAG, 'Product not found', { upc });
        return { data: null, error: null, offline: false };
      }
      logError(TAG, 'Error fetching product', { upc, error: error.message });
      return { data: null, error: error.message, offline: false };
    }

    logInfo(TAG, 'Product found', { upc, name: data.name });
    return { data: data as Product, error: null, offline: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    logError(TAG, 'Exception fetching product', { upc, error: message });
    return { data: null, error: message, offline: true };
  }
}

/**
 * Add a new product to the database
 * NO-OPS if writes are disabled (returns null with no error)
 */
export async function addProduct(
  product: Omit<Product, 'id' | 'created_at' | 'updated_at'>
): Promise<SupabaseResult<Product>> {
  // Check if writes are enabled
  if (!writesEnabled) {
    logWarn(TAG, 'Writes disabled. Product not saved to cloud.', { upc: product.upc });
    return { data: null, error: null, offline: false };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: null, offline: true };
  }

  try {
    logInfo(TAG, 'Adding product', { upc: product.upc, name: product.name });

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
      logError(TAG, 'Error adding product', { upc: product.upc, error: error.message });
      return { data: null, error: error.message, offline: false };
    }

    logInfo(TAG, 'Product added successfully', { upc: product.upc });
    return { data: data as Product, error: null, offline: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    logError(TAG, 'Exception adding product', { upc: product.upc, error: message });
    return { data: null, error: message, offline: true };
  }
}

/**
 * Log a scan event for analytics
 * NO-OPS if writes are disabled
 */
export async function logScanEvent(
  upc: string,
  productName: string,
  fitScore: number,
  confidence: ConfidenceLevel,
  flags: unknown[]
): Promise<SupabaseResult<boolean>> {
  // Check if writes are enabled
  if (!writesEnabled) {
    // Silently skip - this is expected behavior
    return { data: false, error: null, offline: false };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { data: false, error: null, offline: true };
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
      logError(TAG, 'Error logging scan', { upc, error: error.message });
      return { data: false, error: error.message, offline: false };
    }

    return { data: true, error: null, offline: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    logError(TAG, 'Exception logging scan', { upc, error: message });
    return { data: false, error: message, offline: true };
  }
}

/**
 * Health check - test database connectivity
 */
export async function checkConnection(): Promise<SupabaseResult<boolean>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: false, error: null, offline: true };
  }

  try {
    const { error } = await client.from('products').select('id').limit(1);
    if (error) {
      return { data: false, error: error.message, offline: false };
    }
    return { data: true, error: null, offline: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { data: false, error: message, offline: true };
  }
}

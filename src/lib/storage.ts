/**
 * Local Storage Layer using AsyncStorage
 *
 * Handles persistence of user preferences and saved scans.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, SavedScan, DEFAULT_PREFERENCES } from '../types';
import { toBool } from './boolean';

const KEYS = {
  PREFERENCES: '@skinsafe_preferences',
  SAVED_SCANS: '@skinsafe_saved_scans',
  ONBOARDING_COMPLETE: '@skinsafe_onboarding_complete',
};

/**
 * Save user preferences
 */
export async function savePreferences(preferences: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('[Storage] Error saving preferences:', error);
    throw error;
  }
}

/**
 * Sanitize preferences to ensure all boolean fields are actual booleans.
 * This prevents native component crashes from string "true"/"false" values.
 */
function sanitizePreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_PREFERENCES;
  }
  const obj = raw as Record<string, unknown>;
  return {
    avoidFragrance: toBool(obj.avoidFragrance, DEFAULT_PREFERENCES.avoidFragrance),
    avoidParabens: toBool(obj.avoidParabens, DEFAULT_PREFERENCES.avoidParabens),
    avoidSulfates: toBool(obj.avoidSulfates, DEFAULT_PREFERENCES.avoidSulfates),
    avoidAlcohol: toBool(obj.avoidAlcohol, DEFAULT_PREFERENCES.avoidAlcohol),
    avoidEssentialOils: toBool(obj.avoidEssentialOils, DEFAULT_PREFERENCES.avoidEssentialOils),
    customAvoid: Array.isArray(obj.customAvoid) ? obj.customAvoid : DEFAULT_PREFERENCES.customAvoid,
  };
}

/**
 * Load user preferences
 */
export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const json = await AsyncStorage.getItem(KEYS.PREFERENCES);
    if (json) {
      const parsed = JSON.parse(json);
      return sanitizePreferences(parsed);
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('[Storage] Error loading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save a scan to the saved list
 */
export async function saveScan(scan: SavedScan): Promise<void> {
  try {
    const existing = await loadSavedScans();
    // Check for duplicates by UPC - update if exists
    const index = existing.findIndex((s) => s.upc === scan.upc);
    if (index >= 0) {
      existing[index] = scan;
    } else {
      existing.unshift(scan); // Add to front
    }
    await AsyncStorage.setItem(KEYS.SAVED_SCANS, JSON.stringify(existing));
  } catch (error) {
    console.error('[Storage] Error saving scan:', error);
    throw error;
  }
}

/**
 * Remove a scan from the saved list
 */
export async function removeScan(upc: string): Promise<void> {
  try {
    const existing = await loadSavedScans();
    const filtered = existing.filter((s) => s.upc !== upc);
    await AsyncStorage.setItem(KEYS.SAVED_SCANS, JSON.stringify(filtered));
  } catch (error) {
    console.error('[Storage] Error removing scan:', error);
    throw error;
  }
}

/**
 * Load all saved scans
 */
export async function loadSavedScans(): Promise<SavedScan[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.SAVED_SCANS);
    if (json) {
      return JSON.parse(json) as SavedScan[];
    }
    return [];
  } catch (error) {
    console.error('[Storage] Error loading saved scans:', error);
    return [];
  }
}

/**
 * Check if a UPC is in the saved list
 */
export async function isScanSaved(upc: string): Promise<boolean> {
  const scans = await loadSavedScans();
  return scans.some((s) => s.upc === upc);
}

/**
 * Mark onboarding as complete
 */
export async function setOnboardingComplete(complete: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, JSON.stringify(complete));
  } catch (error) {
    console.error('[Storage] Error setting onboarding status:', error);
  }
}

/**
 * Check if onboarding is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return toBool(value, false);
  } catch (error) {
    console.error('[Storage] Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Clear all app data (for debugging/reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.PREFERENCES,
      KEYS.SAVED_SCANS,
      KEYS.ONBOARDING_COMPLETE,
    ]);
  } catch (error) {
    console.error('[Storage] Error clearing data:', error);
    throw error;
  }
}

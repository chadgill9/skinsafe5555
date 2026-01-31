/**
 * Boolean Type Safety Utilities
 *
 * Ensures values crossing boundaries (AsyncStorage, params, env) are proper booleans.
 * React Native native components crash with string "true"/"false" values.
 */

/**
 * Safely coerce any value to a boolean.
 * Handles:
 * - Actual booleans (pass through)
 * - String "true"/"false" (from AsyncStorage, params)
 * - Null/undefined (returns fallback)
 * - Any other value (returns fallback)
 */
export function toBool(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return fallback;
}

/**
 * DEV-only assertion that a value is a boolean.
 * Logs a warning if the value is not a boolean at runtime.
 */
export function assertBool(value: unknown, name: string): void {
  if (__DEV__ && typeof value !== 'boolean') {
    console.warn(
      `[Boolean] Expected boolean for "${name}", got ${typeof value}: ${JSON.stringify(value)}`
    );
  }
}

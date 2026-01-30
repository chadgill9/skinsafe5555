/**
 * Analytics Stubs
 *
 * Minimal analytics interface for MVP.
 * Replace with actual analytics provider (Amplitude, Mixpanel, etc.) post-MVP.
 */

export type AnalyticsEvent =
  | 'app_open'
  | 'preferences_updated'
  | 'scan_started'
  | 'scan_completed'
  | 'scan_failed'
  | 'product_not_found'
  | 'product_submitted'
  | 'result_viewed'
  | 'product_saved'
  | 'product_unsaved'
  | 'saved_list_viewed'
  | 'manual_upc_entered';

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

// In-memory event log for debugging (dev only)
const eventLog: Array<{ event: AnalyticsEvent; properties?: EventProperties; timestamp: string }> = [];

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  const entry = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  // Log to console in dev
  if (__DEV__) {
    console.log('[Analytics]', event, properties || '');
    eventLog.push(entry);
  }

  // TODO: Send to analytics provider
  // Example: amplitude.track(event, properties);
}

/**
 * Set user properties (e.g., preferences summary)
 */
export function setUserProperties(properties: EventProperties): void {
  if (__DEV__) {
    console.log('[Analytics] User properties:', properties);
  }

  // TODO: Send to analytics provider
  // Example: amplitude.setUserProperties(properties);
}

/**
 * Get event log (dev only, for debugging)
 */
export function getEventLog(): typeof eventLog {
  return [...eventLog];
}

/**
 * Clear event log (dev only)
 */
export function clearEventLog(): void {
  eventLog.length = 0;
}

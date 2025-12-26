/**
 * Haptics Utility - Centralized haptic feedback for the Sanctuary experience
 * 
 * Provides consistent tactile feedback across the app.
 * All haptic calls go through here for easy tuning.
 */

import * as Haptics from 'expo-haptics';

/**
 * Light tap feedback - for minor interactions
 * Use for: small buttons, toggles, selections
 */
export function tapLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Medium tap feedback - for standard interactions
 * Use for: pull to refresh, significant taps
 */
export function tapMedium() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/**
 * Heavy tap feedback - for major interactions
 * Use for: sync start, drag drop, important actions
 */
export function tapHeavy() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/**
 * Selection feedback - for navigation and selection changes
 * Use for: tab switches, picker changes, focus changes
 */
export function selection() {
  Haptics.selectionAsync();
}

/**
 * Success notification - for positive outcomes
 * Use for: task complete, save success, login success
 */
export function success() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Warning notification - for cautionary states
 * Use for: approaching limits, needs attention
 */
export function warning() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

/**
 * Error notification - for negative outcomes
 * Use for: delete, error, validation failure
 */
export function error() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

// Named export for convenience
export const haptics = {
  tapLight,
  tapMedium,
  tapHeavy,
  selection,
  success,
  warning,
  error,
};

export default haptics;

/**
 * VIXUAL Trust Score -- Event Weights
 *
 * Positive deltas increase the score, negative deltas decrease it.
 * Score is always clamped between 0 and 100.
 */

import type { TrustEventType } from "./types";

export const TRUST_WEIGHTS: Record<TrustEventType, number> = {
  // Positive
  email_verified: +5,
  phone_verified: +5,
  kyc_verified: +15,
  first_investment: +10,
  content_validated: +8,
  regular_login: +2,
  streak_7_days: +3,
  streak_30_days: +5,
  guardian_approved: +5,
  profile_completed: +4,
  referral_success: +3,

  // Negative
  fraud_detected: -30,
  chargeback: -25,
  spam_reported: -15,
  abuse_reported: -10,
  payment_failed: -8,
  content_rejected: -5,
  suspension_warning: -5,
  suspension_temporary: -20,
  suspension_permanent: -30,
  inactivity_90_days: -5,

  // Admin (applied via admin routes, weight is just default)
  admin_boost: +10,
  admin_penalty: -15,
};

/**
 * Initial trust score for new users
 */
export const TRUST_INITIAL_SCORE = 50;

/**
 * Trust level thresholds and labels
 */
export const TRUST_LEVELS = {
  exemplary: { min: 90, max: 100, label: "Exemplaire", color: "emerald" },
  very_reliable: { min: 75, max: 89, label: "Tres fiable", color: "teal" },
  correct: { min: 60, max: 74, label: "Correct", color: "blue" },
  to_watch: { min: 40, max: 59, label: "A surveiller", color: "amber" },
  at_risk: { min: 0, max: 39, label: "A risque", color: "rose" },
} as const;

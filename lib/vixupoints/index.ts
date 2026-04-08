/**
 * VIXUAL - VIXUpoints Module
 * 
 * Re-export de tous les elements du systeme VIXUpoints V1.
 */

export * from "./engine";

// Re-export du moteur VIXUpoints
export {
  // Types
  type ParentConsentStatus,
  type ParentConsent,
  type UserVixupointsProfile,
  type VixupointsPack,
  type EngagementRedirectLevel,
  type EngagementRedirectResult,
  
  // Constants
  VIXUPOINTS_PER_EUR,
  MINOR_VIXUPOINTS_CAP,
  ADULT_VISITOR_CAP,
  MINOR_MIN_AGE,
  MAJORITY_AGE,
  DAILY_VIXUPOINTS_CAP,
  WEEKLY_VIXUPOINTS_CAP,
  VIXUPOINTS_ACTIONS,
  PROFILE_VIXUPOINTS_CONFIG,
  VIXUPOINTS_PEDAGOGIC_MESSAGE,
  VIXUPOINTS_LIMIT_WARNING,
  VIXUPOINTS_PACKS,
  MICROPACKS_ELIGIBLE_PROFILES,
  MICROPACKS_LIMITS,
  DEFAULT_PARENT_CONSENT,
  MINOR_PARENT_CONSENT,
  VIXUPOINTS_CONVERSION_THRESHOLD,
  VIXUPOINTS_MAX_DAILY,
  VIXUPOINTS_PROFILE_CAPS,
  
  // Functions
  computeAge,
  isMinor,
  isEligibleForSignup,
  creditVixupoints,
  creditVixupointsCapped,
  detectVixupointsAbuse,
  canWithdraw,
  canInvest,
  canConvertVixupoints,
  canBuyMicropacks,
  engagementRedirectEngine,
  computeHybridPurchase,
  checkMajorityUnlock,
} from "@/lib/vixupoints-engine";

/**
 * VIXUAL - VIXUpoints Module
 * 
 * Re-export de tous les elements du systeme VIXUpoints V1.
 */

export * from "./engine";

// Re-export du moteur legacy pour compatibilite
export {
  // Types
  type ParentConsentStatus,
  type ParentConsent,
  type UserVisupointsProfile,
  type VixupointsPack,
  type EngagementRedirectLevel,
  type EngagementRedirectResult,
  
  // Constants
  VIXUPOINTS_PER_EUR,
  MINOR_VISUPOINTS_CAP,
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
  
  // Backward compat aliases (using correct export names from visupoints-engine)
  VISUPOINTS_CONVERSION_THRESHOLD,
  VISUPOINTS_PER_EUR,
  VISUPOINTS_MAX_DAILY,
  DAILY_VIXUPOINTS_CAP as DAILY_VISUPOINTS_CAP,
  VISUPOINTS_PROFILE_CAPS,
  VISUPOINTS_PROFILE_CAPS as PROFILE_CAPS,
  
  // Micro-packs
  VIXUPOINTS_PACKS,
  
  // Functions
  computeAge,
  isMinor,
  isEligibleForSignup,
  creditVisupoints,
  creditVisupointsCapped,
  detectVisupointsAbuse,
  canWithdraw,
  canInvest,
  canConvertVisupoints,
  canBuyMicropacks,
  engagementRedirectEngine,
  computeHybridPurchase,
  checkMajorityUnlock,
} from "@/lib/visupoints-engine";

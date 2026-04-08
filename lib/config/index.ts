/**
 * VIXUAL - Central Configuration Index
 * 
 * Point d'entree unique pour toutes les configurations de la plateforme.
 * Import: import { ... } from "@/lib/config"
 */

// ── Stripe Configuration ──
export {
  getStripeConfig,
  invalidateStripeConfigCache,
  maskKey,
  encryptValue,
  decryptValue,
  type StripeMode,
  type StripeRuntimeConfig,
} from "../stripe-config";

export {
  stripe,
  getStripeClient,
  getStripe,
  getStripeSafe,
  isStripeConfigured,
  getStripeMode,
  logStripeEvent,
  STRIPE_WEBHOOK_SECRET,
} from "../stripe";

// ── Payout Configuration ──
export {
  CAUTION_EUR,
  STRIPE_FEE_PERCENT,
  PLATFORM_FEE_PERCENT,
  CREATOR_SHARE,
  VIXUPOINTS_PER_EUR,
  MIN_PAYOUT_EUR,
  INVESTMENT_TIERS_EUR,
} from "../payout/constants";

// ── Trust Configuration ──
export {
  TRUST_WEIGHTS,
  TRUST_LEVELS,
  TRUST_INITIAL_SCORE,
} from "../trust/weights";

// ── Feature Flags ──
export {
  isFeatureEnabled,
  getEnabledFeatures,
  shouldRolloutFeature,
  type FeatureFlagKey,
} from "../feature-flags";

// ── Branding ──
export {
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
  PATRON_EMAIL,
  VIDEO_BRANDING,
  OFFICIAL_URLS,
  VERSION_INFO,
} from "../branding";

// ── Environment Helpers ──
export function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`[VIXUAL] Variable d'environnement requise: ${key}`);
  }
  return value;
}

export function getEnvSafe(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

// ── Cache TTLs (in seconds) ──
export const CACHE_TTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
  STRIPE: 60,       // 1 minute (config refresh)
  TRUST: 300,       // 5 minutes
} as const;

// ── Rate Limits ──
export const RATE_LIMITS = {
  API_GENERAL: { requests: 100, windowMs: 60_000 },
  API_AUTH: { requests: 10, windowMs: 60_000 },
  API_PAYMENT: { requests: 20, windowMs: 60_000 },
  PROMO_EMAIL: { requests: 4, windowMs: 30 * 24 * 60 * 60_000 }, // 4 per month
  SHARE: { requests: 10, windowMs: 24 * 60 * 60_000 }, // 10 per day
} as const;

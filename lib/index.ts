/**
 * VIXUAL — Central Export Barrel
 * ───────────────────────────────────────────────────────────────────────────────
 * Point d'entree unique pour les modules `lib/` les plus utilises.
 * Simplifie les imports et assure la coherence dans tout le projet.
 *
 * Usage :
 *   import { sql, env, ADMIN_PATRON_EMAIL, isFeatureEnabled } from "@/lib"
 *
 * Ne PAS importer ici des modules contenant des side-effects au top-level
 * (ex: scripts de migration). Garder ce barrel "pur".
 */

// ── Core ──────────────────────────────────────────────────────────────────────

export { sql, isDatabaseConfigured } from "./db"
export {
  env,
  validateEnv,
  requireEnv,
  isProduction,
  isDevelopment,
  isStripeTestMode,
  isValidEmail,
  isValidUrl,
  isValidJwtSecret,
} from "./env"
export { cn } from "./utils"

// ── Admin & Config ────────────────────────────────────────────────────────────

export { ADMIN_PATRON_EMAIL, isAdminPatron } from "./admin-config"

// ── Stripe ────────────────────────────────────────────────────────────────────

export {
  getStripeClient,
  getStripe,
  stripe,
  getStripeSafe,
  isStripeConfigured,
  isStripeConfiguredAsync,
  getWebhookSecret,
  getStripeModeAsync,
  getStripeMode,
  logStripeEvent,
} from "./stripe"

export {
  getStripeConfig,
  getStripeConfigFresh,
  encryptValue,
  decryptValue,
  maskKey,
  isValidStripeKey,
  validateStripeKeyFormat,
  detectKeyMode,
  type StripeRuntimeConfig,
  type StripeMode,
} from "./stripe-config"

// ── Features ──────────────────────────────────────────────────────────────────

export {
  FEATURES,
  isFeatureEnabled,
  isFeatureEnabledForUser,
  getFeaturesByVersion,
  getEnabledFeatures,
  updateFeatureFlag,
  type FeatureFlag,
  type FeatureVersion,
  type FeatureConfig,
} from "./feature-flags"

// ── Homepage ──────────────────────────────────────────────────────────────────

export {
  DEFAULT_HOMEPAGE_CONFIG,
  getHomepageConfig,
  saveHomepageConfig,
  resetHomepageConfig,
  type HomepageConfigV1,
  type HomepageRowType,
  type HomepageCard,
  type HomepageRow,
  type HomepageHero,
} from "./homepage-config"

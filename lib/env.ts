/**
 * lib/env.ts
 * ───────────────────────────────────────────────────────────────────────────────
 * Validation stricte des variables d'environnement VIXUAL.
 * Pas de grosse librairie — juste des helpers simples + validation au demarrage.
 */

// ── Validation Helpers (exports pour reutilisation dans tests/UI) ──

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidJwtSecret(secret: string): boolean {
  return secret.length >= 32
}

// ── Config exportee ──

export const env = {
  // App
  appName: process.env.NEXT_PUBLIC_APP_NAME || "VIXUAL",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  nodeEnv: (process.env.NODE_ENV || "development") as "development" | "production" | "test",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",

  // Admin
  adminEmail:
    process.env.VIXUAL_ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.PATRON_EMAIL ||
    "jocelyndru@gmail.com",

  // Stripe (convention officielle avec fallback temporaire)
  stripeMode: (process.env.STRIPE_MODE || "test") as "test" | "live",
  stripeSecretKey:
    process.env.STRIPE_TEST_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY_TEST ||
    process.env.STRIPE_SECRET_KEY ||
    "",
  stripePublishableKey:
    process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "",
  stripeWebhookSecret:
    process.env.STRIPE_TEST_WEBHOOK_SECRET ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    "",

  // Bunny
  bunnyEnabled: process.env.BUNNY_ENABLED === "true",
  bunnyApiKey: process.env.BUNNY_API_KEY || "",
  bunnyStorageZone: process.env.BUNNY_STORAGE_ZONE || "",
  bunnyPullZoneUrl: process.env.BUNNY_PULL_ZONE_URL || "",

  // Database
  databaseUrl: process.env.DATABASE_URL || "",

  // Auth
  jwtSecret: process.env.JWT_SECRET || "",

  // Test Lab
  testLabEnabled: process.env.VIXUAL_TEST_LAB_ENABLED === "true",
  testLabMode: (process.env.VIXUAL_TEST_LAB_MODE || "local") as "local" | "isolated",

  // Feature Flags
  creatorChannelsEnabled: process.env.ENABLE_CREATOR_CHANNELS === "true",
} as const

// ── Validation au demarrage ──

function runValidation(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // DATABASE_URL — CRITIQUE
  if (!process.env.DATABASE_URL) {
    errors.push("DATABASE_URL is required")
  } else if (!process.env.DATABASE_URL.startsWith("postgres")) {
    errors.push("DATABASE_URL must be a valid PostgreSQL connection string")
  }

  // JWT_SECRET — CRITIQUE
  if (!process.env.JWT_SECRET) {
    errors.push("JWT_SECRET is required")
  } else if (!isValidJwtSecret(process.env.JWT_SECRET)) {
    errors.push("JWT_SECRET must be at least 32 characters")
  }

  // Admin Email — VALIDATION format
  const adminEmail =
    process.env.VIXUAL_ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.PATRON_EMAIL
  if (adminEmail && !isValidEmail(adminEmail)) {
    errors.push("Admin email format is invalid")
  }

  // App URL — VALIDATION format
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL
  if (appUrl && !isValidUrl(appUrl)) {
    errors.push("NEXT_PUBLIC_APP_URL must be a valid URL")
  }

  // Stripe Keys — FORMAT
  const stripeSecret = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY
  if (stripeSecret && !stripeSecret.startsWith("sk_")) {
    errors.push("Stripe secret key must start with 'sk_'")
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Verifie que les variables critiques sont definies (a appeler au demarrage si besoin).
 * Retourne `{ ok, missing }` pour conserver la compatibilite ascendante.
 * En production, throw si la validation echoue.
 */
export function validateEnv(): { ok: boolean; missing: string[] } {
  const validation = runValidation()

  if (!validation.valid && env.isDev) {
    console.warn("[VIXUAL] Validation env echouee:")
    validation.errors.forEach((err) => console.warn(`  - ${err}`))
  }

  if (!validation.valid && env.isProd) {
    console.error("[VIXUAL] ERREUR CRITIQUE: Validation env echouee en production!")
    validation.errors.forEach((err) => console.error(`  - ${err}`))
    throw new Error(`Environment validation failed: ${validation.errors.join(", ")}`)
  }

  // Compat ascendante : `missing` reste un array de strings.
  return { ok: validation.valid, missing: validation.errors }
}

// ── Helpers typés ──

export function requireEnv(key: keyof typeof env): string | boolean {
  const value = env[key]
  if (value === undefined || value === null || value === "") {
    throw new Error(`[VIXUAL] Required environment variable ${String(key)} is not set`)
  }
  return value
}

export function isProduction(): boolean {
  return env.isProd
}

export function isDevelopment(): boolean {
  return env.isDev
}

export function isStripeTestMode(): boolean {
  return env.stripeMode === "test"
}

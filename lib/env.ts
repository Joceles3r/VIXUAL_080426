/**
 * lib/env.ts
 * ───────────────────────────────────────────────────────────────────────────────
 * Validation legere des variables d'environnement VIXUAL.
 * Pas de grosse librairie — juste des helpers simples.
 */

export const env = {
  // App
  appName: process.env.NEXT_PUBLIC_APP_NAME || "VIXUAL",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
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

  // Test Lab
  testLabEnabled: process.env.VIXUAL_TEST_LAB_ENABLED === "true",
  testLabMode: process.env.VIXUAL_TEST_LAB_MODE || "local",
}

/**
 * Verifie que les variables critiques sont definies (a appeler au demarrage si besoin).
 */
export function validateEnv(): { ok: boolean; missing: string[] } {
  const required = ["DATABASE_URL", "JWT_SECRET"]
  const missing = required.filter((key) => !process.env[key])
  return { ok: missing.length === 0, missing }
}

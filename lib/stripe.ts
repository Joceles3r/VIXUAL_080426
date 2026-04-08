/**
 * VIXUAL — lib/stripe.ts  (version mise à jour)
 *
 * Ce fichier remplace l'ancienne version qui lisait directement process.env.
 * La configuration est maintenant chargée depuis :
 *   1. La base de données (table stripe_config) — priorité
 *   2. Les variables d'environnement (.env.local) — fallback
 *
 * SERVER ONLY.
 */
import "server-only";
import Stripe from "stripe";
import { getStripeConfig } from "./stripe-config";

// ── Client Stripe (initialisé de façon lazy pour permettre la config DB) ──

let _stripeClient: Stripe | null = null;
let _clientMode: string | null = null;

/**
 * Retourne une instance Stripe configurée avec les clés actives.
 * Utilise un singleton invalidé si le mode change.
 */
export async function getStripeClient(): Promise<Stripe> {
  const config = await getStripeConfig();

  // Re-create client if mode or key changed
  if (!_stripeClient || _clientMode !== config.secretKey) {
    if (!config.secretKey) {
      throw new Error(
        "[VIXUAL] Aucune clé secrète Stripe configurée. " +
          "Ajoutez vos clés depuis l'Admin → Config Stripe, " +
          "ou définissez STRIPE_TEST_SECRET_KEY dans .env.local"
      );
    }
    _stripeClient = new Stripe(config.secretKey, {
      apiVersion: "2025-04-30.basil",
      typescript: true,
    });
    _clientMode = config.secretKey;
  }

  return _stripeClient;
}

/**
 * Instance synchrone (compatible avec le code existant).
 * Lit depuis process.env comme avant pour ne pas casser les imports existants.
 * À terme, migrer vers getStripeClient().
 */
const legacySecretKey =
  process.env.STRIPE_TEST_SECRET_KEY ||
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_LIVE_SECRET_KEY;

// Fallback gracieux si aucune clé n'est encore configurée
const _stripeSync = legacySecretKey
  ? new Stripe(legacySecretKey, {
      apiVersion: "2025-04-30.basil",
      typescript: true,
    })
  : null;

export const stripe = _stripeSync as Stripe;

/**
 * Safe Stripe getter - throws if Stripe is not configured
 * Use this instead of `stripe` directly for safer access
 */
export function getStripeSafe(): Stripe {
  if (!_stripeSync) {
    throw new Error(
      "[VIXUAL] Stripe non configure. Ajoutez vos cles depuis Admin → Config Stripe " +
      "ou definissez STRIPE_SECRET_KEY dans les variables d'environnement."
    );
  }
  return _stripeSync;
}

/**
 * Check if Stripe is configured (sync - uses env vars)
 */
export function isStripeConfigured(): boolean {
  return _stripeSync !== null;
}

/**
 * Check if Stripe is configured (async - uses DB config)
 */
export async function isStripeConfiguredAsync(): Promise<boolean> {
  const config = await getStripeConfig();
  return !!config.secretKey;
}

/**
 * Get webhook secret (async - from DB config)
 */
export async function getWebhookSecret(): Promise<string> {
  const config = await getStripeConfig();
  return config.webhookSecret;
}

// ── Webhook secret (sync fallback) ────────────────────────────────────────────

export const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_TEST_WEBHOOK_SECRET ||
  process.env.STRIPE_WEBHOOK_SECRET ||
  process.env.STRIPE_LIVE_WEBHOOK_SECRET;

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getStripeMode() {
  const isTest = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE !== "false";
  return {
    isTest,
    environment: (isTest ? "TEST" : "LIVE") as "TEST" | "LIVE",
    warning: isTest
      ? "MODE TEST - Aucune transaction réelle"
      : "MODE LIVE - Transactions réelles actives",
  };
}

export function logStripeEvent(event: string, data: Record<string, unknown>) {
  const mode = getStripeMode();
  const prefix = mode.isTest ? "[STRIPE TEST]" : "[STRIPE LIVE]";
  console.log(`${prefix} ${event}`, {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

/**
 * Alias pour getStripeClient (compatibilité avec anciens imports)
 */
export const getStripe = getStripeClient;

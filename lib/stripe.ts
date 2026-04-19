/**
 * VIXUAL — lib/stripe.ts  (finale)
 *
 * La configuration Stripe est chargée exclusivement côté serveur.
 *
 * Ordre de résolution :
 *   1. Base de données (table stripe_config) — SOURCE DE VÉRITÉ
 *   2. Variables d'environnement (.env.local / Vercel env) — fallback
 *
 * Principe : toute opération Stripe doit passer par getStripeClient() (async).
 * Le client sync historique (`stripe` / `getStripeSafe`) est conservé
 * UNIQUEMENT pour la compatibilité et n'est utilisable que si une variable
 * d'environnement STRIPE_*_SECRET_KEY est définie.
 *
 * SERVER ONLY.
 */
import "server-only";
import Stripe from "stripe";
import { getStripeConfig } from "./stripe-config";

// ── Version API Stripe officiellement supportée par VIXUAL ───────────────────

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2025-04-30.basil";

// ── Client Stripe asynchrone (recommandé) ─────────────────────────────────────

let _stripeClient: Stripe | null = null;
let _clientFingerprint: string | null = null;

/**
 * Retourne une instance Stripe configurée avec les clés actives (DB puis env).
 * Singleton invalidé automatiquement si la clé secrète change.
 *
 * C'est la fonction à utiliser partout dans le code métier.
 */
export async function getStripeClient(): Promise<Stripe> {
  const config = await getStripeConfig();

  if (!config.secretKey) {
    throw new Error(
      "[VIXUAL] Aucune clé secrète Stripe configurée. " +
        "Ajoutez vos clés depuis l'Admin → Config Stripe, " +
        "ou définissez STRIPE_TEST_SECRET_KEY dans .env.local"
    );
  }

  // Fingerprint = secretKey + mode pour détecter changement de configuration
  const fingerprint = `${config.mode}:${config.secretKey}`;
  if (!_stripeClient || _clientFingerprint !== fingerprint) {
    _stripeClient = new Stripe(config.secretKey, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    });
    _clientFingerprint = fingerprint;
  }

  return _stripeClient;
}

/** Alias pour getStripeClient (compatibilité avec anciens imports). */
export const getStripe = getStripeClient;

// ── Client Stripe synchrone (LEGACY - env only) ───────────────────────────────
//
// Ne doit être utilisé que par du code legacy qui ne peut pas être async.
// Sur les chemins critiques (paiements, webhooks, payouts), toujours préférer
// getStripeClient() pour bénéficier de la config DB modifiable depuis l'Admin.

const legacySecretKey =
  process.env.STRIPE_TEST_SECRET_KEY ||
  process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_LIVE_SECRET_KEY;

const _stripeSync = legacySecretKey
  ? new Stripe(legacySecretKey, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    })
  : null;

/**
 * @deprecated Préférez `getStripeClient()` qui lit la configuration depuis la DB.
 * N'utiliser que pour du code legacy incompatible async.
 */
export const stripe = _stripeSync as Stripe;

/**
 * Getter sync safe : lève une exception explicite si aucune clé env n'est
 * configurée. Préférez `getStripeClient()` dès que possible.
 *
 * @deprecated Use getStripeClient() for DB-aware access.
 */
export function getStripeSafe(): Stripe {
  if (!_stripeSync) {
    throw new Error(
      "[VIXUAL] Stripe sync non configuré. " +
      "Pour les paiements runtime, utilisez getStripeClient() (async). " +
      "Sinon définissez STRIPE_SECRET_KEY dans les variables d'environnement."
    );
  }
  return _stripeSync;
}

// ── Helpers de statut de configuration ────────────────────────────────────────

/**
 * Check sync (uniquement via env vars).
 * @deprecated Préférez isStripeConfiguredAsync().
 */
export function isStripeConfigured(): boolean {
  return _stripeSync !== null;
}

/**
 * Check async (DB puis env). Source de vérité.
 */
export async function isStripeConfiguredAsync(): Promise<boolean> {
  try {
    const config = await getStripeConfig();
    return !!config.secretKey && config.secretKey.startsWith("sk_");
  } catch {
    return false;
  }
}

/**
 * Récupère le webhook secret actif (DB puis env).
 */
export async function getWebhookSecret(): Promise<string> {
  const config = await getStripeConfig();
  return config.webhookSecret;
}

// ── Webhook secret synchrone (legacy env) ─────────────────────────────────────

/** @deprecated Préférez getWebhookSecret() (async DB-aware). */
export const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_TEST_WEBHOOK_SECRET ||
  process.env.STRIPE_WEBHOOK_SECRET ||
  process.env.STRIPE_LIVE_WEBHOOK_SECRET;

// ── Mode / environnement ──────────────────────────────────────────────────────

/**
 * Récupère le mode Stripe actif de façon asynchrone (DB > env).
 */
export async function getStripeModeAsync(): Promise<{
  isTest: boolean;
  environment: "TEST" | "LIVE";
  source: "database" | "environment";
  warning: string;
}> {
  const config = await getStripeConfig();
  const isTest = config.mode === "test";
  return {
    isTest,
    environment: (isTest ? "TEST" : "LIVE") as "TEST" | "LIVE",
    source: config.source,
    warning: isTest
      ? "MODE TEST - Aucune transaction réelle"
      : "MODE LIVE - Transactions réelles actives",
  };
}

/**
 * Version synchrone (basée sur env var NEXT_PUBLIC_STRIPE_TEST_MODE).
 * Utile pour le rendu UI qui n'est pas async. Pour la logique métier
 * critique, préférez getStripeModeAsync().
 */
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

// ── Logging standardisé ───────────────────────────────────────────────────────

export function logStripeEvent(event: string, data: Record<string, unknown>) {
  const mode = getStripeMode();
  const prefix = mode.isTest ? "[STRIPE TEST]" : "[STRIPE LIVE]";
  console.log(`${prefix} ${event}`, {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

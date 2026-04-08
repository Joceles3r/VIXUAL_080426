/**
 * VIXUAL Stripe Constants
 * 
 * Centralise toutes les constantes Stripe pour eviter les chaines en dur.
 * Source de verite unique pour les URLs, modes et configurations.
 */

// ── Routes canoniques ─────────────────────────────────────────────────────────

export const STRIPE_CANONICAL_WEBHOOK_PATH = "/api/integrations/stripe/webhooks";
export const STRIPE_ADMIN_CONFIG_PATH = "/api/admin/stripe-config";
export const STRIPE_HEALTH_PATH = "/api/admin/stripe-health";
export const STRIPE_CONNECT_PATH = "/api/integrations/stripe/connect";

// ── Modes supportes ───────────────────────────────────────────────────────────

export const STRIPE_SUPPORTED_MODES = ["test", "live"] as const;
export type StripeMode = typeof STRIPE_SUPPORTED_MODES[number];

// ── Pays Connect supportes ────────────────────────────────────────────────────

export const STRIPE_CONNECT_COUNTRIES = [
  "FR", // France
  "BE", // Belgique  
  "CH", // Suisse
  "LU", // Luxembourg
  "MC", // Monaco
] as const;
export type StripeConnectCountry = typeof STRIPE_CONNECT_COUNTRIES[number];

// ── Types de paiement VIXUAL ──────────────────────────────────────────────────

export const VIXUAL_PAYMENT_TYPES = [
  "project_contribution",  // Contribution a un projet
  "creator_caution",       // Caution porteur
  "ticket_gold",           // Achat Ticket Gold
  "free_support",          // Soutien libre
  "visupoints_pack",       // Achat pack VIXUpoints
  "content_purchase",      // Achat contenu
] as const;
export type VixualPaymentType = typeof VIXUAL_PAYMENT_TYPES[number];

// ── Statuts compte Connect ────────────────────────────────────────────────────

export const STRIPE_ACCOUNT_STATUSES = [
  "none",       // Pas de compte
  "pending",    // En attente d'onboarding
  "restricted", // Compte restreint
  "verified",   // Compte verifie complet
  "disabled",   // Compte desactive
] as const;
export type StripeAccountStatus = typeof STRIPE_ACCOUNT_STATUSES[number];

// ── Statuts paiement VIXUAL ───────────────────────────────────────────────────

export const VIXUAL_PAYMENT_STATUSES = [
  "pending",    // En attente
  "processing", // En cours de traitement
  "completed",  // Complete
  "failed",     // Echoue
  "refunded",   // Rembourse
  "cancelled",  // Annule
] as const;
export type VixualPaymentStatus = typeof VIXUAL_PAYMENT_STATUSES[number];

// ── Statuts Ticket Gold ───────────────────────────────────────────────────────

export const TICKET_GOLD_STATUSES = [
  "pending",   // En attente de paiement
  "active",    // Actif (boost en cours)
  "expired",   // Expire
  "cancelled", // Annule
] as const;
export type TicketGoldStatus = typeof TICKET_GOLD_STATUSES[number];

// ── Configuration Ticket Gold ─────────────────────────────────────────────────

export const TICKET_GOLD_CONFIG = {
  durationHours: 48,
  visibilityBoostPercent: 50,
  priceEur: 9.99,
} as const;

// ── Prefixes de cles Stripe ───────────────────────────────────────────────────

export const STRIPE_KEY_PREFIXES = {
  testSecret: "sk_test_",
  liveSecret: "sk_live_",
  testPublishable: "pk_test_",
  livePublishable: "pk_live_",
  webhookSecret: "whsec_",
} as const;

// ── Labels UI (eviter termes techniques Stripe) ───────────────────────────────

export const STRIPE_UI_LABELS = {
  // Preferer ces termes cote utilisateur
  paymentSuccess: "Paiement securise",
  transactionComplete: "Transaction validee",
  supportRegistered: "Soutien enregistre",
  contributionConfirmed: "Contribution confirmee",
  ticketGoldActivated: "Ticket Gold active",
  vixupointsGranted: "VIXUpoints credites",
  
  // Eviter ces termes cote utilisateur (admin technique seulement)
  _internal: {
    paymentIntent: "payment_intent",
    charge: "charge",
    transferGroup: "transfer_group",
    accountLink: "account_link",
  },
} as const;

// ── Validation helpers ────────────────────────────────────────────────────────

export function isValidTestSecretKey(key: string): boolean {
  return key.startsWith(STRIPE_KEY_PREFIXES.testSecret);
}

export function isValidLiveSecretKey(key: string): boolean {
  return key.startsWith(STRIPE_KEY_PREFIXES.liveSecret);
}

export function isValidTestPublishableKey(key: string): boolean {
  return key.startsWith(STRIPE_KEY_PREFIXES.testPublishable);
}

export function isValidLivePublishableKey(key: string): boolean {
  return key.startsWith(STRIPE_KEY_PREFIXES.livePublishable);
}

export function isValidWebhookSecret(key: string): boolean {
  return key.startsWith(STRIPE_KEY_PREFIXES.webhookSecret);
}

/**
 * Valide la coherence entre le mode et les cles fournies
 */
export function validateModeKeyConsistency(
  mode: StripeMode,
  secretKey?: string,
  publishableKey?: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (mode === "test") {
    if (secretKey && !isValidTestSecretKey(secretKey)) {
      errors.push("Mode TEST requiert une cle secrete sk_test_*");
    }
    if (publishableKey && !isValidLivePublishableKey(publishableKey) && !isValidTestPublishableKey(publishableKey)) {
      if (publishableKey && isValidLivePublishableKey(publishableKey)) {
        errors.push("Mode TEST ne peut pas utiliser une cle publique pk_live_*");
      }
    }
  } else if (mode === "live") {
    if (secretKey && !isValidLiveSecretKey(secretKey)) {
      errors.push("Mode LIVE requiert une cle secrete sk_live_*");
    }
    if (publishableKey && !isValidLivePublishableKey(publishableKey)) {
      errors.push("Mode LIVE requiert une cle publique pk_live_*");
    }
  }
  
  return { valid: errors.length === 0, errors };
}

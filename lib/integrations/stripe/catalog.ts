/**
 * VIXUAL — Catalogue Stripe centralisé
 * 
 * Source unique de vérité pour tous les produits/prix Stripe.
 * Évite les montants hardcodés dispersés dans le code.
 */
import "server-only";

// ── Types ────────────────────────────────────────────────────────────────────

export interface VixualProduct {
  code: string;
  name: string;
  description: string;
  amount: number; // en centimes
  currency: "eur";
  category: "ticket_gold" | "micropack" | "soutien" | "premium";
  metadata: Record<string, string>;
}

export type ProductCode = keyof typeof VIXUAL_STRIPE_CATALOG;

// ── Catalogue des produits VIXUAL ────────────────────────────────────────────

export const VIXUAL_STRIPE_CATALOG = {
  // Tickets Gold (boost visibilité 48h)
  ticket_gold_50: {
    code: "ticket_gold_50",
    name: "Ticket Gold 50",
    description: "Boost de visibilité pendant 48h - Niveau Standard",
    amount: 5000, // 50.00 EUR
    currency: "eur" as const,
    category: "ticket_gold" as const,
    metadata: {
      product_type: "ticket_gold",
      boost_duration_hours: "48",
      boost_multiplier: "1.5",
    },
  },
  ticket_gold_75: {
    code: "ticket_gold_75",
    name: "Ticket Gold 75",
    description: "Boost de visibilité pendant 48h - Niveau Premium",
    amount: 7500, // 75.00 EUR
    currency: "eur" as const,
    category: "ticket_gold" as const,
    metadata: {
      product_type: "ticket_gold",
      boost_duration_hours: "48",
      boost_multiplier: "2.0",
    },
  },
  ticket_gold_100: {
    code: "ticket_gold_100",
    name: "Ticket Gold 100",
    description: "Boost de visibilité pendant 48h - Niveau Elite",
    amount: 10000, // 100.00 EUR
    currency: "eur" as const,
    category: "ticket_gold" as const,
    metadata: {
      product_type: "ticket_gold",
      boost_duration_hours: "48",
      boost_multiplier: "2.5",
    },
  },

  // Micropacks Vixupoints
  micropack_starter: {
    code: "micropack_starter",
    name: "Micropack Starter",
    description: "Pack de 100 Vixupoints",
    amount: 199, // 1.99 EUR
    currency: "eur" as const,
    category: "micropack" as const,
    metadata: {
      product_type: "micropack",
      vixupoints_amount: "100",
    },
  },
  micropack_standard: {
    code: "micropack_standard",
    name: "Micropack Standard",
    description: "Pack de 500 Vixupoints",
    amount: 799, // 7.99 EUR
    currency: "eur" as const,
    category: "micropack" as const,
    metadata: {
      product_type: "micropack",
      vixupoints_amount: "500",
    },
  },
  micropack_premium: {
    code: "micropack_premium",
    name: "Micropack Premium",
    description: "Pack de 1200 Vixupoints",
    amount: 1499, // 14.99 EUR
    currency: "eur" as const,
    category: "micropack" as const,
    metadata: {
      product_type: "micropack",
      vixupoints_amount: "1200",
    },
  },

  // Soutien libre (montants personnalisés)
  soutien_5: {
    code: "soutien_5",
    name: "Soutien Libre 5€",
    description: "Soutien à un créateur",
    amount: 500,
    currency: "eur" as const,
    category: "soutien" as const,
    metadata: {
      product_type: "soutien_libre",
    },
  },
  soutien_10: {
    code: "soutien_10",
    name: "Soutien Libre 10€",
    description: "Soutien à un créateur",
    amount: 1000,
    currency: "eur" as const,
    category: "soutien" as const,
    metadata: {
      product_type: "soutien_libre",
    },
  },
  soutien_20: {
    code: "soutien_20",
    name: "Soutien Libre 20€",
    description: "Soutien à un créateur",
    amount: 2000,
    currency: "eur" as const,
    category: "soutien" as const,
    metadata: {
      product_type: "soutien_libre",
    },
  },
  soutien_50: {
    code: "soutien_50",
    name: "Soutien Libre 50€",
    description: "Soutien à un créateur",
    amount: 5000,
    currency: "eur" as const,
    category: "soutien" as const,
    metadata: {
      product_type: "soutien_libre",
    },
  },
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Récupérer un produit du catalogue
 */
export function getProduct(code: string): VixualProduct | null {
  return (VIXUAL_STRIPE_CATALOG as Record<string, VixualProduct>)[code] || null;
}

/**
 * Récupérer tous les produits d'une catégorie
 */
export function getProductsByCategory(category: VixualProduct["category"]): VixualProduct[] {
  return Object.values(VIXUAL_STRIPE_CATALOG).filter(p => p.category === category);
}

/**
 * Formater un montant en centimes vers une chaîne lisible
 */
export function formatAmount(amountCents: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

// ── Métadonnées Checkout Session ─────────────────────────────────────────────

export interface VixualCheckoutMetadata {
  platform: "vixual";
  product_code: string;
  user_id: string;
  user_role?: string;
  project_id?: string;
  creator_id?: string;
  payment_context: string;
  environment: "test" | "live";
}

/**
 * Construire les métadonnées standardisées pour une Checkout Session
 */
export function buildCheckoutMetadata(params: {
  productCode: string;
  userId: string;
  userRole?: string;
  projectId?: string;
  creatorId?: string;
  paymentContext: string;
  isTestMode: boolean;
}): VixualCheckoutMetadata {
  return {
    platform: "vixual",
    product_code: params.productCode,
    user_id: params.userId,
    user_role: params.userRole,
    project_id: params.projectId,
    creator_id: params.creatorId,
    payment_context: params.paymentContext,
    environment: params.isTestMode ? "test" : "live",
  };
}

/**
 * Extraire les métadonnées VIXUAL d'une session Stripe
 */
export function extractVixualMetadata(
  metadata: Record<string, string> | null
): Partial<VixualCheckoutMetadata> | null {
  if (!metadata || metadata.platform !== "vixual") {
    return null;
  }
  return {
    platform: "vixual",
    product_code: metadata.product_code,
    user_id: metadata.user_id,
    user_role: metadata.user_role,
    project_id: metadata.project_id,
    creator_id: metadata.creator_id,
    payment_context: metadata.payment_context,
    environment: metadata.environment as "test" | "live",
  };
}

// ── Cartes test Stripe ───────────────────────────────────────────────────────

export const STRIPE_TEST_CARDS = {
  success: {
    number: "4242 4242 4242 4242",
    description: "Paiement réussi",
  },
  declined: {
    number: "4000 0000 0000 0002",
    description: "Carte refusée",
  },
  insufficient_funds: {
    number: "4000 0000 0000 9995",
    description: "Fonds insuffisants",
  },
  threeds_required: {
    number: "4000 0025 0000 3155",
    description: "3D Secure requis",
  },
  threeds_optional: {
    number: "4000 0000 0000 3220",
    description: "3D Secure optionnel",
  },
} as const;

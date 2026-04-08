/**
 * VIXUAL - Module Soutien Libre
 * 
 * Permet a tout utilisateur de soutenir un createur de maniere simple,
 * sans impact sur le classement, les votes ou la visibilite.
 * 
 * Commission VIXUAL: 7%
 * + frais Stripe standards
 */

import { sql, isDatabaseConfigured } from "@/lib/db";
import { getStripeSafe, isStripeConfigured } from "@/lib/stripe";

// ── Configuration ──

export const SOUTIEN_LIBRE_CONFIG = {
  // Commission VIXUAL (7%)
  platformFeePercent: 7,
  
  // Montants predefinis (en EUR)
  presetAmounts: [5, 10, 20, 25, 50] as const,
  
  // Montant minimum et maximum pour le libre
  minAmount: 1,
  maxAmount: 500,
  
  // Option tip VIXUAL
  vixualTipAmount: 1, // 1EUR optionnel
  
  // Affichage
  displayName: "Soutien Libre",
  shortDescription: "Soutenez directement un createur, sans impact sur le classement",
};

export type PresetAmount = typeof SOUTIEN_LIBRE_CONFIG.presetAmounts[number];

// ── Types ──

export interface FreeSupportPayment {
  id: string;
  donorId?: string; // null si anonyme/non connecte
  donorEmail: string;
  creatorId: string;
  creatorStripeAccountId: string;
  amount: number; // montant total paye
  platformFee: number; // 7% VIXUAL
  stripeFee: number; // frais Stripe estimes
  vixualTip: number; // tip optionnel VIXUAL
  netAmount: number; // montant net pour le createur
  message?: string; // message optionnel
  isAnonymous: boolean;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
  completedAt?: Date;
}

export interface SoutienLibreStats {
  totalReceived: number;
  totalSupporters: number;
  averageAmount: number;
  thisMonth: number;
  lastMonth: number;
}

export interface Creator {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  stripeAccountId?: string;
  stripeAccountStatus?: string;
}

// ── Calculs ──

/**
 * Calcule la repartition d'un soutien libre
 */
export function calculateSoutienLibreDistribution(
  amount: number,
  includeVixualTip: boolean = false
): {
  totalPaid: number;
  platformFee: number;
  estimatedStripeFee: number;
  vixualTip: number;
  netToCreator: number;
} {
  const tip = includeVixualTip ? SOUTIEN_LIBRE_CONFIG.vixualTipAmount : 0;
  const totalPaid = amount + tip;
  
  // Commission VIXUAL: 7% du montant principal (pas du tip)
  const platformFee = Math.round(amount * SOUTIEN_LIBRE_CONFIG.platformFeePercent) / 100;
  
  // Estimation frais Stripe (~1.4% + 0.25EUR)
  const estimatedStripeFee = Math.round((totalPaid * 0.014 + 0.25) * 100) / 100;
  
  // Net pour le createur
  const netToCreator = Math.round((amount - platformFee - estimatedStripeFee) * 100) / 100;
  
  return {
    totalPaid,
    platformFee,
    estimatedStripeFee,
    vixualTip: tip,
    netToCreator: Math.max(0, netToCreator),
  };
}

/**
 * Valide le montant du soutien
 */
export function validateSoutienAmount(amount: number): { valid: boolean; error?: string } {
  if (!amount || isNaN(amount)) {
    return { valid: false, error: "Montant invalide" };
  }
  
  if (amount < SOUTIEN_LIBRE_CONFIG.minAmount) {
    return { valid: false, error: `Montant minimum: ${SOUTIEN_LIBRE_CONFIG.minAmount}EUR` };
  }
  
  if (amount > SOUTIEN_LIBRE_CONFIG.maxAmount) {
    return { valid: false, error: `Montant maximum: ${SOUTIEN_LIBRE_CONFIG.maxAmount}EUR` };
  }
  
  return { valid: true };
}

// ── Database Operations ──

/**
 * Recupere un createur par son slug
 */
export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  if (!isDatabaseConfigured()) {
    // Mock data for development
    return {
      id: "creator-1",
      slug,
      displayName: "Createur Demo",
      bio: "Un createur passione sur VIXUAL",
      stripeAccountId: "acct_demo",
      stripeAccountStatus: "active",
    };
  }
  
  try {
    const rows = await sql`
      SELECT 
        id, 
        slug, 
        display_name as "displayName",
        avatar_url as "avatarUrl",
        bio,
        stripe_account_id as "stripeAccountId",
        stripe_account_status as "stripeAccountStatus"
      FROM users
      WHERE slug = ${slug} AND role IN ('porter', 'infoporter', 'podcaster')
      LIMIT 1
    `;
    
    return rows[0] as Creator || null;
  } catch (err) {
    console.error("[Soutien Libre] Erreur getCreatorBySlug:", err);
    return null;
  }
}

/**
 * Recupere les createurs suivis par un utilisateur
 */
export async function getFollowedCreators(userId: string): Promise<Creator[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }
  
  try {
    const rows = await sql`
      SELECT 
        u.id,
        u.slug,
        u.display_name as "displayName",
        u.avatar_url as "avatarUrl",
        u.bio,
        u.stripe_account_id as "stripeAccountId"
      FROM user_follows f
      JOIN users u ON f.followed_id = u.id
      WHERE f.follower_id = ${userId}
        AND u.role IN ('porter', 'infoporter', 'podcaster')
      ORDER BY f.created_at DESC
      LIMIT 20
    `;
    
    return rows as Creator[];
  } catch (err) {
    console.error("[Soutien Libre] Erreur getFollowedCreators:", err);
    return [];
  }
}

/**
 * Enregistre un paiement de soutien libre
 */
export async function recordFreeSupportPayment(
  payment: Omit<FreeSupportPayment, "id" | "createdAt">
): Promise<string | null> {
  if (!isDatabaseConfigured()) {
    return "mock-payment-id";
  }
  
  try {
    const rows = await sql`
      INSERT INTO free_support_payments (
        donor_id,
        donor_email,
        creator_id,
        creator_stripe_account_id,
        amount,
        platform_fee,
        stripe_fee,
        vixual_tip,
        net_amount,
        message,
        is_anonymous,
        stripe_session_id,
        status
      ) VALUES (
        ${payment.donorId || null},
        ${payment.donorEmail},
        ${payment.creatorId},
        ${payment.creatorStripeAccountId},
        ${payment.amount},
        ${payment.platformFee},
        ${payment.stripeFee},
        ${payment.vixualTip},
        ${payment.netAmount},
        ${payment.message || null},
        ${payment.isAnonymous},
        ${payment.stripeSessionId},
        ${payment.status}
      )
      RETURNING id
    `;
    
    return rows[0]?.id || null;
  } catch (err) {
    console.error("[Soutien Libre] Erreur recordFreeSupportPayment:", err);
    return null;
  }
}

/**
 * Met a jour le statut d'un paiement
 */
export async function updateFreeSupportPaymentStatus(
  stripeSessionId: string,
  status: FreeSupportPayment["status"],
  paymentIntentId?: string
): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return true;
  }
  
  try {
    await sql`
      UPDATE free_support_payments
      SET 
        status = ${status},
        stripe_payment_intent_id = ${paymentIntentId || null},
        completed_at = ${status === "completed" ? new Date().toISOString() : null}
      WHERE stripe_session_id = ${stripeSessionId}
    `;
    return true;
  } catch (err) {
    console.error("[Soutien Libre] Erreur updateFreeSupportPaymentStatus:", err);
    return false;
  }
}

/**
 * Recupere les statistiques de soutien pour un createur
 */
export async function getCreatorSoutienStats(creatorId: string): Promise<SoutienLibreStats> {
  if (!isDatabaseConfigured()) {
    return {
      totalReceived: 0,
      totalSupporters: 0,
      averageAmount: 0,
      thisMonth: 0,
      lastMonth: 0,
    };
  }
  
  try {
    const stats = await sql`
      SELECT 
        COALESCE(SUM(net_amount), 0) as total_received,
        COUNT(DISTINCT COALESCE(donor_id, donor_email)) as total_supporters,
        COALESCE(AVG(amount), 0) as average_amount,
        COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN net_amount ELSE 0 END), 0) as this_month,
        COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                          AND created_at < date_trunc('month', CURRENT_DATE) THEN net_amount ELSE 0 END), 0) as last_month
      FROM free_support_payments
      WHERE creator_id = ${creatorId} AND status = 'completed'
    `;
    
    const row = stats[0] || {};
    return {
      totalReceived: Number(row.total_received) || 0,
      totalSupporters: Number(row.total_supporters) || 0,
      averageAmount: Math.round(Number(row.average_amount) * 100) / 100 || 0,
      thisMonth: Number(row.this_month) || 0,
      lastMonth: Number(row.last_month) || 0,
    };
  } catch (err) {
    console.error("[Soutien Libre] Erreur getCreatorSoutienStats:", err);
    return {
      totalReceived: 0,
      totalSupporters: 0,
      averageAmount: 0,
      thisMonth: 0,
      lastMonth: 0,
    };
  }
}

// ── Stripe Checkout ──

/**
 * Cree une session Stripe Checkout pour un soutien libre
 */
export async function createSoutienLibreCheckout(params: {
  creatorId: string;
  creatorSlug: string;
  creatorName: string;
  creatorStripeAccountId: string;
  amount: number;
  includeVixualTip: boolean;
  donorEmail: string;
  donorId?: string;
  message?: string;
  isAnonymous?: boolean;
}): Promise<{ success: boolean; checkoutUrl?: string; sessionId?: string; error?: string }> {
  if (!isStripeConfigured()) {
    return { success: false, error: "Stripe non configure" };
  }
  
  const validation = validateSoutienAmount(params.amount);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  const distribution = calculateSoutienLibreDistribution(params.amount, params.includeVixualTip);
  
  try {
    const stripe = getStripeSafe();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vixual.app";
    
    // Calculer le montant de l'application fee (VIXUAL prend 7% + tip optionnel)
    const applicationFeeAmount = Math.round((distribution.platformFee + distribution.vixualTip) * 100);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: params.donorEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Soutien a ${params.creatorName}`,
              description: "Soutien libre - Sans impact sur le classement VIXUAL",
            },
            unit_amount: Math.round(distribution.totalPaid * 100),
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: params.creatorStripeAccountId,
        },
      },
      metadata: {
        payment_type: "free_support",
        creator_id: params.creatorId,
        creator_slug: params.creatorSlug,
        donor_id: params.donorId || "",
        donor_email: params.donorEmail,
        amount: params.amount.toString(),
        vixual_tip: distribution.vixualTip.toString(),
        platform_fee: distribution.platformFee.toString(),
        message: params.message || "",
        is_anonymous: params.isAnonymous ? "true" : "false",
      },
      success_url: `${baseUrl}/soutien-libre/${params.creatorSlug}?success=true&amount=${params.amount}`,
      cancel_url: `${baseUrl}/soutien-libre/${params.creatorSlug}?cancelled=true`,
    });
    
    // Enregistrer le paiement en pending
    await recordFreeSupportPayment({
      donorId: params.donorId,
      donorEmail: params.donorEmail,
      creatorId: params.creatorId,
      creatorStripeAccountId: params.creatorStripeAccountId,
      amount: params.amount,
      platformFee: distribution.platformFee,
      stripeFee: distribution.estimatedStripeFee,
      vixualTip: distribution.vixualTip,
      netAmount: distribution.netToCreator,
      message: params.message,
      isAnonymous: params.isAnonymous || false,
      stripeSessionId: session.id,
      status: "pending",
    });
    
    return {
      success: true,
      checkoutUrl: session.url || undefined,
      sessionId: session.id,
    };
  } catch (error) {
    console.error("[Soutien Libre] Erreur createSoutienLibreCheckout:", error);
    return { success: false, error: "Erreur lors de la creation du paiement" };
  }
}

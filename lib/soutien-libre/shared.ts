/**
 * VIXUAL - Module Soutien Libre (Shared/Client-safe)
 * 
 * This file contains configuration, types, and utility functions
 * that can be safely used in both client and server components.
 */

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

// ── Calculs (Client-safe) ──

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

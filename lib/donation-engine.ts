/**
 * VIXUAL Donation/Support Engine
 * Système de soutien (don) sans contrepartie
 * 
 * Principe:
 * - Contribution = votes + classement + gains
 * - Soutien = aide libre sans retour (pas de vote, pas de classement, pas de gain)
 */

import { sql } from "./db"

// ── Types ──────────────────────────────────────────────────────────────────

export type SupportPayment = {
  id: string
  userId: string
  creatorId: string
  projectId?: string
  amount: number // montant brut en centimes
  fee: number // commission VIXUAL en centimes
  net: number // montant net pour le créateur en centimes
  status: "pending" | "completed" | "failed" | "refunded"
  stripePaymentId?: string
  createdAt: Date
}

export type DonationTarget = {
  type: "project" | "creator"
  id: string
  name: string
  creatorId: string
  creatorName: string
  stripeAccountId?: string
}

// ── Constants ──────────────────────────────────────────────────────────────

export const DONATION_CONFIG = {
  MIN_AMOUNT_CENTS: 200, // 2€ minimum
  MAX_AMOUNT_CENTS: 50000, // 500€ maximum
  COMMISSION_RATE: 0.15, // 15% commission VIXUAL
  DAILY_LIMIT_CENTS: 100000, // 1000€ par jour par utilisateur
  
  PRESET_AMOUNTS: [
    { value: 200, label: "2 €" },
    { value: 500, label: "5 €" },
    { value: 1000, label: "10 €" },
    { value: 2000, label: "20 €" },
  ],
} as const

// ── Validation ─────────────────────────────────────────────────────────────

export function validateDonation(
  userId: string,
  creatorId: string,
  amountCents: number
): { valid: boolean; error?: string } {
  // Pas d'auto-don
  if (userId === creatorId) {
    return { valid: false, error: "Vous ne pouvez pas vous soutenir vous-même" }
  }

  // Montant minimum
  if (amountCents < DONATION_CONFIG.MIN_AMOUNT_CENTS) {
    return { valid: false, error: `Le montant minimum est de ${DONATION_CONFIG.MIN_AMOUNT_CENTS / 100} €` }
  }

  // Montant maximum
  if (amountCents > DONATION_CONFIG.MAX_AMOUNT_CENTS) {
    return { valid: false, error: `Le montant maximum est de ${DONATION_CONFIG.MAX_AMOUNT_CENTS / 100} €` }
  }

  return { valid: true }
}

// ── Fee Calculation ────────────────────────────────────────────────────────

export function calculateDonationFees(amountCents: number): {
  gross: number
  fee: number
  net: number
} {
  const fee = Math.round(amountCents * DONATION_CONFIG.COMMISSION_RATE)
  const net = amountCents - fee

  return {
    gross: amountCents,
    fee,
    net,
  }
}

// ── Database Operations ────────────────────────────────────────────────────

export async function checkDailyLimit(userId: string): Promise<{
  allowed: boolean
  currentTotal: number
  remaining: number
}> {
  const result = await sql`
    SELECT COALESCE(SUM(amount), 0)::int as total
    FROM support_payments
    WHERE user_id = ${userId}
      AND status = 'completed'
      AND created_at > NOW() - INTERVAL '24 hours'
  `

  const currentTotal = result[0]?.total || 0
  const remaining = DONATION_CONFIG.DAILY_LIMIT_CENTS - currentTotal

  return {
    allowed: remaining > 0,
    currentTotal,
    remaining: Math.max(0, remaining),
  }
}

export async function createSupportPayment(
  payment: Omit<SupportPayment, "id" | "createdAt">
): Promise<SupportPayment> {
  const result = await sql`
    INSERT INTO support_payments (
      user_id, creator_id, project_id, amount, fee, net, status, stripe_payment_id
    ) VALUES (
      ${payment.userId},
      ${payment.creatorId},
      ${payment.projectId || null},
      ${payment.amount},
      ${payment.fee},
      ${payment.net},
      ${payment.status},
      ${payment.stripePaymentId || null}
    )
    RETURNING id, created_at
  `

  return {
    ...payment,
    id: result[0].id,
    createdAt: result[0].created_at,
  }
}

export async function updateSupportPaymentStatus(
  paymentId: string,
  status: SupportPayment["status"],
  stripePaymentId?: string
): Promise<void> {
  await sql`
    UPDATE support_payments
    SET status = ${status},
        stripe_payment_id = COALESCE(${stripePaymentId || null}, stripe_payment_id),
        updated_at = NOW()
    WHERE id = ${paymentId}
  `
}

export async function getCreatorTotalSupport(creatorId: string): Promise<number> {
  const result = await sql`
    SELECT COALESCE(SUM(net), 0)::int as total
    FROM support_payments
    WHERE creator_id = ${creatorId}
      AND status = 'completed'
  `
  return result[0]?.total || 0
}

export async function getUserSupportHistory(userId: string): Promise<SupportPayment[]> {
  const result = await sql`
    SELECT 
      id, user_id, creator_id, project_id, amount, fee, net, status, 
      stripe_payment_id, created_at
    FROM support_payments
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `
  return result.map((row) => ({
    id: row.id,
    userId: row.user_id,
    creatorId: row.creator_id,
    projectId: row.project_id,
    amount: row.amount,
    fee: row.fee,
    net: row.net,
    status: row.status,
    stripePaymentId: row.stripe_payment_id,
    createdAt: new Date(row.created_at),
  }))
}

// ── Anti-Abuse Detection ───────────────────────────────────────────────────

export async function detectDonationAbuse(userId: string): Promise<{
  suspicious: boolean
  reason?: string
}> {
  // Vérifier le nombre de dons dans les dernières 24h
  const recentDonations = await sql`
    SELECT COUNT(*)::int as count
    FROM support_payments
    WHERE user_id = ${userId}
      AND created_at > NOW() - INTERVAL '24 hours'
  `

  if (recentDonations[0]?.count > 20) {
    return {
      suspicious: true,
      reason: "Trop de transactions en 24h",
    }
  }

  // Vérifier les dons répétés au même créateur
  const repeatedDonations = await sql`
    SELECT creator_id, COUNT(*)::int as count
    FROM support_payments
    WHERE user_id = ${userId}
      AND created_at > NOW() - INTERVAL '1 hour'
    GROUP BY creator_id
    HAVING COUNT(*) > 5
  `

  if (repeatedDonations.length > 0) {
    return {
      suspicious: true,
      reason: "Dons répétés au même créateur",
    }
  }

  return { suspicious: false }
}

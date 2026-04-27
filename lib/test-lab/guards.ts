/**
 * MODULE TEST-LAB VIXUAL — GARDE D'ISOLATION
 *
 * Ce module est reserve aux administrateurs VIXUAL.
 * Il ne doit JAMAIS toucher aux donnees reelles (users, contents,
 * payments, wallets, payouts).
 *
 * Simplifie : tous les admins ont acces.
 */

import { NextResponse } from "next/server"

/** Email officiel du PATRON VIXUAL (reference). */
export const PATRON_EMAIL = "jocelyndru@gmail.com"

export function isTestLabEnabled(): boolean {
  // Toujours actif pour simplifier
  return true
}

export function isAdminPatronEmail(email?: string | null): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === PATRON_EMAIL
}

/**
 * Verifie que l'utilisateur est admin.
 * Simplifie : tous les admins ont acces au Test Lab.
 */
export function assertTestLabAccess(isAdmin: boolean): boolean {
  return isAdmin
}

/** Reponse 403 standardisee pour toutes les routes test-lab. */
export function denyTestLabAccess() {
  return NextResponse.json(
    { success: false, error: "Laboratoire de tests non autorise" },
    { status: 403 },
  )
}

/**
 * Indique si Stripe peut etre appele en mode TEST reel.
 * Par defaut, on simule integralement (mode "isolated").
 */
export function isRealStripeAllowed(): boolean {
  return process.env.VIXUAL_TEST_LAB_ALLOW_REAL_STRIPE === "true"
}

/**
 * Indique si Bunny peut etre appele en mode reel.
 * Par defaut, on simule.
 */
export function isRealBunnyAllowed(): boolean {
  return process.env.VIXUAL_TEST_LAB_ALLOW_REAL_BUNNY === "true"
}

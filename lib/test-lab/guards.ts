/**
 * MODULE TEST-LAB VIXUAL — GARDE D'ISOLATION
 *
 * Ce module est strictement reserve a l'ADMIN/PATRON.
 * Il ne doit JAMAIS toucher aux donnees reelles (users, contents,
 * payments, wallets, payouts).
 *
 * Activation : VIXUAL_TEST_LAB_ENABLED=true
 * Acces : email PATRON unique (PATRON_EMAIL).
 */

import { NextResponse } from "next/server"

/** Email officiel du PATRON VIXUAL — seul autorise sur /admin/test-lab. */
export const PATRON_EMAIL = "jocelyndru@gmail.com"

export function isTestLabEnabled(): boolean {
  return process.env.VIXUAL_TEST_LAB_ENABLED === "true"
}

export function isAdminPatronEmail(email?: string | null): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === PATRON_EMAIL
}

/**
 * Verifie que :
 *  - le test-lab est active (variable d'env),
 *  - le mail fourni est bien celui du PATRON.
 */
export function assertTestLabAccess(adminEmail?: string | null): boolean {
  return isTestLabEnabled() && isAdminPatronEmail(adminEmail)
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

/**
 * MODULE TEST-LAB VIXUAL — GARDE D'ISOLATION
 *
 * Ce module est STRICTEMENT reserve a l'ADMIN/PATRON (jocelyndru@gmail.com).
 * Il ne doit JAMAIS toucher aux donnees reelles (users, contents,
 * payments, wallets, payouts).
 *
 * Securite renforcee : seul le PATRON peut executer des scenarios.
 */

import { NextResponse } from "next/server"

/** Email officiel du PATRON VIXUAL — seul autorise sur /admin/test-lab. */
export const PATRON_EMAIL = "jocelyndru@gmail.com"

export function isTestLabEnabled(): boolean {
  // Toujours actif pour le PATRON
  return true
}

export function isAdminPatronEmail(email?: string | null): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === PATRON_EMAIL
}

/**
 * Verifie que l'email fourni est bien celui du PATRON.
 * SECURITE STRICTE : seul jocelyndru@gmail.com peut acceder au Test Lab.
 */
export function assertTestLabAccess(email?: string | null): boolean {
  return isAdminPatronEmail(email)
}

/**
 * Verifie que le mode est bien "isolated" pour eviter toute pollution.
 */
export function assertIsolatedMode(): boolean {
  const mode = process.env.VIXUAL_TEST_LAB_MODE ?? "isolated"
  return mode === "isolated"
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

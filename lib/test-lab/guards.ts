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

/**
 * ACTIVE par defaut. La variable d'env serveur agit comme kill switch
 * explicite : seule la valeur "false" coupe le module. Permet de tester
 * sans configuration prealable, tout en gardant un moyen de couper en
 * production. La gate de securite reelle reste l'email PATRON.
 */
export function isTestLabEnabled(): boolean {
  return process.env.VIXUAL_TEST_LAB_ENABLED !== "false"
}

export function isAdminPatronEmail(email?: string | null): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === PATRON_EMAIL
}

/** Alias court demande par le patch : `isAdminPatron`. */
export const isAdminPatron = isAdminPatronEmail

/**
 * Verifie que (1) le module est active ET (2) l'email est celui du PATRON.
 * SECURITE STRICTE : seul jocelyndru@gmail.com peut acceder au Test Lab.
 */
export function assertTestLabAccess(email?: string | null): boolean {
  return isTestLabEnabled() && isAdminPatronEmail(email)
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

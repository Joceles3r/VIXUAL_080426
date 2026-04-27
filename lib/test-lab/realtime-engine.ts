/**
 * MODULE TEST-LAB VIXUAL — MOTEUR SIMULATION TEMPS REEL
 * Simule le trafic, contributions et etats Bunny comme si VIXUAL avait 1000 utilisateurs.
 * Aucune donnee reelle impactee.
 */

import type { RealtimeSimulationConfig, RealtimeTickResult } from "./types"

function intensityFactor(intensity: RealtimeSimulationConfig["intensity"]): number {
  if (intensity === "high") return 1.4
  if (intensity === "medium") return 1
  return 0.6
}

/**
 * Simule un "tick" (1 minute de trafic simule).
 * Retourne les metriques de ce tick.
 */
export function simulateRealtimeTick(
  config: RealtimeSimulationConfig,
  tick: number
): RealtimeTickResult {
  const factor = intensityFactor(config.intensity)

  // Utilisateurs actifs : monte progressivement puis oscille
  const activeUsers = Math.min(
    config.users,
    Math.max(1, Math.round((config.users * 0.08 + tick * factor * 3) % config.users))
  )

  // Pages vues : proportionnel aux utilisateurs actifs
  const pageViews = Math.round(activeUsers * (1.5 + factor))

  // Contributions par minute
  const contributionsCount = Math.round(config.contributionsPerMinute * factor)

  // Montant total simule (rotation entre 2, 5, 10, 20 euros)
  const amounts = [2, 5, 10, 20]
  const contributionAmountTotal = contributionsCount * amounts[tick % amounts.length]

  // Paiements echoues selon le pourcentage configure
  const failedPayments = Math.round(
    contributionsCount * (config.paymentFailurePercent / 100)
  )
  const successfulPayments = Math.max(0, contributionsCount - failedPayments)

  // Statuts Bunny
  const bunnyError = Math.round(config.projects * (config.bunnyErrorPercent / 100))
  const bunnyProcessing = Math.max(0, Math.round(config.projects * 0.15))
  const bunnyReady = Math.max(0, config.projects - bunnyProcessing - bunnyError)

  return {
    tick,
    activeUsers,
    pageViews,
    contributionsCount,
    contributionAmountTotal,
    successfulPayments,
    failedPayments,
    bunnyProcessing,
    bunnyReady,
    bunnyError,
  }
}

/**
 * Genere une config par defaut pour simulation 1000 utilisateurs.
 */
export function getDefault1000UsersConfig(): RealtimeSimulationConfig {
  return {
    name: "Simulation 1 000 utilisateurs",
    users: 1000,
    creators: 50,
    projects: 100,
    durationMinutes: 30,
    intensity: "medium",
    contributionsPerMinute: 40,
    paymentFailurePercent: 8,
    bunnyErrorPercent: 3,
  }
}

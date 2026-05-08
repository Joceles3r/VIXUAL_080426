/**
 * MODULE TEST-LAB VIXUAL — SIMULATEUR BOOST VISIBILITE
 * Simule la mecanique coeur de la V1 : visiteurs depensant leurs VIXUpoints
 * pour booster la visibilite algorithmique des createurs.
 * Calcule le coefficient de Gini pour mesurer la concentration.
 */

import type { TestUserExtended, TestVisibilityBoost } from "./types"

/** Conversion logarithmique identique a lib/visibility-boost/engine.ts */
function pointsToVisibilityScore(pointsSpent: number, visitorTrustScore: number): number {
  if (pointsSpent < 10) return 0
  const trustFactor = Math.max(0.5, Math.min(1.5, visitorTrustScore / 60))
  return Math.log10(pointsSpent + 1) * 10 * trustFactor
}

/** Coefficient de Gini : 0 = egalite parfaite, 1 = concentration extreme */
function computeGini(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  if (n === 0) return 0
  let sumOfDifferences = 0
  let sumOfValues = 0
  for (let i = 0; i < n; i++) {
    sumOfDifferences += (2 * (i + 1) - n - 1) * sorted[i]
    sumOfValues += sorted[i]
  }
  return sumOfValues === 0 ? 0 : sumOfDifferences / (n * sumOfValues)
}

export interface VisibilityBoostSimulationResult {
  boosts: TestVisibilityBoost[]
  creatorScores: Record<string, number>
  giniCoefficient: number
  uniqueBoosters: number
  totalPointsSpent: number
  /** % du score total detenu par les top 10% des createurs */
  top10Concentration: number
}

export function simulateVisibilityBoosts(
  users: TestUserExtended[],
  creators: TestUserExtended[],
  config: { participationRatePercent: number; avgPointsPerSupport: number },
): VisibilityBoostSimulationResult {
  const visitors = users.filter((u) => u.role === "visitor" && u.vixupointsBalance >= 10)
  const boosts: TestVisibilityBoost[] = []
  const creatorScores: Record<string, number> = {}
  const boosterIds = new Set<string>()

  if (creators.length === 0) {
    return {
      boosts,
      creatorScores,
      giniCoefficient: 0,
      uniqueBoosters: 0,
      totalPointsSpent: 0,
      top10Concentration: 0,
    }
  }

  for (const c of creators) creatorScores[c.id] = 0

  let totalPointsSpent = 0
  visitors.forEach((visitor, vIdx) => {
    // Probabilite de participation
    const roll = (vIdx * 31) % 100
    if (roll >= config.participationRatePercent) return

    // Power law sur le choix de createur (favorise quelques-uns)
    const targetIdx = Math.floor(Math.pow((vIdx % 100) / 100, 2) * creators.length)
    const target = creators[targetIdx] ?? creators[0]

    const points = Math.max(
      10,
      Math.min(50, Math.round(config.avgPointsPerSupport + ((vIdx % 10) - 5))),
    )
    if (visitor.vixupointsBalance < points) return

    const visibilityScore = pointsToVisibilityScore(points, visitor.trustScore)
    creatorScores[target.id] = (creatorScores[target.id] ?? 0) + visibilityScore

    boosts.push({
      visitorId: visitor.id,
      creatorId: target.id,
      pointsSpent: points,
      visibilityScore,
      visitorTrustScore: visitor.trustScore,
    })

    boosterIds.add(visitor.id)
    totalPointsSpent += points
  })

  const scores = Object.values(creatorScores).sort((a, b) => b - a)
  const total = scores.reduce((s, x) => s + x, 0)
  const top10Count = Math.max(1, Math.floor(scores.length * 0.1))
  const top10Sum = scores.slice(0, top10Count).reduce((s, x) => s + x, 0)
  const top10Concentration = total > 0 ? top10Sum / total : 0

  return {
    boosts,
    creatorScores,
    giniCoefficient: computeGini(scores),
    uniqueBoosters: boosterIds.size,
    totalPointsSpent,
    top10Concentration,
  }
}

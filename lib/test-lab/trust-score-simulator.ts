/**
 * MODULE TEST-LAB VIXUAL — SIMULATEUR EVOLUTION TRUST SCORE
 * Simule la progression Niveau 1 -> 2 -> 3 sur N jours.
 * Regles identiques a lib/platform/user-level.ts :
 *  - Niveau 2 : trustScore >= 50 + daysActive >= 7  + actions >= 3
 *  - Niveau 3 : trustScore >= 75 + daysActive >= 30 + actions >= 5
 */

import type { TestUserExtended } from "./types"

export interface TrustScoreEvolutionResult {
  promotionsToLevel2: number
  promotionsToLevel3: number
  finalDistribution: { level1: number; level2: number; level3: number }
  avgFinalTrustScore: number
}

export function simulateTrustScoreEvolution(
  users: TestUserExtended[],
  daysToSimulate: number,
): TrustScoreEvolutionResult {
  let promotionsL2 = 0
  let promotionsL3 = 0

  for (const user of users) {
    if (user.role === "guest" || user.role === "visitor") continue

    // Simulation : chaque jour, legere evolution du Trust Score
    let currentTrust = user.trustScore
    let currentLevel = user.level
    const initialActions = user.contributionsMade + user.publicationsMade

    for (let day = 0; day < daysToSimulate; day++) {
      // Le trust evolue selon le comportement (deterministe par index)
      const userIdNum = parseInt(user.id.replace(/\D/g, ""), 10) || 0
      const behaviorRoll = (userIdNum * 7 + day * 3) % 100

      if (behaviorRoll < 60) currentTrust = Math.min(100, currentTrust + 1)
      else if (behaviorRoll < 85) currentTrust = Math.max(0, currentTrust)
      else currentTrust = Math.max(0, currentTrust - 1)
    }

    const totalDays = user.daysActive + daysToSimulate
    const totalActions = initialActions + Math.floor(daysToSimulate / 5)

    // Evaluation des promotions
    if (currentLevel === 1 && currentTrust >= 50 && totalDays >= 7 && totalActions >= 3) {
      currentLevel = 2
      promotionsL2++
    }
    if (currentLevel === 2 && currentTrust >= 75 && totalDays >= 30 && totalActions >= 5) {
      currentLevel = 3
      promotionsL3++
    }

    // Mise a jour du user (mutation controlee pour resultat agrege)
    user.trustScore = currentTrust
    user.level = currentLevel
  }

  const finalDist = { level1: 0, level2: 0, level3: 0 }
  let totalTrust = 0
  for (const u of users) {
    if (u.level === 1) finalDist.level1++
    else if (u.level === 2) finalDist.level2++
    else finalDist.level3++
    totalTrust += u.trustScore
  }

  return {
    promotionsToLevel2: promotionsL2,
    promotionsToLevel3: promotionsL3,
    finalDistribution: finalDist,
    avgFinalTrustScore: users.length > 0 ? Math.round(totalTrust / users.length) : 0,
  }
}

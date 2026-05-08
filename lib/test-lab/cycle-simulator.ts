/**
 * MODULE TEST-LAB VIXUAL — SIMULATEUR DE CYCLE MENSUEL
 * Simule la cloture d'un cycle : agregation des contributions, calcul du
 * TOP 10, redistribution selon les formules economiques officielles.
 *
 * Formules :
 *  - Videos / Films / Docs   : 40% TOP 10 / 30% Bonus Pool / 23% Vixual / 7% Reserve
 *  - Podcasts                : 40% / 30% / 20% / 10%
 *  - VSLS (ecrits)           : 40% / 10% / 40% / 10%
 */

import type {
  TestProject,
  TestTransaction,
  TestUserExtended,
  TestCycleResult,
} from "./types"

interface ContentTypeShares {
  top10: number
  bonusPool: number
  vixual: number
  reserve: number
}

const SHARES_BY_CONTENT_TYPE: Record<"video" | "audio" | "article", ContentTypeShares> = {
  video: { top10: 0.4, bonusPool: 0.3, vixual: 0.23, reserve: 0.07 },
  audio: { top10: 0.4, bonusPool: 0.3, vixual: 0.2, reserve: 0.1 },
  article: { top10: 0.4, bonusPool: 0.1, vixual: 0.4, reserve: 0.1 },
}

export interface CycleSimulationInput {
  users: TestUserExtended[]
  projects: TestProject[]
  transactions: TestTransaction[]
  visibilityScores?: Record<string, number>
}

export function simulateMonthlyCycle(input: CycleSimulationInput): TestCycleResult {
  const { users, projects, transactions, visibilityScores = {} } = input

  // 1. Agreger contributions par projet
  const projectStats: Record<
    string,
    { contributionsEur: number; contributionsCount: number; type: string; creatorId: string }
  > = {}
  for (const p of projects) {
    projectStats[p.id] = {
      contributionsEur: 0,
      contributionsCount: 0,
      type: p.type,
      creatorId: p.creatorId,
    }
  }
  for (const tx of transactions) {
    if (tx.status !== "success") continue
    const stat = projectStats[tx.projectId]
    if (!stat) continue
    stat.contributionsEur += tx.amount
    stat.contributionsCount++
  }

  // 2. Score final = contributions €€ + boost visibilite (pondere)
  const projectFinalScore: Record<string, number> = {}
  for (const p of projects) {
    const stat = projectStats[p.id]
    const visScore = visibilityScores[p.creatorId] ?? 0
    // Le boost visibilite compte pour max 30% du score final
    const visContribution = Math.min(stat.contributionsEur * 0.3, visScore * 0.5)
    projectFinalScore[p.id] = stat.contributionsEur + visContribution
  }

  // 3. Trier et prendre TOP 10
  const ranked = Object.entries(projectFinalScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  // 4. Pool global par type de contenu
  const totalsByType = { video: 0, audio: 0, article: 0 }
  for (const stat of Object.values(projectStats)) {
    if (stat.type in totalsByType) {
      totalsByType[stat.type as "video" | "audio" | "article"] += stat.contributionsEur
    }
  }

  const redistribution = {
    video: computeRedistribution(totalsByType.video, "video"),
    podcast: computeRedistribution(totalsByType.audio, "audio"),
    article: computeRedistribution(totalsByType.article, "article"),
  }

  // 5. Construire le TOP 10 detaille avec revenu reel
  const userMap = new Map(users.map((u) => [u.id, u]))
  const top10Total = ranked.reduce((s, [, sc]) => s + sc, 0)

  const top10 = ranked.map(([projectId, finalScore]) => {
    const stat = projectStats[projectId]
    const creator = userMap.get(stat.creatorId)
    const shares = SHARES_BY_CONTENT_TYPE[stat.type as "video" | "audio" | "article"]
    // Part proportionnelle a la performance dans le top 10
    const ratio = top10Total > 0 ? finalScore / top10Total : 0
    const totalForType = totalsByType[stat.type as "video" | "audio" | "article"]
    const revenueEur = Math.round(totalForType * shares.top10 * ratio * 100) / 100

    return {
      creatorId: stat.creatorId,
      creatorName: creator?.name ?? "Inconnu",
      finalScore,
      contributionsCount: stat.contributionsCount,
      contributionsEur: stat.contributionsEur,
      visibilityBoostPoints: visibilityScores[stat.creatorId] ?? 0,
      revenueEur,
    }
  })

  return {
    closedAt: new Date().toISOString(),
    totalContributionsEur: totalsByType.video + totalsByType.audio + totalsByType.article,
    top10,
    redistributionByContentType: redistribution,
  }
}

function computeRedistribution(totalEur: number, type: "video" | "audio" | "article") {
  const shares = SHARES_BY_CONTENT_TYPE[type]
  return {
    totalEur: Math.round(totalEur * 100) / 100,
    vixualEur: Math.round(totalEur * shares.vixual * 100) / 100,
    creatorsEur: Math.round(totalEur * (shares.top10 + shares.bonusPool) * 100) / 100,
    reserveEur: Math.round(totalEur * shares.reserve * 100) / 100,
  }
}

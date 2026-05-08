/**
 * MODULE TEST-LAB VIXUAL — RUNNER DE SCENARIOS COMPLETS
 * Compose users + projects + Stripe sim + Bunny sim + Trust Score +
 * Visibility Boost + Cycle mensuel.
 * 100% en memoire, aucun appel base sauf persistance test_lab_*.
 */

import type { TestScenarioConfig, TestScenarioResult } from "./types"
import { generateTestUsersExtended, aggregateUserStats } from "./users"
import { generateTestProjects } from "./projects"
import { generateStripeTestTransactions } from "./stripe-simulator"
import { simulateBunnyProcessing } from "./bunny-simulator"
import { simulateVisibilityBoosts } from "./visibility-boost-simulator"
import { simulateMonthlyCycle } from "./cycle-simulator"
import { simulateTrustScoreEvolution } from "./trust-score-simulator"

export function runCustomScenario(config: TestScenarioConfig): TestScenarioResult {
  // 1. Generer les utilisateurs etendus (8 profils + Trust Score + balance)
  const usersExt = generateTestUsersExtended({
    visitors: config.visitors,
    creators: config.creators,
    contributors: config.contributors,
    infoporteurs: config.infoporteurs,
    podcasteurs: config.podcasteurs,
    auditeurs: config.auditeurs,
    contribu_lecteurs: config.contribu_lecteurs,
    guests: config.guests,
    simulatedDaysActive: config.simulatedDaysActive,
  })

  // 2. Generer projets (TestUserExtended est compatible TestUser via extends)
  let projects = generateTestProjects(
    { videos: config.videos, podcasts: config.podcasts, articles: config.articles },
    usersExt,
  )

  if (config.enableBunnyMock) {
    projects = simulateBunnyProcessing(projects)
  }

  // 3. Transactions Stripe simulees
  const transactions = config.enableStripeSimulation
    ? generateStripeTestTransactions(
        {
          successfulPaymentsPercent: config.successfulPaymentsPercent,
          failedPaymentsPercent: config.failedPaymentsPercent,
        },
        usersExt,
        projects,
      )
    : []

  // 4. Simulation Trust Score (V2/V3)
  const trustEvol = config.enableTrustScoreEvolution
    ? simulateTrustScoreEvolution(usersExt, config.simulatedDaysActive)
    : null

  // 5. Simulation boost visibilite (V1+)
  const boostResult = config.enableVisibilityBoostSim
    ? simulateVisibilityBoosts(
        usersExt,
        usersExt.filter(
          (u) => u.role === "creator" || u.role === "infoporteur" || u.role === "podcasteur",
        ),
        { participationRatePercent: 35, avgPointsPerSupport: 25 },
      )
    : null

  // 6. Simulation cycle mensuel (cloture + TOP 10 + redistribution)
  const cycleResult = config.enableMonthlyCycleClose
    ? simulateMonthlyCycle({
        users: usersExt,
        projects,
        transactions,
        visibilityScores: boostResult?.creatorScores,
      })
    : null

  // 7. Calculer metriques economiques agregees
  const totalRevenueEur = transactions
    .filter((t) => t.status === "success")
    .reduce((s, t) => s + t.amount, 0)

  // Estimation moyenne ponderee (~25% Vixual / 65% createurs / 10% reserve)
  const vixualShare = totalRevenueEur * 0.25
  const creatorsRevenue = totalRevenueEur * 0.65
  const reserveTechnique = totalRevenueEur * 0.1

  const userStats = aggregateUserStats(usersExt)

  return {
    scenarioName: config.name,
    users: usersExt,
    projects,
    transactions,
    summary: {
      usersCount: usersExt.length,
      projectsCount: projects.length,
      transactionsCount: transactions.length,
      successfulPayments: transactions.filter((t) => t.status === "success").length,
      failedPayments: transactions.filter((t) => t.status === "failed").length,
      totalRevenueEur: Math.round(totalRevenueEur * 100) / 100,
      vixualPlatformShareEur: Math.round(vixualShare * 100) / 100,
      creatorsRevenueEur: Math.round(creatorsRevenue * 100) / 100,
      reserveTechniqueEur: Math.round(reserveTechnique * 100) / 100,
      profileBreakdown: userStats.byRole,
      level1Count: trustEvol?.finalDistribution.level1 ?? userStats.byLevel.level1,
      level2Count: trustEvol?.finalDistribution.level2 ?? userStats.byLevel.level2,
      level3Count: trustEvol?.finalDistribution.level3 ?? userStats.byLevel.level3,
      totalVisibilityPointsSpent: boostResult?.totalPointsSpent ?? 0,
      uniqueBoosters: boostResult?.uniqueBoosters ?? 0,
      giniCoefficient: boostResult?.giniCoefficient ?? 0,
      top10Creators:
        cycleResult?.top10.map((c) => ({
          creatorId: c.creatorId,
          finalScore: c.finalScore,
          revenueEur: c.revenueEur,
        })) ?? [],
      cycleClosedAt: cycleResult?.closedAt ?? null,
    },
  }
}

export function buildDefaultScenario(
  partial: Partial<TestScenarioConfig> = {},
): TestScenarioConfig {
  return {
    name: partial.name || "Scenario test VIXUAL",
    visitors: Number(partial.visitors ?? 20),
    creators: Number(partial.creators ?? 5),
    contributors: Number(partial.contributors ?? 15),
    infoporteurs: Number(partial.infoporteurs ?? 3),
    podcasteurs: Number(partial.podcasteurs ?? 3),
    auditeurs: Number(partial.auditeurs ?? 8),
    contribu_lecteurs: Number(partial.contribu_lecteurs ?? 8),
    guests: Number(partial.guests ?? 10),
    videos: Number(partial.videos ?? 5),
    podcasts: Number(partial.podcasts ?? 3),
    articles: Number(partial.articles ?? 4),
    successfulPaymentsPercent: Number(partial.successfulPaymentsPercent ?? 80),
    failedPaymentsPercent: Number(partial.failedPaymentsPercent ?? 20),
    durationMinutes: Number(partial.durationMinutes ?? 30),
    enableStripeSimulation: Boolean(partial.enableStripeSimulation ?? true),
    enableBunnyMock: Boolean(partial.enableBunnyMock ?? true),
    enableTrustScoreEvolution: Boolean(partial.enableTrustScoreEvolution ?? true),
    enableVisibilityBoostSim: Boolean(partial.enableVisibilityBoostSim ?? true),
    enableMonthlyCycleClose: Boolean(partial.enableMonthlyCycleClose ?? true),
    simulatedDaysActive: Number(partial.simulatedDaysActive ?? 30),
  }
}

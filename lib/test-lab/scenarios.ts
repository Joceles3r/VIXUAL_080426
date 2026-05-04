/**
 * MODULE TEST-LAB VIXUAL — RUNNER DE SCENARIOS
 * Compose users + projects + Stripe sim + Bunny sim.
 * 100 % en memoire, aucun appel base sauf persistance volontaire test_lab_*.
 */

import type { TestScenarioConfig, TestScenarioResult } from "./types"
import { generateTestUsers } from "./users"
import { generateTestProjects } from "./projects"
import { generateStripeTestTransactions } from "./stripe-simulator"
import { simulateBunnyProcessing } from "./bunny-simulator"

export function runCustomScenario(config: TestScenarioConfig): TestScenarioResult {
  const users = generateTestUsers({
    visitors: config.visitors,
    creators: config.creators,
    contributors: config.contributors,
  })

  let projects = generateTestProjects(
    {
      videos: config.videos,
      podcasts: config.podcasts,
      articles: config.articles,
    },
    users,
  )

  if (config.enableBunnyMock) {
    projects = simulateBunnyProcessing(projects)
  }

  const transactions = config.enableStripeSimulation
    ? generateStripeTestTransactions(
        {
          successfulPaymentsPercent: config.successfulPaymentsPercent,
          failedPaymentsPercent: config.failedPaymentsPercent,
        },
        users,
        projects,
      )
    : []

  return {
    scenarioName: config.name,
    users,
    projects,
    transactions,
    summary: {
      usersCount: users.length,
      projectsCount: projects.length,
      transactionsCount: transactions.length,
      successfulPayments: transactions.filter((t) => t.status === "success").length,
      failedPayments: transactions.filter((t) => t.status === "failed").length,
    },
  }
}

export function buildDefaultScenario(
  partial: Partial<TestScenarioConfig> = {},
): TestScenarioConfig {
  return {
    name: partial.name || "Scenario test VIXUAL",
    visitors: Number(partial.visitors ?? 5),
    creators: Number(partial.creators ?? 2),
    contributors: Number(partial.contributors ?? 5),
    videos: Number(partial.videos ?? 2),
    podcasts: Number(partial.podcasts ?? 1),
    articles: Number(partial.articles ?? 2),
    successfulPaymentsPercent: Number(partial.successfulPaymentsPercent ?? 80),
    failedPaymentsPercent: Number(partial.failedPaymentsPercent ?? 20),
    durationMinutes: Number(partial.durationMinutes ?? 30),
    enableStripeSimulation: Boolean(partial.enableStripeSimulation ?? true),
    enableBunnyMock: Boolean(partial.enableBunnyMock ?? true),
  }
}

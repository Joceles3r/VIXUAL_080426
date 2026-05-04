import { runCustomScenario } from "./scenarios"
import type { TestScenarioConfig, TestScenarioResult } from "./types"

export interface ScenarioComparison {
  scenarioA: TestScenarioResult
  scenarioB: TestScenarioResult
  delta: { totalRevenue: number; topCreatorEarnings: number; avgContributionPerCreator: number; vixualPlatformShare: number }
  winner: "A" | "B" | "tie"
  recommendation: string
}

export function compareScenarios(configA: TestScenarioConfig, configB: TestScenarioConfig): ScenarioComparison {
  const a = runCustomScenario(configA)
  const b = runCustomScenario(configB)
  const aRev = a.transactions.reduce((s, t) => s + (t.amount ?? 0), 0)
  const bRev = b.transactions.reduce((s, t) => s + (t.amount ?? 0), 0)
  const delta = {
    totalRevenue: bRev - aRev,
    topCreatorEarnings: 0,
    avgContributionPerCreator: 0,
    vixualPlatformShare: (bRev - aRev) * 0.23,
  }
  const winner = bRev > aRev * 1.05 ? "B" : aRev > bRev * 1.05 ? "A" : "tie"
  const recommendation = winner === "tie" ? "Pas de difference significative" : `Configuration ${winner} recommandee (+${Math.abs((delta.totalRevenue / Math.max(aRev, 1)) * 100).toFixed(1)}%)`
  return { scenarioA: a, scenarioB: b, delta, winner, recommendation }
}

/**
 * MODULE TEST-LAB VIXUAL — API : COMPARAISON A/B DE SCENARIOS
 * Garde stricte par assertTestLabAccess (env + email PATRON).
 * Execute deux runCustomScenario en memoire, ne touche jamais les tables metier.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  assertTestLabAccess,
  denyTestLabAccess,
} from "@/lib/test-lab/guards"
import { compareScenarios } from "@/lib/test-lab/comparison"
import { buildDefaultScenario } from "@/lib/test-lab/scenarios"
import type { TestScenarioConfig } from "@/lib/test-lab/types"

export const runtime = "nodejs"

interface ComparisonBody {
  configA?: Partial<TestScenarioConfig>
  configB?: Partial<TestScenarioConfig>
}

export async function POST(req: NextRequest) {
  // Securite stricte : seul le PATRON peut comparer des scenarios
  const adminEmail = req.headers.get("x-admin-email")
  if (!assertTestLabAccess(adminEmail)) {
    return denyTestLabAccess()
  }

  // Verrou mode isole
  const mode = process.env.VIXUAL_TEST_LAB_MODE ?? "isolated"
  if (mode !== "isolated") {
    return NextResponse.json(
      {
        success: false,
        error: "Mode test lab non isole - operation refusee",
      },
      { status: 403 },
    )
  }

  let body: ComparisonBody = {}
  try {
    body = (await req.json()) as ComparisonBody
  } catch {
    body = {}
  }

  const configA = buildDefaultScenario({
    ...body.configA,
    name: body.configA?.name || "Scenario A",
  })
  const configB = buildDefaultScenario({
    ...body.configB,
    name: body.configB?.name || "Scenario B",
  })

  const comparison = compareScenarios(configA, configB)

  // Optimisation tokens : on renvoie uniquement les summaries et le delta,
  // pas les listes completes d'utilisateurs / contenus / transactions.
  return NextResponse.json({
    success: true,
    configA,
    configB,
    delta: comparison.delta,
    winner: comparison.winner,
    recommendation: comparison.recommendation,
    summaryA: comparison.scenarioA.summary,
    summaryB: comparison.scenarioB.summary,
  })
}

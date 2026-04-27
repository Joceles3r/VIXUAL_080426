/**
 * MODULE TEST-LAB VIXUAL — API : LANCER UN SCENARIO
 * Garde par assertTestLabAccess (env + email PATRON).
 * Persiste un resume dans test_lab_runs si la table existe.
 * N'ecrit JAMAIS dans les tables metiers (users, contents, payments, ...).
 */

import { NextRequest, NextResponse } from "next/server"
import {
  assertTestLabAccess,
  denyTestLabAccess,
} from "@/lib/test-lab/guards"
import { runCustomScenario, buildDefaultScenario } from "@/lib/test-lab/scenarios"
import type { TestScenarioConfig } from "@/lib/test-lab/types"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

async function persistRun(
  name: string,
  summary: unknown,
  createdBy: string,
): Promise<string | null> {
  try {
    const rows = (await sql`
      INSERT INTO test_lab_runs (name, summary, created_by)
      VALUES (${name}, ${JSON.stringify(summary)}::jsonb, ${createdBy})
      RETURNING id
    `) as Array<{ id: string }>
    return rows?.[0]?.id ?? null
  } catch (err) {
    console.warn("[v0] test-lab persistRun skipped:", (err as Error).message)
    return null
  }
}

export async function POST(req: NextRequest) {
  // SECURITE STRICTE : seul le PATRON peut lancer des scenarios
  const adminEmail = req.headers.get("x-admin-email")

  // Debug log pour voir l'email recu
  console.log("[TEST-LAB] Email recu:", adminEmail, "| Attendu: jocelyndru@gmail.com")

  if (!assertTestLabAccess(adminEmail)) {
    console.log("[TEST-LAB] Acces refuse pour:", adminEmail)
    return denyTestLabAccess()
  }

  // Verrou mode isole : aucune ecriture dans tables reelles
  const mode = process.env.VIXUAL_TEST_LAB_MODE ?? "isolated"
  if (mode !== "isolated") {
    return NextResponse.json({
      success: false,
      error: "Mode test lab non isole - operation refusee",
    }, { status: 403 })
  }

  let body: Partial<TestScenarioConfig> = {}
  try {
    body = (await req.json()) as Partial<TestScenarioConfig>
  } catch {
    body = {}
  }

  // Validation des inputs
  if ((body.visitors ?? 0) < 0 || (body.contributors ?? 0) < 0 || (body.creators ?? 0) < 0) {
    return NextResponse.json({
      success: false,
      error: "Configuration invalide : valeurs negatives non autorisees",
    }, { status: 400 })
  }

  const config = buildDefaultScenario(body)

  // Log pour debug
  console.log("[TEST-LAB] Scenario lancé:", {
    admin: adminEmail,
    scenario: config.name,
    visitors: config.visitors,
    creators: config.creators,
    contributors: config.contributors,
  })

  const result = runCustomScenario(config)

  const runId = await persistRun(config.name, result.summary, adminEmail || "patron")

  return NextResponse.json({
    success: true,
    runId,
    config,
    result,
  })
}

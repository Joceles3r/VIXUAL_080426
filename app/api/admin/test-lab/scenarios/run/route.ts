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
  const adminEmail = req.headers.get("x-admin-email")

  if (!assertTestLabAccess(adminEmail)) {
    return denyTestLabAccess()
  }

  let body: Partial<TestScenarioConfig> = {}
  try {
    body = (await req.json()) as Partial<TestScenarioConfig>
  } catch {
    body = {}
  }

  const config = buildDefaultScenario(body)
  const result = runCustomScenario(config)

  const runId = await persistRun(config.name, result.summary, adminEmail || "patron")

  return NextResponse.json({
    success: true,
    runId,
    config,
    result,
  })
}

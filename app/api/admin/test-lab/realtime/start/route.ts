import { NextRequest, NextResponse } from "next/server"
import { assertIsolatedMode, assertTestLabAccess, denyTestLabAccess } from "@/lib/test-lab/guards"
import { sql } from "@/lib/db"
import type { RealtimeSimulationConfig } from "@/lib/test-lab/types"

export async function POST(req: NextRequest) {
  // Mode dev : header, sinon session (a adapter)
  const adminEmail =
    process.env.NODE_ENV === "development"
      ? req.headers.get("x-admin-email")
      : null

  if (!assertTestLabAccess(adminEmail)) {
    return denyTestLabAccess()
  }

  if (!assertIsolatedMode()) {
    return NextResponse.json(
      { success: false, error: "Le Labo Tests doit etre en mode isolated" },
      { status: 400 }
    )
  }

  let body: Partial<RealtimeSimulationConfig> = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const config: RealtimeSimulationConfig = {
    name: body.name || "Simulation 1 000 utilisateurs",
    users: Number(body.users ?? 1000),
    creators: Number(body.creators ?? 50),
    projects: Number(body.projects ?? 100),
    durationMinutes: Number(body.durationMinutes ?? 30),
    intensity: body.intensity || "medium",
    contributionsPerMinute: Number(body.contributionsPerMinute ?? 40),
    paymentFailurePercent: Number(body.paymentFailurePercent ?? 8),
    bunnyErrorPercent: Number(body.bunnyErrorPercent ?? 3),
  }

  const inserted = await sql`
    INSERT INTO test_lab_runs (name, mode, summary, status, created_by)
    VALUES (${config.name}, 'realtime', ${JSON.stringify(config)}, 'running', ${adminEmail || "patron"})
    RETURNING id
  `

  return NextResponse.json({
    success: true,
    runId: inserted[0]?.id,
    config,
  })
}

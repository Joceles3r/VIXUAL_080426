import { NextRequest, NextResponse } from "next/server"
import { assertTestLabAccess, denyTestLabAccess } from "@/lib/test-lab/guards"
import { simulateRealtimeTick } from "@/lib/test-lab/realtime-engine"
import { sql } from "@/lib/db"
import type { RealtimeSimulationConfig } from "@/lib/test-lab/types"

export async function POST(req: NextRequest) {
  const adminEmail =
    process.env.NODE_ENV === "development"
      ? req.headers.get("x-admin-email")
      : null

  if (!assertTestLabAccess(adminEmail)) {
    return denyTestLabAccess()
  }

  let body: { runId?: string; tick?: number; config?: RealtimeSimulationConfig } = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const { runId, config } = body
  const tick = Number(body.tick ?? 1)

  if (!runId || !config) {
    return NextResponse.json(
      { success: false, error: "runId et config requis" },
      { status: 400 }
    )
  }

  const result = simulateRealtimeTick(config, tick)

  // Persister les metriques dans test_lab_metrics
  await sql`
    INSERT INTO test_lab_metrics (
      run_id, tick, active_users, page_views,
      contributions_count, contribution_amount_total,
      successful_payments, failed_payments,
      bunny_processing, bunny_ready, bunny_error
    )
    VALUES (
      ${runId}, ${result.tick}, ${result.activeUsers}, ${result.pageViews},
      ${result.contributionsCount}, ${result.contributionAmountTotal},
      ${result.successfulPayments}, ${result.failedPayments},
      ${result.bunnyProcessing}, ${result.bunnyReady}, ${result.bunnyError}
    )
  `

  return NextResponse.json({
    success: true,
    result,
  })
}

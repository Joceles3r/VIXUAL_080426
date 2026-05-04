import { NextRequest, NextResponse } from "next/server"
import { assertTestLabAccess, denyTestLabAccess } from "@/lib/test-lab/guards"
import { sql } from "@/lib/db"

export async function POST(req: NextRequest) {
  const adminEmail =
    process.env.NODE_ENV === "development"
      ? req.headers.get("x-admin-email")
      : null

  if (!assertTestLabAccess(adminEmail)) {
    return denyTestLabAccess()
  }

  let body: { runId?: string } = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const { runId } = body

  if (!runId) {
    return NextResponse.json(
      { success: false, error: "runId requis" },
      { status: 400 }
    )
  }

  await sql`
    UPDATE test_lab_runs
    SET status = 'completed'
    WHERE id = ${runId}
  `

  return NextResponse.json({
    success: true,
    message: "Simulation arretee",
  })
}

/**
 * MODULE TEST-LAB VIXUAL — API : RESET DU LABORATOIRE
 * Vide UNIQUEMENT les tables test_lab_*. Aucune table metier n'est touchee.
 */

import { NextRequest, NextResponse } from "next/server"
import { assertTestLabAccess, denyTestLabAccess } from "@/lib/test-lab/guards"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  // SECURITE STRICTE : seul le PATRON peut reset le laboratoire
  const adminEmail = req.headers.get("x-admin-email")

  if (!assertTestLabAccess(adminEmail)) {
    return denyTestLabAccess()
  }

  console.log("[TEST-LAB] Reset demandé par:", adminEmail)

  try {
    await sql`DELETE FROM test_lab_payloads`
    await sql`DELETE FROM test_lab_runs`
    return NextResponse.json({
      success: true,
      message: "Laboratoire de tests reinitialise",
    })
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Reset partiel ou tables manquantes",
        detail: (err as Error).message,
      },
      { status: 500 },
    )
  }
}

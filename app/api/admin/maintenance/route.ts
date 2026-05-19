/**
 * VIXUAL — /api/admin/maintenance
 * GET : recupere l'etat actuel
 * PUT : met a jour (PATRON ou admin uniquement)
 */
import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getMaintenanceConfig, saveMaintenanceConfig } from "@/lib/maintenance"

export const runtime = "nodejs"

async function checkAdmin(req: NextRequest): Promise<{ ok: boolean; email?: string }> {
  const email = req.headers.get("x-admin-email")
  if (!email) return { ok: false }
  const rows = await sql`SELECT role FROM users WHERE email = ${email} LIMIT 1`
  const role = (rows[0] as { role?: string })?.role
  return { ok: role === "admin" || role === "patron", email }
}

export async function GET() {
  const config = await getMaintenanceConfig()
  return NextResponse.json({ config })
}

export async function PUT(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const body = await req.json()
  const updated = await saveMaintenanceConfig(body, auth.email!)
  return NextResponse.json({ config: updated })
}

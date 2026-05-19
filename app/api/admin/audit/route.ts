/**
 * VIXUAL — /api/admin/audit
 * Liste les evenements de la table security_audit_log avec filtres.
 */
import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

async function checkAdmin(req: NextRequest): Promise<boolean> {
  const email = req.headers.get("x-admin-email")
  if (!email) return false
  const rows = await sql`SELECT role FROM users WHERE email = ${email} LIMIT 1`
  const role = (rows[0] as { role?: string })?.role
  return role === "admin" || role === "patron"
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const url = new URL(req.url)
  const severity = url.searchParams.get("severity") ?? "all"
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100", 10) || 100, 500)

  try {
    const entries = severity === "all"
      ? await sql`
          SELECT id, event_type, severity, user_id, ip_address, action, resource, outcome, context, created_at
          FROM security_audit_log
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT id, event_type, severity, user_id, ip_address, action, resource, outcome, context, created_at
          FROM security_audit_log
          WHERE severity = ${severity}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
    return NextResponse.json({ entries })
  } catch (e) {
    return NextResponse.json({ entries: [], error: (e as Error).message })
  }
}

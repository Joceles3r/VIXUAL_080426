import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

async function checkAdmin(req: NextRequest): Promise<boolean> {
  const adminEmail = req.headers.get("x-admin-email")
  if (!adminEmail) return false
  const rows = await sql`SELECT role FROM users WHERE email = ${adminEmail} LIMIT 1`
  const role = (rows[0] as { role?: string })?.role
  return role === "admin" || role === "patron"
}

export async function GET(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const url = new URL(req.url)
  const status = url.searchParams.get("status")
  const rows = status
    ? await sql`SELECT * FROM support_reports WHERE status = ${status} ORDER BY created_at DESC LIMIT 100`
    : await sql`SELECT * FROM support_reports ORDER BY created_at DESC LIMIT 100`
  return NextResponse.json({ reports: rows })
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const body = await req.json()
  const id = String(body?.id ?? "")
  const status = String(body?.status ?? "")
  const adminNotes = body?.adminNotes ? String(body.adminNotes) : null
  if (!id || !["new", "in_progress", "resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }
  const resolvedAt = ["resolved", "dismissed"].includes(status) ? "NOW()" : null
  await sql`
    UPDATE support_reports
    SET status = ${status},
        admin_notes = COALESCE(${adminNotes}, admin_notes),
        resolved_at = CASE WHEN ${status} IN ('resolved','dismissed') THEN NOW() ELSE resolved_at END
    WHERE id = ${id}::uuid
  `
  return NextResponse.json({ ok: true })
}

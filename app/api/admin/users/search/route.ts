/**
 * VIXUAL — app/api/admin/users/search/route.ts
 * Recherche utilisateur par email/nom/id.
 */
import { NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(req: NextRequest) {
  const adminEmail = req.headers.get("x-admin-email")
  const patronEmail = process.env.PATRON_EMAIL ?? "jocelyndru@gmail.com"
  if (adminEmail !== patronEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const url = new URL(req.url)
  const q = (url.searchParams.get("q") ?? "").trim()
  if (!q || q.length < 2) return NextResponse.json({ users: [] })
  if (!isDatabaseConfigured()) return NextResponse.json({ users: [] })

  try {
    const like = `%${q.toLowerCase()}%`
    const rows = await sql`
      SELECT id, email, display_name, role, level, created_at, email_verified
      FROM users
      WHERE LOWER(email) LIKE ${like}
         OR LOWER(display_name) LIKE ${like}
         OR id::text = ${q}
      ORDER BY created_at DESC
      LIMIT 25
    `
    return NextResponse.json({ users: rows })
  } catch (e) {
    return NextResponse.json({ users: [], error: (e as Error).message })
  }
}

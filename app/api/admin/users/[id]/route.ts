/**
 * VIXUAL — app/api/admin/users/[id]/route.ts
 * Details complets d'un utilisateur pour le PATRON.
 */
import { NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const adminEmail = req.headers.get("x-admin-email")
  const patronEmail = process.env.PATRON_EMAIL ?? "jocelyndru@gmail.com"
  if (adminEmail !== patronEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const resolved = await Promise.resolve(params)
  const id = resolved.id
  if (!id || !isDatabaseConfigured()) return NextResponse.json({ error: "Not available" }, { status: 404 })

  try {
    const users = await sql`SELECT * FROM users WHERE id = ${id}::uuid LIMIT 1`
    if (users.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const user = users[0]
    let contributionsCount = 0
    let contentsCount = 0
    let alertsCount = 0

    try {
      const c = await sql`SELECT COUNT(*) AS cnt FROM contributions WHERE user_id = ${id}::uuid`
      contributionsCount = Number(c[0]?.cnt ?? 0)
    } catch {}
    try {
      const c = await sql`SELECT COUNT(*) AS cnt FROM contents WHERE creator_id = ${id}::uuid`
      contentsCount = Number(c[0]?.cnt ?? 0)
    } catch {}
    try {
      const c = await sql`SELECT COUNT(*) AS cnt FROM moderation_alerts WHERE user_id = ${id}::uuid`
      alertsCount = Number(c[0]?.cnt ?? 0)
    } catch {}

    return NextResponse.json({
      user,
      stats: { contributions: contributionsCount, contents: contentsCount, alerts: alertsCount },
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

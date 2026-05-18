import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { listArchives, markRestored, purgeArchive } from "@/lib/archives"

export const runtime = "nodejs"

async function checkAdmin(req: NextRequest): Promise<{ ok: boolean; email?: string; role?: string }> {
  const email = req.headers.get("x-admin-email")
  if (!email) return { ok: false }
  const rows = await sql`SELECT role FROM users WHERE email = ${email} LIMIT 1`
  const role = (rows[0] as { role?: string })?.role
  return { ok: role === "admin" || role === "patron", email, role }
}

export async function GET(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const url = new URL(req.url)
  const status = (url.searchParams.get("status") ?? "archived") as
    | "archived" | "restored" | "purged" | "all"
  const items = await listArchives(status, 200)
  return NextResponse.json({ items })
}

export async function PATCH(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 })

  const { id, action } = await req.json()
  if (!id || !["restore", "purge"].includes(action)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }

  if (action === "restore") {
    await markRestored(id, auth.email!)
    return NextResponse.json({ ok: true, action: "restored" })
  }
  await purgeArchive(id)
  return NextResponse.json({ ok: true, action: "purged" })
}

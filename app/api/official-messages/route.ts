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

/**
 * GET public : retourne les messages publies non expires.
 * GET avec header admin : retourne TOUS les messages (incl. drafts).
 */
export async function GET(req: NextRequest) {
  const isAdmin = await checkAdmin(req)
  const rows = isAdmin
    ? await sql`SELECT * FROM official_messages ORDER BY created_at DESC LIMIT 50`
    : await sql`
        SELECT id, title, body, category, published_at
        FROM official_messages
        WHERE is_published = true
          AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY published_at DESC
        LIMIT 10
      `
  return NextResponse.json({ messages: rows })
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const body = await req.json()
  const title = String(body?.title ?? "").trim().slice(0, 200)
  const messageBody = String(body?.body ?? "").trim().slice(0, 5000)
  const category = String(body?.category ?? "announcement")
  const isPublished = Boolean(body?.isPublished)
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt).toISOString() : null
  const createdBy = req.headers.get("x-admin-email") ?? "unknown"

  if (title.length < 3 || messageBody.length < 10) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }
  if (!["announcement", "maintenance", "security", "update", "alert"].includes(category)) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO official_messages (title, body, category, is_published, published_at, expires_at, created_by)
    VALUES (
      ${title}, ${messageBody}, ${category}, ${isPublished},
      ${isPublished ? new Date().toISOString() : null},
      ${expiresAt}, ${createdBy}
    )
    RETURNING *
  `
  return NextResponse.json({ message: rows[0] })
}

export async function PATCH(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const body = await req.json()
  const id = String(body?.id ?? "")
  const isPublished = Boolean(body?.isPublished)
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 })

  await sql`
    UPDATE official_messages
    SET is_published = ${isPublished},
        published_at = CASE WHEN ${isPublished} AND published_at IS NULL THEN NOW() ELSE published_at END,
        updated_at = NOW()
    WHERE id = ${id}::uuid
  `
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await checkAdmin(req))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  const url = new URL(req.url)
  const id = url.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "invalid" }, { status: 400 })
  await sql`DELETE FROM official_messages WHERE id = ${id}::uuid`
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

/**
 * POST /api/support/report
 * Endpoint public : enregistre un rapport utilisateur (bug / contenu casse / autre).
 * Limite : 5 rapports par IP / heure (rate-limit basique en memoire dev — Upstash en prod).
 */
const recent = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= MAX_PER_WINDOW) return true
  arr.push(now)
  recent.set(ip, arr)
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 })
    }
    const body = await req.json()
    const category = String(body?.category ?? "").trim()
    const message = String(body?.message ?? "").trim()
    const email = body?.email ? String(body.email).trim().slice(0, 200) : null
    const path = body?.path ? String(body.path).slice(0, 500) : null
    const userAgent = body?.userAgent ? String(body.userAgent).slice(0, 500) : null

    if (!["bug", "broken_content", "other"].includes(category)) {
      return NextResponse.json({ error: "invalid_category" }, { status: 400 })
    }
    if (message.length < 10 || message.length > 1000) {
      return NextResponse.json({ error: "invalid_message" }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO support_reports (category, message, email, path, user_agent)
      VALUES (${category}, ${message}, ${email}, ${path}, ${userAgent})
      RETURNING id
    `
    return NextResponse.json({ ok: true, id: (rows[0] as { id: string })?.id })
  } catch (err) {
    console.error("[support/report] error", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}

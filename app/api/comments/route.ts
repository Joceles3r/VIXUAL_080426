import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { detectVelocityAnomaly } from "@/lib/moderation/detectors"

export async function GET(req: NextRequest) {
  const contentId = req.nextUrl.searchParams.get("contentId")
  if (!contentId) {
    return NextResponse.json({ error: "contentId required" }, { status: 400 })
  }

  const rows = await sql`
    SELECT
      c.id, c.body, c.parent_id, c.created_at, c.user_id,
      COALESCE(u.display_name, u.email) AS author_name
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.content_id = ${contentId}
      AND c.is_deleted = false
    ORDER BY c.created_at DESC
    LIMIT 100
  `
  return NextResponse.json({ comments: rows })
}

export async function POST(req: NextRequest) {
  const { contentId, userId, body, parentId } = await req.json()

  if (!contentId || !userId || !body || body.length < 1 || body.length > 2000) {
    return NextResponse.json({ error: "Champs invalides" }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO comments (content_id, user_id, body, parent_id)
    VALUES (${contentId}, ${userId}::uuid, ${body}, ${parentId ?? null})
    RETURNING id, created_at
  `

  // Hook moderation : detecter la velocite anormale
  // (>10 commentaires en 30s = bot probable)
  await detectVelocityAnomaly(userId, "comment_posted")

  return NextResponse.json({ id: rows[0].id, createdAt: rows[0].created_at })
}

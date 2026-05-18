/**
 * VIXUAL — app/api/contents/route.ts
 *
 * GET /api/contents — Liste les contenus publies (BD ou mocks).
 *
 * Query params :
 *  - type=video|text|podcast (optionnel, filtre)
 *  - limit=20 (defaut)
 *  - offset=0 (defaut)
 *
 * Comportement :
 *  - Si BD configuree ET au moins 1 contenu publie : renvoie la BD.
 *  - Sinon : fallback ALL_CONTENTS (mocks).
 */
import { NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { dbRowToContent, type ContentDbRow } from "@/lib/contents/adapter"
import { ALL_CONTENTS } from "@/lib/mock-data"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const type = url.searchParams.get("type")
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 100)
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0", 10) || 0, 0)

  const validType =
    type === "video" || type === "text" || type === "podcast" ? type : null

  // 1) Tentative BD
  if (isDatabaseConfigured()) {
    try {
      const rows = validType
        ? await sql`
            SELECT c.*, u.display_name AS creator_name
            FROM contents c
            LEFT JOIN users u ON u.id = c.creator_id
            WHERE c.is_published = TRUE
              AND c.content_type = ${validType}
            ORDER BY c.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : await sql`
            SELECT c.*, u.display_name AS creator_name
            FROM contents c
            LEFT JOIN users u ON u.id = c.creator_id
            WHERE c.is_published = TRUE
            ORDER BY c.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `

      if (rows.length > 0) {
        const contents = (rows as ContentDbRow[]).map(dbRowToContent)
        return NextResponse.json({ contents, source: "db", total: contents.length })
      }
    } catch (e) {
      console.warn("[/api/contents] BD error, fallback mock:", (e as Error).message)
    }
  }

  // 2) Fallback mocks
  let items = ALL_CONTENTS
  if (validType) {
    items = items.filter((c) => c.contentType === validType)
  }
  const sliced = items.slice(offset, offset + limit)
  return NextResponse.json({ contents: sliced, source: "mock", total: sliced.length })
}

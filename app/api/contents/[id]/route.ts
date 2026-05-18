/**
 * VIXUAL — app/api/contents/[id]/route.ts
 *
 * GET /api/contents/[id] — Recupere un contenu publie par son ID (BD ou mock).
 *
 * Comportement :
 *  - Tente la lecture BD (table `contents` + jointure user pour creator_name).
 *  - Si DB non configuree OU ID introuvable : fallback sur ALL_CONTENTS (mocks).
 *  - Retourne 404 uniquement si l'ID n'existe ni en BD ni dans les mocks.
 */
import { NextRequest, NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"
import { dbRowToContent, type ContentDbRow } from "@/lib/contents/adapter"
import { ALL_CONTENTS } from "@/lib/mock-data"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  // Next.js 15+ : params peut etre une Promise. On normalise.
  const resolved = await Promise.resolve(params)
  const id = resolved.id

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  // 1) Tentative BD (uniquement si UUID valide)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  if (isUuid && isDatabaseConfigured()) {
    try {
      const rows = await sql`
        SELECT c.*, u.display_name AS creator_name
        FROM contents c
        LEFT JOIN users u ON u.id = c.creator_id
        WHERE c.id = ${id}::uuid
          AND c.is_published = TRUE
        LIMIT 1
      `
      if (rows.length > 0) {
        const content = dbRowToContent(rows[0] as ContentDbRow)
        return NextResponse.json({ content, source: "db" })
      }
    } catch (e) {
      // En cas d'erreur SQL, on retombe sur les mocks (mode degrade gracieux).
      console.warn("[/api/contents/[id]] BD error, fallback mock:", (e as Error).message)
    }
  }

  // 2) Fallback mocks (toujours actif, utile en dev + pre-lancement)
  const mock = ALL_CONTENTS.find((c) => c.id === id)
  if (mock) {
    return NextResponse.json({ content: mock, source: "mock" })
  }

  return NextResponse.json({ error: "Content not found" }, { status: 404 })
}

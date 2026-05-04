import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  loadQueueForUniverse,
  logTop100Audit,
  normalizeUniverse,
  type VixualUniverse,
} from "@/lib/selection/top100-selection-engine"

export const dynamic = "force-dynamic"

/**
 * GET /api/top100/queue?universe=audiovisual
 * Retourne la file d'attente actuelle pour un univers.
 */
export async function GET(req: NextRequest) {
  const universeParam = req.nextUrl.searchParams.get("universe")
  if (!universeParam) {
    return NextResponse.json(
      { success: false, error: "universe required" },
      { status: 400 },
    )
  }
  const universe: VixualUniverse = normalizeUniverse(universeParam)

  const candidates = await loadQueueForUniverse(universe)
  return NextResponse.json({
    success: true,
    universe,
    queueLength: candidates.length,
    queue: candidates.map((c) => ({
      contentId: c.contentId,
      creatorId: c.creatorId,
      submittedAt: c.submittedAt.toISOString(),
      priorityLevel: c.priorityLevel,
      reentryPaid: c.reentryPaid,
    })),
  })
}

/**
 * POST /api/top100/queue
 * Body: { contentId, creatorId, universe, priorityLevel?, reentryPaid? }
 *
 * Inscrit un projet dans la file d'attente. Idempotent : si le projet
 * est deja en file pour cet univers, on met juste a jour priorite/reentry.
 */
export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: "invalid_json" },
      { status: 400 },
    )
  }

  const { contentId, creatorId } = body ?? {}
  if (!contentId || !creatorId || !body.universe) {
    return NextResponse.json(
      { success: false, error: "contentId, creatorId, universe required" },
      { status: 400 },
    )
  }

  const universe = normalizeUniverse(String(body.universe))
  const priorityLevel = Number.isFinite(body.priorityLevel) ? body.priorityLevel : 0
  const reentryPaid = !!body.reentryPaid

  // Upsert atomique
  const result = await sql`
    INSERT INTO top100_queue
      (content_id, creator_id, universe, status, priority_level, reentry_paid)
    VALUES (${contentId}, ${creatorId}, ${universe}, 'queued', ${priorityLevel}, ${reentryPaid})
    ON CONFLICT DO NOTHING
    RETURNING id::text
  `

  await logTop100Audit({
    action: "queue_enter",
    contentId,
    creatorId,
    universe,
    details: { priorityLevel, reentryPaid, inserted: result.length > 0 },
  })

  return NextResponse.json({
    success: true,
    universe,
    inserted: result.length > 0,
  })
}

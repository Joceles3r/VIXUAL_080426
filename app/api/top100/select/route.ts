import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  getOrCreateCurrentCycle,
  loadQueueForUniverse,
  logTop100Audit,
  normalizeUniverse,
  selectTop100Candidates,
  type VixualUniverse,
} from "@/lib/selection/top100-selection-engine"

const PATRON_EMAIL = "jocelyndru@gmail.com"

export const dynamic = "force-dynamic"

/**
 * POST /api/top100/select
 * Body: { universe, maxPerCreator? }
 *
 * Selectionne les 100 projets eligibles pour le cycle courant :
 *  - file d'attente equitable
 *  - anti-monopole createur
 *  - aucun aleatoire
 *
 * Reserve a l'admin/PATRON.
 */
export async function POST(req: NextRequest) {
  const adminEmail = req.headers.get("x-admin-email")?.trim().toLowerCase()
  if (adminEmail !== PATRON_EMAIL) {
    return NextResponse.json(
      { success: false, error: "forbidden" },
      { status: 403 },
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  if (!body?.universe) {
    return NextResponse.json(
      { success: false, error: "universe required" },
      { status: 400 },
    )
  }
  const universe: VixualUniverse = normalizeUniverse(String(body.universe))
  const maxPerCreator = Number.isFinite(body.maxPerCreator) ? body.maxPerCreator : 3

  const cycle = await getOrCreateCurrentCycle(universe)
  if (cycle.status !== "open") {
    return NextResponse.json(
      { success: false, error: "cycle_closed" },
      { status: 409 },
    )
  }

  const queue = await loadQueueForUniverse(universe)
  const selected = selectTop100Candidates(queue, {
    maxPerCreator,
    maxTotal: cycle.maxProjects,
  })

  // Marque les projets selectionnes
  const ids = selected.map((s) => s.contentId)
  if (ids.length > 0) {
    await sql`
      UPDATE top100_queue
      SET status = 'selected_top100',
          cycle_id = ${cycle.id}::uuid,
          selected_at = NOW(),
          updated_at = NOW()
      WHERE universe = ${universe}
        AND content_id = ANY(${ids})
        AND status IN ('queued', 'reentry_paid')
    `
    await sql`
      UPDATE top100_cycles
      SET selected_count = ${ids.length}, updated_at = NOW()
      WHERE id = ${cycle.id}::uuid
    `
  }

  await logTop100Audit({
    action: "select_top100",
    universe,
    cycleId: cycle.id,
    details: {
      selectedCount: selected.length,
      maxPerCreator,
      contentIds: ids,
    },
    createdBy: adminEmail,
  })

  return NextResponse.json({
    success: true,
    universe,
    cycleId: cycle.id,
    cycleNumber: cycle.cycleNumber,
    selectedCount: selected.length,
    selected: selected.map((s) => ({
      contentId: s.contentId,
      creatorId: s.creatorId,
      priorityLevel: s.priorityLevel,
      reentryPaid: s.reentryPaid,
    })),
  })
}

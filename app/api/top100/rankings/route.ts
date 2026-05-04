import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  getOrCreateCurrentCycle,
  loadRankingsForCycle,
  normalizeUniverse,
  type VixualUniverse,
} from "@/lib/selection/top100-selection-engine"

export const dynamic = "force-dynamic"

/**
 * GET /api/top100/rankings?universe=audiovisual&cycleNumber=42
 *
 * - Sans cycleNumber : retourne le classement du cycle "open" courant.
 * - Avec cycleNumber : retourne le classement fige d'un cycle passe.
 */
export async function GET(req: NextRequest) {
  const universeParam = req.nextUrl.searchParams.get("universe")
  const cycleNumberParam = req.nextUrl.searchParams.get("cycleNumber")

  if (!universeParam) {
    return NextResponse.json(
      { success: false, error: "universe required" },
      { status: 400 },
    )
  }
  const universe: VixualUniverse = normalizeUniverse(universeParam)

  let cycleId: string
  let cycleNumber: number
  let cycleStatus: string

  if (cycleNumberParam) {
    const rows = await sql`
      SELECT id::text, cycle_number, status
      FROM top100_cycles
      WHERE universe = ${universe} AND cycle_number = ${Number(cycleNumberParam)}
      LIMIT 1
    `
    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "cycle_not_found" },
        { status: 404 },
      )
    }
    const r = rows[0] as any
    cycleId = r.id
    cycleNumber = r.cycle_number
    cycleStatus = r.status
  } else {
    const cycle = await getOrCreateCurrentCycle(universe)
    cycleId = cycle.id
    cycleNumber = cycle.cycleNumber
    cycleStatus = cycle.status
  }

  const rankings = await loadRankingsForCycle(cycleId)

  return NextResponse.json({
    success: true,
    universe,
    cycleId,
    cycleNumber,
    cycleStatus,
    rankingsCount: rankings.length,
    rankings: rankings.map((r) => ({
      rank: r.rank,
      contentId: r.contentId,
      score: r.score,
      scoreDetails: r.scoreDetails,
    })),
  })
}

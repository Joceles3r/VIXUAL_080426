import { NextRequest, NextResponse } from "next/server"
import {
  getOrCreateCurrentCycle,
  normalizeUniverse,
  type VixualUniverse,
} from "@/lib/selection/top100-selection-engine"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const universeParam = req.nextUrl.searchParams.get("universe")
  if (!universeParam) {
    return NextResponse.json(
      { success: false, error: "universe required" },
      { status: 400 },
    )
  }

  const universe: VixualUniverse = normalizeUniverse(universeParam)

  try {
    const cycle = await getOrCreateCurrentCycle(universe)
    return NextResponse.json({
      success: true,
      universe,
      cycle: {
        id: cycle.id,
        cycleNumber: cycle.cycleNumber,
        status: cycle.status,
        selectedCount: cycle.selectedCount,
        maxProjects: cycle.maxProjects,
        openedAt: cycle.openedAt.toISOString(),
        closedAt: cycle.closedAt?.toISOString() ?? null,
      },
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "cycle_lookup_failed" },
      { status: 500 },
    )
  }
}

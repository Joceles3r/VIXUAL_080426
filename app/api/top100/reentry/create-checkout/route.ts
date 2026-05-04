import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  canRequestReentry,
  logTop100Audit,
  normalizeUniverse,
} from "@/lib/selection/top100-selection-engine"

export const dynamic = "force-dynamic"

/**
 * POST /api/top100/reentry/create-checkout
 * Body: { contentId, creatorId, previousCycleId, universe, rank }
 *
 * Cree une session Stripe Checkout 25 € pour la reintegration prioritaire.
 * La validation finale a lieu cote webhook (`/api/top100/reentry/confirm`).
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

  const { contentId, creatorId, previousCycleId, rank } = body ?? {}
  if (!contentId || !creatorId || !previousCycleId || typeof rank !== "number" || !body.universe) {
    return NextResponse.json(
      { success: false, error: "contentId, creatorId, previousCycleId, universe, rank required" },
      { status: 400 },
    )
  }
  const universe = normalizeUniverse(String(body.universe))

  // Verifie l'eligibilite cote serveur
  const cycleRows = await sql`
    SELECT closed_at FROM top100_cycles
    WHERE id = ${previousCycleId}::uuid
    LIMIT 1
  `
  const closedAt = (cycleRows[0] as any)?.closed_at
  if (!closedAt) {
    return NextResponse.json(
      { success: false, error: "cycle_not_closed" },
      { status: 409 },
    )
  }

  const eligible = canRequestReentry({
    rank,
    closedAt: new Date(closedAt),
    now: new Date(),
    isSanctioned: false,
  })
  if (!eligible) {
    return NextResponse.json(
      { success: false, error: "reentry_not_eligible" },
      { status: 403 },
    )
  }

  // Marque la file d'attente en "reentry_pending_payment"
  await sql`
    INSERT INTO top100_queue
      (content_id, creator_id, universe, status, priority_level, reentry_paid)
    VALUES (${contentId}, ${creatorId}, ${universe}, 'reentry_pending_payment', 5, false)
    ON CONFLICT DO NOTHING
  `

  await logTop100Audit({
    action: "reentry_request",
    contentId,
    creatorId,
    universe,
    cycleId: previousCycleId,
    details: { rank, amount: 25 },
  })

  // Stripe Checkout : on prepare juste les metadata.
  // L'integration Stripe reelle est deleguee a l'integration Stripe du projet.
  return NextResponse.json({
    success: true,
    metadata: {
      type: "top100_reentry",
      contentId,
      creatorId,
      previousCycleId,
      universe,
    },
    amount: 25,
    currency: "EUR",
    note: "create checkout session via Stripe integration with these metadata",
  })
}

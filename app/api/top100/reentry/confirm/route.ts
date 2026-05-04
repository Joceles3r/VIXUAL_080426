import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import {
  logTop100Audit,
  normalizeUniverse,
} from "@/lib/selection/top100-selection-engine"

export const dynamic = "force-dynamic"

/**
 * POST /api/top100/reentry/confirm
 *
 * Endpoint appele par le webhook Stripe (`checkout.session.completed`)
 * apres paiement reussi. Met a jour la file d'attente :
 *
 *   reentry_pending_payment  →  reentry_paid  →  requeued (priorite haute)
 *
 * On verifie 2 elements :
 *  1. metadata.type === "top100_reentry"
 *  2. payment_status === "paid"
 *
 * Le secret webhook Stripe est verifie par le route handler Stripe
 * principal qui delegue ici via fetch interne.
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

  const { metadata, paymentStatus } = body ?? {}
  if (!metadata || metadata.type !== "top100_reentry") {
    return NextResponse.json(
      { success: false, error: "invalid_metadata_type" },
      { status: 400 },
    )
  }
  if (paymentStatus !== "paid") {
    return NextResponse.json(
      { success: false, error: "payment_not_completed" },
      { status: 402 },
    )
  }

  const { contentId, creatorId, previousCycleId } = metadata
  if (!contentId || !creatorId || !previousCycleId || !metadata.universe) {
    return NextResponse.json(
      { success: false, error: "metadata fields missing" },
      { status: 400 },
    )
  }

  const universe = normalizeUniverse(String(metadata.universe))

  // Active la priorite : reentry_paid + flag reentry_paid + priority_level haut
  await sql`
    UPDATE top100_queue
    SET status = 'reentry_paid',
        reentry_paid = true,
        priority_level = GREATEST(priority_level, 10),
        updated_at = NOW()
    WHERE content_id = ${contentId}
      AND creator_id = ${creatorId}
      AND universe = ${universe}
      AND status = 'reentry_pending_payment'
  `

  // Repasse en "queued" priorite haute pour le prochain cycle
  await sql`
    UPDATE top100_queue
    SET status = 'requeued', updated_at = NOW()
    WHERE content_id = ${contentId}
      AND creator_id = ${creatorId}
      AND universe = ${universe}
      AND status = 'reentry_paid'
  `

  await logTop100Audit({
    action: "reentry_paid",
    contentId,
    creatorId,
    universe,
    cycleId: previousCycleId,
    details: { amount: 25, paymentStatus },
  })

  await logTop100Audit({
    action: "reentry_requeue",
    contentId,
    creatorId,
    universe,
    cycleId: previousCycleId,
    details: { priorityLevel: 10 },
  })

  return NextResponse.json({
    success: true,
    contentId,
    creatorId,
    universe,
    status: "requeued",
  })
}

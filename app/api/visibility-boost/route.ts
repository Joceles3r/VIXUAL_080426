import { NextRequest, NextResponse } from "next/server"
import { recordVisibilityBoost } from "@/lib/visibility-boost/engine"
import { processModerationEvent } from "@/lib/moderation/trust-score-engine"
import { evaluatePromotion } from "@/lib/moderation/promotion-evaluator"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { visitorId, creatorId, contentId, points } = body

  if (!visitorId || !creatorId || !points) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
  }

  const result = await recordVisibilityBoost(
    visitorId,
    creatorId,
    contentId ?? null,
    Number(points),
  )

  if (!result.success) {
    return NextResponse.json({ error: result.reason }, { status: 400 })
  }

  // Hooks moderation : Trust Score + evaluation de promotion
  await processModerationEvent({ kind: "boost_given", userId: visitorId })
  await processModerationEvent({ kind: "boost_received", userId: creatorId })
  await evaluatePromotion(visitorId)

  return NextResponse.json(result)
}

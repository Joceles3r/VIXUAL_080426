import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getStripeClient } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const { investmentId, userId } = await req.json()
  const rows = await sql`SELECT id, stripe_payment_intent_id, amount, cooling_off_expires_at, cooling_off_waived FROM investments WHERE id = ${investmentId} AND user_id = ${userId}::uuid LIMIT 1`
  if (rows.length === 0) return NextResponse.json({ error: "Contribution introuvable" }, { status: 404 })
  const inv = rows[0]
  if (inv.cooling_off_waived) return NextResponse.json({ error: "Delai de retractation renonce" }, { status: 400 })
  if (new Date(inv.cooling_off_expires_at as string) < new Date()) return NextResponse.json({ error: "Delai de 14 jours depasse" }, { status: 400 })

  const stripe = await getStripeClient()
  await stripe.refunds.create({ payment_intent: inv.stripe_payment_intent_id as string })
  await sql`UPDATE investments SET status = 'refunded' WHERE id = ${investmentId}`
  return NextResponse.json({ success: true })
}

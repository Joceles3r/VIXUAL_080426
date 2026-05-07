import { NextRequest, NextResponse } from "next/server"
import { evaluatePlatformProgression } from "@/lib/moderation/platform-evaluator"
import { PATRON_EMAIL } from "@/lib/admin/roles"

export async function POST(req: NextRequest) {
  const adminEmail = req.headers.get("x-admin-email")
  const cronKey = req.headers.get("x-cron-key")
  const cronKeyOk = !!cronKey && cronKey === process.env.MODERATION_CRON_KEY
  const adminOk = !!adminEmail && adminEmail.toLowerCase() === PATRON_EMAIL.toLowerCase()
  if (!cronKeyOk && !adminOk) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await evaluatePlatformProgression()
  return NextResponse.json({ success: true, evaluated: true })
}

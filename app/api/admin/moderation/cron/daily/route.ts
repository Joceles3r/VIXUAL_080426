import { NextRequest, NextResponse } from "next/server"
import { evaluatePlatformProgression } from "@/lib/moderation/platform-evaluator"
import { sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  const cronKey = req.headers.get("x-cron-key") ?? req.nextUrl.searchParams.get("key")
  if (!cronKey || cronKey !== process.env.MODERATION_CRON_KEY) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await evaluatePlatformProgression()

  // Expirer les alertes dépassées
  try {
    await sql`
      UPDATE moderation_alerts
      SET status = 'expired'
      WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at < NOW()
    `
  } catch (e) {
    console.warn("[cron daily expire alerts skipped]", (e as Error).message)
  }

  return NextResponse.json({ success: true, evaluatedAt: new Date().toISOString() })
}

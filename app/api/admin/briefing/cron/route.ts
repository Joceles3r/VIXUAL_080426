/**
 * VIXUAL — app/api/admin/briefing/cron/route.ts
 * Cron quotidien a 8h Paris (6h UTC) : envoie le briefing au PATRON.
 */
import { NextRequest, NextResponse } from "next/server"
import { collectBriefingData } from "@/lib/briefing/collector"
import { renderBriefingEmail } from "@/lib/briefing/email-template"
import { sendEmail } from "@/lib/email/resend"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const key = url.searchParams.get("key")
  const expectedKey = process.env.BRIEFING_CRON_KEY ?? process.env.MODERATION_CRON_KEY

  if (!expectedKey || key !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const patronEmail = process.env.PATRON_EMAIL ?? "jocelyndru@gmail.com"

  try {
    const data = await collectBriefingData()
    const { subject, html } = renderBriefingEmail(data)

    // sendEmail(to, subject, html) — signature positionnelle existante
    await sendEmail(patronEmail, subject, html)

    return NextResponse.json({ ok: true, sent_to: patronEmail, alerts: data.alerts })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

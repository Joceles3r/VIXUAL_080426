/**
 * VIXUAL — lib/briefing/collector.ts
 * Collecte des metriques quotidiennes pour le briefing PATRON.
 */
import { sql, isDatabaseConfigured } from "@/lib/db"

export interface BriefingData {
  date: string
  alerts: { critical: number; warning: number; info: number }
  activity: { newUsers: number; newContents: number; contributions: number; revenueEur: number }
  pending: { channelRequests: number; promotions: number; reports: number }
  health: { db: boolean; stripe: boolean; bunny: boolean; resend: boolean }
  errors: { count24h: number }
}

export async function collectBriefingData(): Promise<BriefingData> {
  const today = new Date().toISOString().slice(0, 10)
  const data: BriefingData = {
    date: today,
    alerts: { critical: 0, warning: 0, info: 0 },
    activity: { newUsers: 0, newContents: 0, contributions: 0, revenueEur: 0 },
    pending: { channelRequests: 0, promotions: 0, reports: 0 },
    health: { db: false, stripe: false, bunny: false, resend: false },
    errors: { count24h: 0 },
  }

  if (!isDatabaseConfigured()) return data
  data.health.db = true

  try {
    const alerts = await sql`
      SELECT severity, COUNT(*) AS cnt FROM moderation_alerts
      WHERE created_at > NOW() - INTERVAL '24 hours' AND resolved = FALSE
      GROUP BY severity
    `
    for (const r of alerts) {
      if (r.severity === "critical") data.alerts.critical = Number(r.cnt)
      else if (r.severity === "warning") data.alerts.warning = Number(r.cnt)
      else data.alerts.info = Number(r.cnt)
    }
  } catch {}

  try {
    const users = await sql`SELECT COUNT(*) AS cnt FROM users WHERE created_at > NOW() - INTERVAL '24 hours'`
    data.activity.newUsers = Number(users[0]?.cnt ?? 0)
  } catch {}

  try {
    const contents = await sql`SELECT COUNT(*) AS cnt FROM contents WHERE created_at > NOW() - INTERVAL '24 hours'`
    data.activity.newContents = Number(contents[0]?.cnt ?? 0)
  } catch {}

  try {
    const contribs = await sql`
      SELECT COUNT(*) AS cnt, COALESCE(SUM(amount_eur), 0) AS total
      FROM contributions WHERE created_at > NOW() - INTERVAL '24 hours' AND status = 'completed'
    `
    data.activity.contributions = Number(contribs[0]?.cnt ?? 0)
    data.activity.revenueEur = Number(contribs[0]?.total ?? 0)
  } catch {}

  try {
    const ch = await sql`SELECT COUNT(*) AS cnt FROM creator_channels WHERE status = 'pending'`
    data.pending.channelRequests = Number(ch[0]?.cnt ?? 0)
  } catch {}

  data.health.stripe = !!process.env.STRIPE_SECRET_KEY
  data.health.bunny = !!process.env.BUNNY_STORAGE_API_KEY
  data.health.resend = !!process.env.RESEND_API_KEY

  return data
}

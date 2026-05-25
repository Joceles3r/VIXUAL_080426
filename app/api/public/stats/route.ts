/**
 * VIXUAL — GET /api/public/stats
 *
 * Retourne des compteurs reels (homepage) en lieu et place des stats fictives.
 * Cache memoire 60s pour eviter les COUNT(*) trop frequents.
 */
import { NextResponse } from "next/server"
import { sql, isDatabaseConfigured } from "@/lib/db"

export const runtime = "nodejs"
export const revalidate = 60

// Cache memoire local au process
let cached: { data: PublicStats; expiresAt: number } | null = null
const TTL_MS = 60_000

export interface PublicStats {
  users: number
  contents: number
  contributedEuros: number
  successRatePercent: number | null
}

async function fetchStats(): Promise<PublicStats> {
  if (!isDatabaseConfigured()) {
    return { users: 0, contents: 0, contributedEuros: 0, successRatePercent: null }
  }

  try {
    const [usersRow] = (await sql`SELECT COUNT(*)::int AS n FROM users`) as Array<{ n: number }>
    const [contentsRow] = (await sql`SELECT COUNT(*)::int AS n FROM contents WHERE status = 'published'`) as Array<{ n: number }>
    let contributed = 0
    try {
      const [contribRow] = (await sql`SELECT COALESCE(SUM(amount_cents), 0)::bigint AS total FROM contributions WHERE status = 'paid'`) as Array<{ total: string }>
      contributed = Math.round(Number(contribRow.total) / 100)
    } catch {
      contributed = 0
    }
    return {
      users: usersRow?.n ?? 0,
      contents: contentsRow?.n ?? 0,
      contributedEuros: contributed,
      successRatePercent: null,
    }
  } catch {
    return { users: 0, contents: 0, contributedEuros: 0, successRatePercent: null }
  }
}

export async function GET() {
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data)
  }
  const data = await fetchStats()
  cached = { data, expiresAt: now + TTL_MS }
  return NextResponse.json(data)
}

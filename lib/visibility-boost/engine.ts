import { sql } from "@/lib/db"

export const BOOST_RULES = {
  minPoints: 10, maxPointsPerSupport: 50,
  monthlyBoostCapPercent: 0.3,
  trustScoreFloor: 30,
} as const

/** Conversion logarithmique : favorise diversite plutot qu'intensite */
export function pointsToVisibilityScore(pointsSpent: number, visitorTrustScore: number): number {
  if (pointsSpent < BOOST_RULES.minPoints) return 0
  const trustFactor = Math.max(0.5, Math.min(1.5, visitorTrustScore / 60))
  return Math.log10(pointsSpent + 1) * 10 * trustFactor
}

export async function recordVisibilityBoost(visitorId: string, creatorId: string, contentId: string | null, pointsSpent: number): Promise<{ success: boolean; visibilityGain?: number; reason?: string }> {
  if (pointsSpent < BOOST_RULES.minPoints || pointsSpent > BOOST_RULES.maxPointsPerSupport) {
    return { success: false, reason: `Le don doit etre entre ${BOOST_RULES.minPoints} et ${BOOST_RULES.maxPointsPerSupport} VIXUpoints.` }
  }
  if (visitorId === creatorId) return { success: false, reason: "Auto-soutien interdit." }

  const visitorRows = await sql`SELECT trust_score, vixupoints_balance FROM users WHERE id = ${visitorId}::uuid LIMIT 1`
  if (visitorRows.length === 0) return { success: false, reason: "Visiteur introuvable." }
  const trust = (visitorRows[0].trust_score as number) ?? 50
  const balance = (visitorRows[0].vixupoints_balance as number) ?? 0

  if (trust < BOOST_RULES.trustScoreFloor) return { success: false, reason: "Score de confiance insuffisant." }
  if (balance < pointsSpent) return { success: false, reason: "VIXUpoints insuffisants." }

  const cycleMonth = new Date().toISOString().slice(0, 7)
  const score = pointsToVisibilityScore(pointsSpent, trust)

  await sql`
    INSERT INTO creator_visibility_boost (visitor_id, creator_id, content_id, vixupoints_spent, visibility_score, visitor_trust_score, cycle_month)
    VALUES (${visitorId}::uuid, ${creatorId}::uuid, ${contentId}, ${pointsSpent}, ${score}, ${trust}, ${cycleMonth})
  `
  await sql`UPDATE users SET vixupoints_balance = vixupoints_balance - ${pointsSpent} WHERE id = ${visitorId}::uuid`

  return { success: true, visibilityGain: score }
}

export async function getCreatorBoostStats(creatorId: string, cycleMonth?: string): Promise<{ totalScore: number; uniqueSupporters: number; totalPoints: number }> {
  const month = cycleMonth ?? new Date().toISOString().slice(0, 7)
  const rows = await sql`
    SELECT COALESCE(SUM(visibility_score),0) AS score, COUNT(DISTINCT visitor_id) AS supporters, COALESCE(SUM(vixupoints_spent),0) AS points
    FROM creator_visibility_boost WHERE creator_id = ${creatorId}::uuid AND cycle_month = ${month}
  `
  return { totalScore: Number(rows[0].score), uniqueSupporters: Number(rows[0].supporters), totalPoints: Number(rows[0].points) }
}

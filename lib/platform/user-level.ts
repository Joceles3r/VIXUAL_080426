import { sql } from "@/lib/db"

export type UserLevel = 1 | 2 | 3
export type PromotionReason = "signup" | "creator_signup" | "contributor_signup" | "trust_threshold" | "manual_admin" | "first_contribution" | "first_publication"

export interface UserLevelStatus {
  currentLevel: UserLevel
  promotedAt: Date | null
  needsCelebration: boolean
}

const PROMOTION_RULES = {
  toLevel2: { minTrustScore: 50, minDaysActive: 7, minActions: 3 },
  toLevel3: { minTrustScore: 75, minDaysActive: 30, minContributionsOrPublications: 5 },
} as const

export async function getUserLevelStatus(userId: string): Promise<UserLevelStatus | null> {
  const rows = await sql`SELECT user_level, level_promoted_at, level_celebrated FROM users WHERE id = ${userId}::uuid LIMIT 1`
  if (rows.length === 0) return null
  return {
    currentLevel: (rows[0].user_level as UserLevel) ?? 1,
    promotedAt: rows[0].level_promoted_at ? new Date(rows[0].level_promoted_at as string) : null,
    needsCelebration: (rows[0].level_celebrated as number) < (rows[0].user_level as number),
  }
}

export async function promoteUser(userId: string, toLevel: UserLevel, reason: PromotionReason): Promise<void> {
  const current = await getUserLevelStatus(userId)
  if (!current || current.currentLevel >= toLevel) return
  await sql`UPDATE users SET user_level = ${toLevel}, level_promoted_at = NOW() WHERE id = ${userId}::uuid`
  await sql`INSERT INTO user_level_history (user_id, from_level, to_level, reason) VALUES (${userId}::uuid, ${current.currentLevel}, ${toLevel}, ${reason})`
}

export async function markCelebrationSeen(userId: string): Promise<void> {
  await sql`UPDATE users SET level_celebrated = user_level WHERE id = ${userId}::uuid`
}

/** Evalue automatiquement si l'utilisateur peut etre promu. A appeler apres chaque action significative. */
export async function evaluateAutoPromotion(userId: string): Promise<UserLevel | null> {
  const rows = await sql`
    SELECT u.user_level, u.trust_score, u.created_at, u.is_creator,
      (SELECT COUNT(*) FROM investments WHERE user_id = u.id AND status = 'completed') AS contributions,
      (SELECT COUNT(*) FROM contents WHERE creator_id = u.id) AS publications
    FROM users u WHERE u.id = ${userId}::uuid LIMIT 1
  `
  if (rows.length === 0) return null
  const u = rows[0]
  const level = u.user_level as UserLevel
  const trust = (u.trust_score as number) ?? 0
  const daysActive = Math.floor((Date.now() - new Date(u.created_at as string).getTime()) / 86400000)
  const contribs = Number(u.contributions ?? 0)
  const pubs = Number(u.publications ?? 0)

  if (level === 1) {
    const r = PROMOTION_RULES.toLevel2
    if (trust >= r.minTrustScore && daysActive >= r.minDaysActive && (contribs + pubs) >= r.minActions) {
      await promoteUser(userId, 2, "trust_threshold")
      return 2
    }
  } else if (level === 2) {
    const r = PROMOTION_RULES.toLevel3
    if (trust >= r.minTrustScore && daysActive >= r.minDaysActive && (contribs + pubs) >= r.minContributionsOrPublications) {
      await promoteUser(userId, 3, "trust_threshold")
      return 3
    }
  }
  return null
}

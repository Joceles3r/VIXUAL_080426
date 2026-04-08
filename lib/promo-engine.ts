import "server-only";
import { sql } from "@/lib/db";

// ── Configuration ──

/** Cooldown between promotional emails to the same user (in hours) */
const PROMO_EMAIL_COOLDOWN_HOURS = 72;

/** Maximum promo emails per user per month */
const MAX_PROMO_EMAILS_PER_MONTH = 4;

/** Max referral/share actions tracked per user */
const MAX_SHARE_ACTIONS_PER_DAY = 10;

// ── Types ──

export type PromoType =
  | "welcome"
  | "re_engagement"
  | "milestone"
  | "referral_reward"
  | "cycle_closure"
  | "content_published";

export interface PromoEmailPayload {
  userId: string;
  email: string;
  promoType: PromoType;
  subject: string;
  templateData?: Record<string, unknown>;
}

export interface PromoResult {
  sent: boolean;
  reason?: string;
  nextAllowedAt?: string;
}

// ── Email throttle checks ──

/**
 * Can we send a promo email to this user right now?
 * Checks cooldown and monthly cap.
 */
export async function canSendPromoEmail(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  nextAllowedAt?: string;
  monthlyCount?: number;
}> {
  // Check last sent email
  const lastEmail = await sql`
    SELECT sent_at
    FROM promo_email_logs
    WHERE user_id = ${userId}::uuid
    ORDER BY sent_at DESC
    LIMIT 1
  `;

  if (lastEmail.length > 0) {
    const lastSentAt = new Date((lastEmail[0] as { sent_at: string }).sent_at);
    const cooldownEnd = new Date(lastSentAt.getTime() + PROMO_EMAIL_COOLDOWN_HOURS * 3600 * 1000);
    if (new Date() < cooldownEnd) {
      return {
        allowed: false,
        reason: `Cooldown actif. Prochain envoi possible apres ${PROMO_EMAIL_COOLDOWN_HOURS}h.`,
        nextAllowedAt: cooldownEnd.toISOString(),
      };
    }
  }

  // Check monthly cap
  const monthlyCount = await sql`
    SELECT COUNT(*)::int as cnt
    FROM promo_email_logs
    WHERE user_id = ${userId}::uuid
      AND sent_at >= date_trunc('month', now())
  `;
  const cnt = Number((monthlyCount[0] as { cnt: number })?.cnt ?? 0);
  if (cnt >= MAX_PROMO_EMAILS_PER_MONTH) {
    return {
      allowed: false,
      reason: `Limite mensuelle atteinte (${MAX_PROMO_EMAILS_PER_MONTH} emails/mois).`,
      monthlyCount: cnt,
    };
  }

  return { allowed: true, monthlyCount: cnt };
}

/**
 * Log a sent promotional email.
 */
export async function logPromoEmail(
  userId: string,
  promoType: PromoType,
  subject: string,
  metadata?: Record<string, unknown>
) {
  await sql`
    INSERT INTO promo_email_logs (user_id, promo_type, subject, metadata)
    VALUES (${userId}::uuid, ${promoType}, ${subject}, ${JSON.stringify(metadata || {})})
  `;
}

// ── Share / Referral actions ──

/**
 * Check if user can perform a share action today.
 */
export async function canShareToday(userId: string): Promise<{
  allowed: boolean;
  todayCount: number;
}> {
  const rows = await sql`
    SELECT COUNT(*)::int as cnt
    FROM promo_actions
    WHERE user_id = ${userId}::uuid
      AND action_type = 'share'
      AND created_at >= date_trunc('day', now())
  `;
  const cnt = Number((rows[0] as { cnt: number })?.cnt ?? 0);
  return {
    allowed: cnt < MAX_SHARE_ACTIONS_PER_DAY,
    todayCount: cnt,
  };
}

/**
 * Log a share/referral action.
 */
export async function logShareAction(
  userId: string,
  channel: "email" | "link" | "social",
  metadata?: Record<string, unknown>
) {
  await sql`
    INSERT INTO promo_actions (user_id, action_type, channel, metadata)
    VALUES (${userId}::uuid, 'share', ${channel}, ${JSON.stringify(metadata || {})})
  `;
}

/**
 * Get promo stats for a user (for dashboard display).
 */
export async function getUserPromoStats(userId: string) {
  const emailCount = await sql`
    SELECT COUNT(*)::int as cnt FROM promo_email_logs
    WHERE user_id = ${userId}::uuid
      AND sent_at >= date_trunc('month', now())
  `;
  const shareCount = await sql`
    SELECT COUNT(*)::int as cnt FROM promo_actions
    WHERE user_id = ${userId}::uuid
      AND action_type = 'share'
      AND created_at >= date_trunc('month', now())
  `;
  const totalShares = await sql`
    SELECT COUNT(*)::int as cnt FROM promo_actions
    WHERE user_id = ${userId}::uuid
      AND action_type = 'share'
  `;

  return {
    monthlyEmails: Number((emailCount[0] as { cnt: number })?.cnt ?? 0),
    monthlyEmailCap: MAX_PROMO_EMAILS_PER_MONTH,
    monthlyShares: Number((shareCount[0] as { cnt: number })?.cnt ?? 0),
    totalShares: Number((totalShares[0] as { cnt: number })?.cnt ?? 0),
    cooldownHours: PROMO_EMAIL_COOLDOWN_HOURS,
  };
}

import { sql } from "@/lib/db"

export interface AuditEntry {
  eventType: string
  userId?: string | null
  alertId?: string | null
  trustScoreBefore?: number | null
  trustScoreAfter?: number | null
  trustScoreDelta?: number | null
  levelBefore?: number | null
  levelAfter?: number | null
  triggeredBy: string
  ruleName?: string | null
  context?: Record<string, unknown> | null
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const userId = entry.userId ?? null
    const alertId = entry.alertId ?? null
    const contextJson = entry.context ? JSON.stringify(entry.context) : null
    await sql`
      INSERT INTO moderation_audit_log (
        event_type, user_id, alert_id,
        trust_score_before, trust_score_after, trust_score_delta,
        level_before, level_after,
        triggered_by, rule_name, context
      ) VALUES (
        ${entry.eventType},
        ${userId}::uuid,
        ${alertId}::uuid,
        ${entry.trustScoreBefore ?? null},
        ${entry.trustScoreAfter ?? null},
        ${entry.trustScoreDelta ?? null},
        ${entry.levelBefore ?? null},
        ${entry.levelAfter ?? null},
        ${entry.triggeredBy},
        ${entry.ruleName ?? null},
        ${contextJson}::jsonb
      )
    `
  } catch (e) {
    console.warn("[moderation audit log skipped]", (e as Error).message)
  }
}

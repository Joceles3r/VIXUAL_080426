import { sql } from "@/lib/db"
import type { AlertSeverity, AlertType, ModerationAlert } from "./types"
import { sendCriticalAlertEmail } from "./email-notifier"

export interface CreateAlertInput {
  type: AlertType
  severity: AlertSeverity
  userId?: string | null
  relatedEntityType?: string | null
  relatedEntityId?: string | null
  title: string
  description: string
  context?: Record<string, unknown> | null
  suggestedAction?: string | null
  expiresInHours?: number
}

export async function createAlert(input: CreateAlertInput): Promise<string | null> {
  try {
    // Anti-doublons : si une alerte identique existe déjà en pending depuis < 24h, ne rien faire
    if (input.userId) {
      const existing = await sql`
        SELECT id FROM moderation_alerts
        WHERE type = ${input.type}
          AND user_id = ${input.userId}::uuid
          AND status = 'pending'
          AND created_at > NOW() - INTERVAL '24 hours'
        LIMIT 1
      `
      if (existing.length > 0) return null
    }

    const expiresAt = input.expiresInHours
      ? new Date(Date.now() + input.expiresInHours * 3_600_000).toISOString()
      : null

    const userId = input.userId ?? null
    const contextJson = input.context ? JSON.stringify(input.context) : null

    const rows = await sql`
      INSERT INTO moderation_alerts (
        type, severity, user_id,
        related_entity_type, related_entity_id,
        title, description, context, suggested_action, expires_at
      ) VALUES (
        ${input.type}, ${input.severity},
        ${userId}::uuid,
        ${input.relatedEntityType ?? null},
        ${input.relatedEntityId ?? null},
        ${input.title},
        ${input.description},
        ${contextJson}::jsonb,
        ${input.suggestedAction ?? null},
        ${expiresAt}
      )
      RETURNING id
    `

    const alertId = rows[0]?.id as string | undefined
    if (!alertId) return null

    if (input.severity === "critical") {
      await sendCriticalAlertEmail({
        type: input.type,
        title: input.title,
        description: input.description,
        alertId,
      })
      await sql`UPDATE moderation_alerts SET email_sent = true WHERE id = ${alertId}::uuid`
    }

    return alertId
  } catch (e) {
    console.warn("[moderation alert create skipped]", (e as Error).message)
    return null
  }
}

export async function listAlerts(
  filters: { status?: string; severity?: string; limit?: number } = {},
): Promise<ModerationAlert[]> {
  const status = filters.status ?? "pending"
  const limit = filters.limit ?? 50

  try {
    const rows = filters.severity
      ? await sql`
          SELECT * FROM moderation_alerts
          WHERE status = ${status} AND severity = ${filters.severity}
          ORDER BY
            CASE severity
              WHEN 'critical' THEN 1
              WHEN 'important' THEN 2
              WHEN 'standard' THEN 3
              ELSE 4
            END,
            created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT * FROM moderation_alerts
          WHERE status = ${status}
          ORDER BY
            CASE severity
              WHEN 'critical' THEN 1
              WHEN 'important' THEN 2
              WHEN 'standard' THEN 3
              ELSE 4
            END,
            created_at DESC
          LIMIT ${limit}
        `
    return rows.map(mapRowToAlert)
  } catch (e) {
    console.warn("[moderation alerts list skipped]", (e as Error).message)
    return []
  }
}

export async function resolveAlert(
  alertId: string,
  newStatus: "approved" | "rejected" | "escalated",
  resolvedBy: string,
  note: string | null,
): Promise<void> {
  await sql`
    UPDATE moderation_alerts
    SET status = ${newStatus},
        resolved_by = ${resolvedBy},
        resolved_at = NOW(),
        resolution_note = ${note}
    WHERE id = ${alertId}::uuid
  `
}

function mapRowToAlert(row: Record<string, unknown>): ModerationAlert {
  return {
    id: row.id as string,
    type: row.type as AlertType,
    severity: row.severity as AlertSeverity,
    status: row.status as ModerationAlert["status"],
    userId: (row.user_id as string | null) ?? null,
    relatedEntityType: (row.related_entity_type as string | null) ?? null,
    relatedEntityId: (row.related_entity_id as string | null) ?? null,
    title: row.title as string,
    description: row.description as string,
    context: (row.context as Record<string, unknown> | null) ?? null,
    suggestedAction: (row.suggested_action as string | null) ?? null,
    resolvedBy: (row.resolved_by as string | null) ?? null,
    resolvedAt: row.resolved_at ? new Date(row.resolved_at as string) : null,
    resolutionNote: (row.resolution_note as string | null) ?? null,
    emailSent: Boolean(row.email_sent),
    createdAt: new Date(row.created_at as string),
    expiresAt: row.expires_at ? new Date(row.expires_at as string) : null,
  }
}

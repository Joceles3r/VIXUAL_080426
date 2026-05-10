import { sql } from "@/lib/db"

export type SecuritySeverity = "info" | "warn" | "critical"

export interface SecurityAuditEntry {
  eventType: string
  severity?: SecuritySeverity
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  action: string
  resource?: string | null
  outcome: string
  context?: Record<string, unknown> | null
}

export async function logSecurityEvent(entry: SecurityAuditEntry): Promise<void> {
  try {
    const userId = entry.userId ?? null
    const contextJson = entry.context ? JSON.stringify(entry.context) : null
    await sql`
      INSERT INTO security_audit_log (
        event_type, severity, user_id, ip_address, user_agent,
        action, resource, outcome, context
      ) VALUES (
        ${entry.eventType},
        ${entry.severity ?? "info"},
        ${userId}::uuid,
        ${entry.ipAddress ?? null},
        ${entry.userAgent ?? null},
        ${entry.action},
        ${entry.resource ?? null},
        ${entry.outcome},
        ${contextJson}::jsonb
      )
    `
  } catch (e) {
    console.warn("[security audit skipped]", (e as Error).message)
  }
}

export async function logForbiddenAttempt(
  ip: string,
  path: string,
  method: string,
  userAgent: string | null,
  statusCode: number,
  userId: string | null = null,
): Promise<void> {
  try {
    await sql`
      INSERT INTO security_forbidden_attempts (
        ip_address, path, method, user_agent, status_code, user_id
      ) VALUES (
        ${ip}, ${path}, ${method}, ${userAgent}, ${statusCode},
        ${userId}::uuid
      )
    `
  } catch {}
}

/** Récupère le nombre de tentatives interdites depuis une IP */
export async function countRecentForbiddenAttempts(
  ip: string,
  windowMinutes: number = 15,
): Promise<number> {
  try {
    const rows = await sql`
      SELECT COUNT(*) AS cnt FROM security_forbidden_attempts
      WHERE ip_address = ${ip}
        AND created_at > NOW() - (${String(windowMinutes)} || ' minutes')::interval
    `
    return Number(rows[0]?.cnt ?? 0)
  } catch {
    return 0
  }
}

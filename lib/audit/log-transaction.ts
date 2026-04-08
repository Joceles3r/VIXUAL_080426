import { sql } from "@neondatabase/serverless"
import crypto from "crypto"

export interface AuditLogEntry {
  userId?: string
  action: "INVEST" | "UNLOCK" | "WITHDRAW" | "PAYOUT" | "LOGIN" | "KYC_VERIFIED" | "STEP_UP"
  amountCents?: number
  contentId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

/**
 * Log a financial or security transaction to the audit trail
 */
export async function logTransaction(entry: AuditLogEntry) {
  try {
    const ipHash = entry.ipAddress ? crypto.createHash("sha256").update(entry.ipAddress).digest("hex") : null

    await sql`
      INSERT INTO audit_logs (user_id, action, amount_cents, content_id, metadata, ip_hash)
      VALUES (
        ${entry.userId || null},
        ${entry.action},
        ${entry.amountCents || null},
        ${entry.contentId || null},
        ${JSON.stringify(entry.metadata || {})},
        ${ipHash}
      )
    `
  } catch (err) {
    // Log errors but don't throw - audit failures shouldn't break transactions
    console.error("[v0] Audit log error:", err)
  }
}

/**
 * Retrieve audit logs for a user (admin or self only)
 */
export async function getUserAuditLogs(userId: string, limit = 50, offset = 0) {
  try {
    const logs = await sql`
      SELECT id, action, amount_cents, content_id, metadata, created_at
      FROM audit_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return logs as any[]
  } catch {
    return []
  }
}

/**
 * Get aggregate audit stats (admin only)
 */
export async function getAuditStats(action?: string) {
  try {
    const stats = await sql`
      SELECT
        action,
        COUNT(*) as count,
        SUM(amount_cents) as total_amount,
        MAX(created_at) as last_occurrence
      FROM audit_logs
      ${action ? sql`WHERE action = ${action}` : sql``}
      GROUP BY action
      ORDER BY count DESC
    `
    return stats as any[]
  } catch {
    return []
  }
}

/**
 * VIXUAL — Admin Audit Logging Service
 * 
 * Journalise toutes les actions administrateur pour traçabilité et sécurité.
 */
import "server-only";
import { sql } from "@/lib/db";

// ── Types ────────────────────────────────────────────────────────────────────

export type AuditAction =
  // Stripe
  | "stripe_settings_updated"
  | "stripe_mode_changed"
  | "stripe_health_checked"
  | "stripe_keys_updated"
  | "stripe_webhook_secret_updated"
  // Connect
  | "stripe_connect_account_created"
  | "stripe_connect_onboarding_started"
  | "stripe_connect_account_synced"
  // Paiements
  | "checkout_session_created"
  | "refund_initiated"
  | "payout_initiated"
  // Admin
  | "admin_login"
  | "admin_logout"
  | "admin_settings_changed"
  | "user_role_changed"
  | "content_moderated"
  | "content_approved"
  | "content_rejected";

export type AuditTargetType =
  | "stripe_config"
  | "stripe_account"
  | "user"
  | "content"
  | "payment"
  | "payout"
  | "system";

export interface AuditLogEntry {
  actor: string;
  actorEmail?: string;
  action: AuditAction;
  target?: string;
  targetType?: AuditTargetType;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// ── Core Functions ───────────────────────────────────────────────────────────

/**
 * Log an admin action to the audit table
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    await sql`
      INSERT INTO admin_audit_log (
        actor, 
        actor_email, 
        action, 
        target, 
        target_type, 
        metadata, 
        ip_address, 
        user_agent
      ) VALUES (
        ${entry.actor},
        ${entry.actorEmail || null},
        ${entry.action},
        ${entry.target || null},
        ${entry.targetType || null},
        ${entry.metadata ? JSON.stringify(entry.metadata) : null},
        ${entry.ipAddress || null},
        ${entry.userAgent || null}
      )
    `;
  } catch (error) {
    // Log to console but don't fail the main operation
    console.error("[Admin Audit] Failed to log event:", error, entry);
  }
}

/**
 * Get recent audit logs (for admin dashboard)
 */
export async function getRecentAuditLogs(params: {
  limit?: number;
  offset?: number;
  actor?: string;
  action?: AuditAction;
  targetType?: AuditTargetType;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  logs: Array<{
    id: string;
    actor: string;
    actorEmail: string | null;
    action: string;
    target: string | null;
    targetType: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
  }>;
  total: number;
}> {
  const limit = params.limit || 50;
  const offset = params.offset || 0;

  // Build query with optional filters
  let logs;
  let countResult;

  if (params.actor) {
    logs = await sql`
      SELECT id, actor, actor_email, action, target, target_type, metadata, created_at
      FROM admin_audit_log
      WHERE actor = ${params.actor}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    countResult = await sql`
      SELECT COUNT(*) as count FROM admin_audit_log WHERE actor = ${params.actor}
    `;
  } else if (params.action) {
    logs = await sql`
      SELECT id, actor, actor_email, action, target, target_type, metadata, created_at
      FROM admin_audit_log
      WHERE action = ${params.action}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    countResult = await sql`
      SELECT COUNT(*) as count FROM admin_audit_log WHERE action = ${params.action}
    `;
  } else {
    logs = await sql`
      SELECT id, actor, actor_email, action, target, target_type, metadata, created_at
      FROM admin_audit_log
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    countResult = await sql`
      SELECT COUNT(*) as count FROM admin_audit_log
    `;
  }

  return {
    logs: logs.map((row) => ({
      id: row.id as string,
      actor: row.actor as string,
      actorEmail: row.actor_email as string | null,
      action: row.action as string,
      target: row.target as string | null,
      targetType: row.target_type as string | null,
      metadata: row.metadata as Record<string, unknown> | null,
      createdAt: new Date(row.created_at as string),
    })),
    total: Number(countResult[0]?.count || 0),
  };
}

// ── Convenience Loggers ──────────────────────────────────────────────────────

/**
 * Log Stripe settings update
 */
export async function logStripeSettingsUpdate(
  actor: string,
  actorEmail: string,
  changes: {
    modeChanged?: boolean;
    newMode?: string;
    keysUpdated?: string[];
  }
): Promise<void> {
  await logAuditEvent({
    actor,
    actorEmail,
    action: changes.modeChanged ? "stripe_mode_changed" : "stripe_settings_updated",
    target: "stripe_config",
    targetType: "stripe_config",
    metadata: {
      modeChanged: changes.modeChanged,
      newMode: changes.newMode,
      keysUpdated: changes.keysUpdated,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log Stripe health check
 */
export async function logStripeHealthCheck(
  actor: string,
  actorEmail: string,
  result: {
    success: boolean;
    mode: string;
    accountId?: string;
    errors?: string[];
  }
): Promise<void> {
  await logAuditEvent({
    actor,
    actorEmail,
    action: "stripe_health_checked",
    target: "stripe_config",
    targetType: "stripe_config",
    metadata: {
      success: result.success,
      mode: result.mode,
      accountId: result.accountId,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log Connect account creation
 */
export async function logConnectAccountCreated(
  actor: string,
  userId: string,
  stripeAccountId: string
): Promise<void> {
  await logAuditEvent({
    actor,
    action: "stripe_connect_account_created",
    target: stripeAccountId,
    targetType: "stripe_account",
    metadata: {
      userId,
      stripeAccountId,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * VIXUAL — Journal employés (employee_logs)
 *
 * Helpers Server-only pour tracer les actions employés.
 * Voir migration : scripts/migrations/045-employee-logs.sql
 *
 * Chaque action employé est :
 *   ✅ horodatée
 *   ✅ traçable
 *   ✅ visible ADMIN/PATRON uniquement
 */

import "server-only"
import { sql } from "@/lib/db"
import type { LaunchRole } from "@/lib/admin/launch-permissions"

export interface EmployeeLogInput {
  employeeId: string
  employeeRole: LaunchRole
  action: string
  targetType?: string | null
  targetId?: string | null
  details?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

export interface EmployeeLogRow {
  id: string
  employee_id: string
  employee_role: LaunchRole
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: Date
}

/**
 * Insère une entrée de log. Non-bloquant : ne throw jamais
 * (un échec de log ne doit pas casser l'action métier).
 */
export async function logEmployeeAction(input: EmployeeLogInput): Promise<void> {
  try {
    const detailsJson = JSON.stringify(input.details ?? {})
    await sql`
      INSERT INTO employee_logs (
        employee_id,
        employee_role,
        action,
        target_type,
        target_id,
        details,
        ip_address,
        user_agent
      ) VALUES (
        ${input.employeeId}::uuid,
        ${input.employeeRole},
        ${input.action},
        ${input.targetType ?? null},
        ${input.targetId ?? null},
        ${detailsJson}::jsonb,
        ${input.ipAddress ?? null},
        ${input.userAgent ?? null}
      )
    `
  } catch (err) {
    // Logger en console serveur mais ne jamais propager :
    // un échec d'audit ne doit pas bloquer l'action.
    console.error("[employee-logs] insert failed", err)
  }
}

/**
 * Récupère les N dernières actions d'un employé donné.
 */
export async function getEmployeeLogs(
  employeeId: string,
  limit = 50,
): Promise<EmployeeLogRow[]> {
  const safeLimit = Math.max(1, Math.min(limit, 200))
  const rows = await sql`
    SELECT * FROM employee_logs
    WHERE employee_id = ${employeeId}::uuid
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `
  return rows as unknown as EmployeeLogRow[]
}

/**
 * Vue globale ADMIN/PATRON — N actions les plus récentes, tous employés.
 */
export async function getRecentEmployeeLogs(limit = 100): Promise<EmployeeLogRow[]> {
  const safeLimit = Math.max(1, Math.min(limit, 500))
  const rows = await sql`
    SELECT * FROM employee_logs
    ORDER BY created_at DESC
    LIMIT ${safeLimit}
  `
  return rows as unknown as EmployeeLogRow[]
}

/**
 * Compte les actions d'un employé sur N derniers jours (KPI léger).
 */
export async function countEmployeeActions(
  employeeId: string,
  days = 7,
): Promise<number> {
  const safeDays = Math.max(1, Math.min(days, 90))
  const rows = await sql`
    SELECT COUNT(*)::int AS n FROM employee_logs
    WHERE employee_id = ${employeeId}::uuid
      AND created_at > NOW() - (${safeDays} || ' days')::interval
  `
  return ((rows[0] as { n?: number })?.n ?? 0) as number
}

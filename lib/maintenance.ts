/**
 * VIXUAL — Maintenance Mode
 *
 * Module serveur (Postgres) : un seul etat global, applique a toute la plateforme.
 * Les ADMIN/PATRON gardent toujours acces (verifie cote middleware).
 */
import "server-only"
import { sql, isDatabaseConfigured } from "@/lib/db"

export interface MaintenanceConfig {
  enabled: boolean
  message: string
  blockUploads: boolean
  blockPayments: boolean
  blockV2: boolean
  estimatedReturnAt: string | null
  updatedAt: string
  updatedBy: string | null
}

export const DEFAULT_MAINTENANCE: MaintenanceConfig = {
  enabled: false,
  message: "VIXUAL est temporairement en maintenance. Nos equipes effectuent des ameliorations.",
  blockUploads: false,
  blockPayments: false,
  blockV2: false,
  estimatedReturnAt: null,
  updatedAt: new Date(0).toISOString(),
  updatedBy: null,
}

export async function getMaintenanceConfig(): Promise<MaintenanceConfig> {
  if (!isDatabaseConfigured()) return DEFAULT_MAINTENANCE
  try {
    const rows = await sql`SELECT * FROM maintenance_state WHERE id = 1 LIMIT 1`
    if (rows.length === 0) return DEFAULT_MAINTENANCE
    const r = rows[0] as Record<string, unknown>
    return {
      enabled: !!r.enabled,
      message: (r.message as string) ?? DEFAULT_MAINTENANCE.message,
      blockUploads: !!r.block_uploads,
      blockPayments: !!r.block_payments,
      blockV2: !!r.block_v2,
      estimatedReturnAt: r.estimated_return_at
        ? new Date(r.estimated_return_at as string).toISOString()
        : null,
      updatedAt: r.updated_at
        ? new Date(r.updated_at as string).toISOString()
        : DEFAULT_MAINTENANCE.updatedAt,
      updatedBy: (r.updated_by_email as string) ?? null,
    }
  } catch {
    return DEFAULT_MAINTENANCE
  }
}

export async function saveMaintenanceConfig(
  patch: Partial<MaintenanceConfig>,
  updatedByEmail: string,
): Promise<MaintenanceConfig> {
  if (!isDatabaseConfigured()) return DEFAULT_MAINTENANCE
  const current = await getMaintenanceConfig()
  const next: MaintenanceConfig = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedByEmail,
  }

  await sql`
    UPDATE maintenance_state
    SET enabled = ${next.enabled},
        message = ${next.message},
        block_uploads = ${next.blockUploads},
        block_payments = ${next.blockPayments},
        block_v2 = ${next.blockV2},
        estimated_return_at = ${next.estimatedReturnAt},
        updated_at = NOW(),
        updated_by_email = ${updatedByEmail}
    WHERE id = 1
  `
  return next
}

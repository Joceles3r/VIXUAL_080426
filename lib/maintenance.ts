/**
 * VIXUAL — Maintenance Mode (V1, localStorage-only avant Stripe/Bunny)
 *
 * Module léger qui permet à l'ADMIN/PATRON d'activer un mode maintenance global
 * affichant un bandeau et bloquant les routes sensibles (paiements, uploads, V2).
 * Les ADMIN/PATRON gardent toujours accès, par sécurité.
 *
 * Stockage : localStorage côté client + cookie pour middleware si besoin futur.
 */

const STORAGE_KEY = "vixual_maintenance_v1"
export const MAINTENANCE_EVENT = "vixual-maintenance-updated"

export interface MaintenanceConfig {
  enabled: boolean
  message: string
  blockUploads: boolean
  blockPayments: boolean
  blockV2: boolean
  updatedAt: string
  updatedBy: string | null
}

export const DEFAULT_MAINTENANCE: MaintenanceConfig = {
  enabled: false,
  message: "VIXUAL est temporairement en maintenance. Nos equipes effectuent des ameliorations.",
  blockUploads: false,
  blockPayments: false,
  blockV2: false,
  updatedAt: new Date(0).toISOString(),
  updatedBy: null,
}

export function getMaintenanceConfig(): MaintenanceConfig {
  if (typeof window === "undefined") return DEFAULT_MAINTENANCE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_MAINTENANCE
    const parsed = JSON.parse(raw) as Partial<MaintenanceConfig>
    return { ...DEFAULT_MAINTENANCE, ...parsed }
  } catch {
    return DEFAULT_MAINTENANCE
  }
}

export function saveMaintenanceConfig(
  patch: Partial<MaintenanceConfig>,
  updatedByEmail: string,
): MaintenanceConfig {
  const current = getMaintenanceConfig()
  const next: MaintenanceConfig = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedByEmail,
  }
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(MAINTENANCE_EVENT))
    } catch (err) {
      console.error("[v0] saveMaintenanceConfig failed", err)
    }
  }
  return next
}

export function isMaintenanceActive(): boolean {
  return getMaintenanceConfig().enabled
}

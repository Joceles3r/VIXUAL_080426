"use client"

import { useEffect, useState } from "react"
import { Wrench } from "lucide-react"
import { getMaintenanceConfig, MAINTENANCE_EVENT, type MaintenanceConfig } from "@/lib/maintenance"

/**
 * Bandeau global affiche en haut quand le mode maintenance est actif.
 * Importe dans le RootLayout pour visibilite sur toutes les pages.
 */
export function MaintenanceBanner() {
  const [config, setConfig] = useState<MaintenanceConfig | null>(null)

  useEffect(() => {
    const refresh = () => setConfig(getMaintenanceConfig())
    refresh()
    window.addEventListener(MAINTENANCE_EVENT, refresh)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "vixual_maintenance_v1") refresh()
    }
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener(MAINTENANCE_EVENT, refresh)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  if (!config?.enabled) return null

  return (
    <div className="sticky top-0 z-[100] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-white px-4 py-2.5 shadow-lg border-b border-amber-400">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Wrench className="h-4 w-4 shrink-0 animate-pulse" />
        <p className="text-sm font-medium flex-1 text-balance">
          {config.message}
        </p>
        {config.blockUploads && (
          <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded font-bold hidden sm:inline">
            Uploads coupes
          </span>
        )}
        {config.blockPayments && (
          <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded font-bold hidden sm:inline">
            Paiements coupes
          </span>
        )}
      </div>
    </div>
  )
}

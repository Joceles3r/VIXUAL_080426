"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Tv } from "lucide-react"

export function CreatorChannelsBanner() {
  const { user } = useAuth()
  const [moduleEnabled, setModuleEnabled] = useState<boolean | null>(null)
  const [pendingCount, setPendingCount] = useState<number>(0)

  useEffect(() => {
    if (!user?.email) return
    const headers = { "x-admin-email": user.email }

    Promise.all([
      fetch("/api/admin/channels/state", { headers })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch("/api/admin/channels/requests", { headers })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([stateData, reqData]) => {
      if (stateData?.state && typeof stateData.state.isEnabled === "boolean") {
        setModuleEnabled(stateData.state.isEnabled)
      } else {
        setModuleEnabled(false)
      }
      if (Array.isArray(reqData?.requests)) {
        setPendingCount(reqData.requests.length)
      }
    })
  }, [user?.email])

  // Pendant le chargement initial, ne rien afficher pour eviter le flash
  if (moduleEnabled === null) return null

  const stateConfig = moduleEnabled
    ? {
        borderColor: "border-violet-400/60",
        bgGradient: "from-violet-900/40 via-fuchsia-900/30 to-violet-900/40",
        glow: "hover:shadow-violet-500/20",
        iconBg: "from-violet-500 to-fuchsia-600",
        iconShadow: "shadow-violet-500/30",
        badgeColor: "bg-emerald-500 text-white",
        badgeText: "Actif",
        descColor: "text-violet-200/80",
      }
    : {
        borderColor: "border-white/15",
        bgGradient: "from-slate-900/40 via-slate-800/20 to-slate-900/40",
        glow: "hover:shadow-violet-500/10",
        iconBg: "from-slate-600 to-slate-700",
        iconShadow: "shadow-slate-500/20",
        badgeColor: "bg-slate-500/30 text-white/70",
        badgeText: "Desactive",
        descColor: "text-white/55",
      }

  return (
    <Link href="/admin/creator-channels" className="block mb-6">
      <div
        className={`relative overflow-hidden rounded-2xl border-2 ${stateConfig.borderColor} bg-gradient-to-r ${stateConfig.bgGradient} p-5 transition-all group hover:shadow-xl ${stateConfig.glow}`}
      >
        <div className="relative flex items-center gap-5">
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${stateConfig.iconBg} shadow-lg ${stateConfig.iconShadow}`}
          >
            <Tv className="h-8 w-8 text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3 className="text-xl font-bold text-white">{"Chaines createurs"}</h3>
              <span
                className={`text-xs uppercase tracking-wider px-2.5 py-1 rounded-full font-bold ${stateConfig.badgeColor}`}
              >
                {stateConfig.badgeText}
              </span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">
                V3 only
              </span>
              {pendingCount > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-500 text-white">
                  {pendingCount} {pendingCount > 1 ? "demandes" : "demande"}
                </span>
              )}
            </div>
            <p className={`text-sm ${stateConfig.descColor}`}>
              {moduleEnabled
                ? "Module actif. Moderez les demandes de createurs (Trust Score >= 85) et gerez les chaines existantes."
                : "Module desactive. Cliquez pour l'activer et permettre aux createurs eligibles de demander leur chaine personnelle."}
            </p>
          </div>

          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-violet-500/20 text-violet-200 transition-transform group-hover:translate-x-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

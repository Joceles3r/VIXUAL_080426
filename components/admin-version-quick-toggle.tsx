"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { ChevronDown, Rocket, Users, Sparkles, Check } from "lucide-react"
import type { PlatformVersion } from "@/lib/platform/version"

const VERSIONS_INFO = [
  { id: "V1" as const, label: "V1 - Lancement", icon: Rocket, color: "fuchsia" },
  { id: "V2" as const, label: "V2 - Croissance", icon: Users, color: "red" },
  { id: "V3" as const, label: "V3 - Pleine puissance", icon: Sparkles, color: "emerald" },
]

export function AdminVersionQuickToggle() {
  const { user, isAdmin } = useAuth()
  const [current, setCurrent] = useState<PlatformVersion>("V3")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<PlatformVersion | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    fetch("/api/platform/version")
      .then((r) => r.json())
      .then((d) => setCurrent((d.version as PlatformVersion) ?? "V3"))
      .catch(() => {})
  }, [isAdmin])

  if (!isAdmin) return null

  const switchTo = async (version: PlatformVersion) => {
    if (version === current || loading) return
    setLoading(version)
    try {
      const res = await fetch("/api/platform/version", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user?.email ?? "",
        },
        body: JSON.stringify({ version, reason: "Bascule rapide via toggle admin" }),
      })
      if (res.ok) {
        setCurrent(version)
        setOpen(false)
        setTimeout(() => window.location.reload(), 200)
      }
    } finally {
      setLoading(null)
    }
  }

  const currentInfo = VERSIONS_INFO.find((v) => v.id === current) ?? VERSIONS_INFO[2]
  const CurrentIcon = currentInfo.icon

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
          current === "V1"
            ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/20"
            : current === "V2"
            ? "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
        }`}
        aria-label="Basculer entre les versions"
      >
        <CurrentIcon className="h-3.5 w-3.5" />
        <span>{current}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <p className="text-white/40 text-[10px] uppercase tracking-wider">
                Bascule rapide de version
              </p>
              <p className="text-white/60 text-[11px] mt-0.5">
                La page se recharge pour appliquer le theme.
              </p>
            </div>
            {VERSIONS_INFO.map((v) => {
              const Icon = v.icon
              const isCurrent = v.id === current
              const isLoading = loading === v.id
              const colorClasses =
                v.color === "fuchsia"
                  ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300"
                  : v.color === "red"
                  ? "bg-red-500/10 border-red-500/30 text-red-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              return (
                <button
                  key={v.id}
                  onClick={() => switchTo(v.id)}
                  disabled={isCurrent || isLoading}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-white/5 disabled:opacity-100 ${
                    isCurrent ? "bg-white/5" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorClasses}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-medium">{v.label}</p>
                    {isLoading && <p className="text-white/40 text-[10px]">Bascule en cours...</p>}
                    {isCurrent && !isLoading && (
                      <p className="text-white/40 text-[10px]">Version actuelle</p>
                    )}
                  </div>
                  {isCurrent && <Check className="h-4 w-4 text-emerald-400" />}
                </button>
              )
            })}
            <div className="p-2 border-t border-white/10 bg-slate-950/50">
              <a
                href="/admin/platform-state"
                className="text-white/40 text-[10px] hover:text-white/60 block text-center"
              >
                Voir les details par version
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

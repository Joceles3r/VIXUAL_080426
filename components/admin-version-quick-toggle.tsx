"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Rocket, Users, Sparkles, Loader2 } from "lucide-react"
import type { PlatformVersion } from "@/lib/platform/version"
import { invalidatePlatformVersionCache } from "@/hooks/use-platform-version"

const VERSIONS = [
  { id: "V1" as const, label: "V1", title: "Lancement", Icon: Rocket },
  { id: "V2" as const, label: "V2", title: "Croissance", Icon: Users },
  { id: "V3" as const, label: "V3", title: "Pleine puissance", Icon: Sparkles },
]

function activeClasses(id: PlatformVersion): string {
  if (id === "V1") {
    return "bg-fuchsia-500/25 border-fuchsia-400/60 text-fuchsia-100 shadow-[0_0_12px_rgba(217,70,239,0.45)]"
  }
  if (id === "V2") {
    return "bg-red-500/25 border-red-400/60 text-red-100 shadow-[0_0_10px_rgba(229,9,20,0.4)]"
  }
  return "bg-emerald-500/25 border-emerald-400/60 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
}

export function AdminVersionQuickToggle() {
  const { user, isAdmin } = useAuth()
  const [current, setCurrent] = useState<PlatformVersion>("V3")
  const [loading, setLoading] = useState<PlatformVersion | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    fetch("/api/platform/version", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const v = (d.version as PlatformVersion) ?? "V3"
        setCurrent(v)
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-version", v)
        }
      })
      .catch(() => {})
  }, [isAdmin])

  if (!isAdmin) return null

  const switchTo = async (version: PlatformVersion) => {
    if (version === current || loading) return
    setLoading(version)
    try {
      const res = await fetch("/api/platform/version", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user?.email ?? "",
        },
        body: JSON.stringify({ version, reason: "Bascule rapide via toggle admin" }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error("[v0] Bascule version refusee:", res.status, data)
        return
      }

      // 1. Theme CSS instantane
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-version", version)
      }
      // 2. Notifier tous les hooks usePlatformVersion deja montes
      invalidatePlatformVersionCache(version)
      // 3. Etat local
      setCurrent(version)
    } catch (err) {
      console.error("[v0] Erreur bascule version:", err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-900/60 border border-white/10"
      role="group"
      aria-label="Basculer entre les versions de la plateforme"
    >
      {VERSIONS.map(({ id, label, title, Icon }) => {
        const isActive = id === current
        const isLoading = loading === id
        const isDisabled = isLoading || (loading !== null && !isLoading)
        return (
          <button
            key={id}
            type="button"
            onClick={() => switchTo(id)}
            disabled={isDisabled}
            title={`${label} - ${title}${isActive ? " (actif)" : ""}`}
            aria-pressed={isActive}
            aria-label={`${label} - ${title}`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-all ${
              isActive
                ? activeClasses(id)
                : "bg-transparent border-white/5 text-white/50 hover:bg-white/5 hover:text-white/80 hover:border-white/15"
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Icon className="h-3 w-3" />
            )}
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
